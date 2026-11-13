export const applicationMigrations = [{
  id: '001_vacancies',
  sql: `CREATE TABLE vacancies (
    id uuid PRIMARY KEY,
    owner_id text NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
    status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','closed')),
    revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
    title text NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
    description text NOT NULL CHECK (length(description) BETWEEN 1 AND 20000),
    location text,
    form_definition jsonb NOT NULL,
    processing_definition jsonb NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE INDEX vacancies_listing ON vacancies (created_at DESC, id DESC);
  CREATE INDEX vacancies_public_listing ON vacancies (created_at DESC, id DESC) WHERE status = 'published';`,
}, {
  id: '002_applications_documents',
  sql: `CREATE TABLE applications (
    id uuid PRIMARY KEY,
    vacancy_id uuid NOT NULL REFERENCES vacancies(id) ON DELETE RESTRICT,
    candidate_id text NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
    candidate_identity jsonb NOT NULL,
    vacancy_snapshot jsonb NOT NULL,
    answers jsonb NOT NULL,
    stage text NOT NULL DEFAULT 'received' CHECK (stage IN ('received','review_ready','preselected','interview','offer','hired')),
    processing_state text NOT NULL CHECK (processing_state IN ('pending','not_requested')),
    submitted_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT applications_candidate_vacancy_unique UNIQUE(candidate_id,vacancy_id)
  );
  CREATE INDEX applications_candidate_listing ON applications(candidate_id,submitted_at DESC,id DESC);
  CREATE INDEX applications_vacancy_listing ON applications(vacancy_id,submitted_at DESC,id DESC);
  CREATE TABLE stored_files (
    id uuid PRIMARY KEY,
    storage_ref text NOT NULL UNIQUE,
    content_hash text NOT NULL CHECK (content_hash ~ '^[a-f0-9]{64}$'),
    byte_count integer NOT NULL CHECK (byte_count BETWEEN 1 AND 10485760),
    filename text NOT NULL,
    media_type text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
  );
  CREATE TABLE application_documents (
    id uuid PRIMARY KEY,
    application_id uuid NOT NULL REFERENCES applications(id) ON DELETE RESTRICT,
    input_id text NOT NULL,
    stored_file_id uuid NOT NULL UNIQUE REFERENCES stored_files(id) ON DELETE RESTRICT,
    UNIQUE(application_id,input_id)
  );`,
}, {
  id: '003_processing_review',
  sql: `ALTER TABLE applications DROP CONSTRAINT applications_processing_state_check;
  ALTER TABLE applications ADD CONSTRAINT applications_processing_state_check CHECK (processing_state IN ('pending','not_requested','processing','completed','completed_with_errors'));
  ALTER TABLE applications ADD COLUMN processing_token uuid, ADD COLUMN processing_lease_until timestamptz, ADD COLUMN processing_next_at timestamptz;
  ALTER TABLE applications ADD COLUMN review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending','in_review','completed')),
    ADD COLUMN review_revision integer NOT NULL DEFAULT 1, ADD COLUMN reviewed_by text REFERENCES "user"(id) ON DELETE SET NULL, ADD COLUMN reviewed_at timestamptz;
  CREATE TABLE application_tasks (
    application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    task_id text NOT NULL, source_input_id text NOT NULL, output_key text NOT NULL, args jsonb NOT NULL,
    fixture_key text, status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
    attempts integer NOT NULL DEFAULT 0, retryable boolean NOT NULL DEFAULT false,
    result jsonb, provenance jsonb, reason text, updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(application_id,task_id)
  );
  CREATE TABLE extraction_corrections (
    application_id uuid NOT NULL, task_id text NOT NULL, value jsonb NOT NULL,
    corrected_by text REFERENCES "user"(id) ON DELETE SET NULL, corrected_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(application_id,task_id), FOREIGN KEY(application_id,task_id) REFERENCES application_tasks(application_id,task_id) ON DELETE CASCADE
  );`,
}, {
  id: '004_review_saved_at',
  sql: `ALTER TABLE applications ADD COLUMN review_updated_at timestamptz;
    UPDATE applications SET review_updated_at=reviewed_at WHERE reviewed_at IS NOT NULL;`,
}, {
  id: '005_no_extraction_review',
  sql: `UPDATE applications SET review_status='completed',review_revision=review_revision+1
    WHERE jsonb_array_length(vacancy_snapshot->'processingDefinition'->'tasks')=0 AND review_status<>'completed';`,
}, {
  id: '006_interviews_inbox',
  sql: `ALTER TABLE applications DROP CONSTRAINT applications_stage_check;
    ALTER TABLE applications ADD CONSTRAINT applications_stage_check CHECK(stage IN ('received','review_ready','preselected','interview','offer','hired','not_selected'));
    ALTER TABLE applications ADD COLUMN flow_revision integer NOT NULL DEFAULT 1;
    ALTER TABLE applications ADD CONSTRAINT applications_id_vacancy_unique UNIQUE(id,vacancy_id);
    ALTER TABLE vacancies ADD COLUMN interview_revision integer NOT NULL DEFAULT 1;
    CREATE TABLE interview_steps (
      id uuid PRIMARY KEY, vacancy_id uuid NOT NULL REFERENCES vacancies(id) ON DELETE RESTRICT,
      position integer NOT NULL CHECK(position BETWEEN 0 AND 9), name text NOT NULL CHECK(length(name) BETWEEN 1 AND 100), instructions text NOT NULL DEFAULT '',
      UNIQUE(vacancy_id,position), UNIQUE(id,vacancy_id)
    );
    CREATE TABLE interviews (
      id uuid PRIMARY KEY, vacancy_id uuid NOT NULL, application_id uuid NOT NULL, step_id uuid NOT NULL,
      interviewer_id text NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
      created_by text NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
      updated_by text NOT NULL REFERENCES "user"(id) ON DELETE RESTRICT,
      revision integer NOT NULL DEFAULT 1,
      starts_at timestamptz NOT NULL, duration_minutes integer NOT NULL CHECK(duration_minutes IN (30,60,90,120)),
      timezone text NOT NULL, meeting text NOT NULL CHECK(length(meeting) BETWEEN 1 AND 1000),
      status text NOT NULL DEFAULT 'scheduled' CHECK(status IN ('scheduled','completed','cancelled')),
      notes text, score integer CHECK(score BETWEEN 0 AND 10), outcome text CHECK(outcome IN ('pass','fail')), submitted_at timestamptz,
      cancellation_cause jsonb, change_cause jsonb NOT NULL, scheduling_issue text, issue_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
      UNIQUE(application_id,step_id),
      FOREIGN KEY(application_id,vacancy_id) REFERENCES applications(id,vacancy_id) ON DELETE RESTRICT,
      FOREIGN KEY(step_id,vacancy_id) REFERENCES interview_steps(id,vacancy_id) ON DELETE RESTRICT,
      CHECK((status='completed' AND outcome IS NOT NULL AND notes IS NOT NULL AND submitted_at IS NOT NULL) OR (status<>'completed' AND outcome IS NULL AND submitted_at IS NULL)),
      CHECK((status='cancelled') = (cancellation_cause IS NOT NULL))
    );
    CREATE INDEX interviews_agenda ON interviews(interviewer_id,starts_at,id);
    CREATE INDEX interviews_application ON interviews(application_id);
    CREATE TABLE inbox_notifications (
      id uuid PRIMARY KEY, recipient_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      interview_id uuid NOT NULL REFERENCES interviews(id) ON DELETE RESTRICT,
      kind text NOT NULL CHECK(kind IN ('assigned','rescheduled','cancelled','scheduling_issue','feedback')),
      title text NOT NULL, body text NOT NULL, cause jsonb NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz
    );
    CREATE INDEX inbox_recipient ON inbox_notifications(recipient_id,created_at DESC,id);
    CREATE INDEX inbox_retention ON inbox_notifications(read_at) WHERE read_at IS NOT NULL;`,
}, {
  id: '007_screening_decisions',
  sql: `ALTER TABLE applications ADD COLUMN screening_decision text CHECK(screening_decision IN ('preselected','rejected')),
    ADD COLUMN screening_reason text CHECK(length(screening_reason)<=2000),
    ADD COLUMN screening_by text REFERENCES "user"(id) ON DELETE SET NULL, ADD COLUMN screening_at timestamptz;
    CREATE TABLE screening_notifications (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      application_id uuid NOT NULL UNIQUE REFERENCES applications(id) ON DELETE RESTRICT,
      recipient_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      decision text NOT NULL CHECK(decision IN ('preselected','rejected')),
      title text NOT NULL, body text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now(), read_at timestamptz
    );
    CREATE INDEX screening_notifications_recipient ON screening_notifications(recipient_id,created_at DESC,id);`,
}, {
  id: '008_review_release',
  sql: `ALTER TABLE applications ADD COLUMN processing_released_at timestamptz,
    ADD COLUMN processing_released_by text REFERENCES "user"(id) ON DELETE SET NULL;
    ALTER TABLE applications ADD CONSTRAINT applications_release_attribution CHECK(processing_released_at IS NOT NULL OR processing_released_by IS NULL);
    ALTER TABLE application_tasks ADD COLUMN failure_category text CHECK(failure_category IN ('ordinary_terminal','operational','uncertain','unclassified'));`,
}, {
  id: '009_cv_request_attempts',
  // Source-only safety checkpoint. No extraction runner is enabled and no
  // recruitment data/history or spending counters are rewritten/reset.
  sql: `CREATE TABLE cv_request_attempts (
    mode text NOT NULL CHECK(mode IN ('fixture','live')),
    request_hash text NOT NULL CHECK(request_hash ~ '^[a-f0-9]{64}$'),
    attempt_id uuid NOT NULL UNIQUE,
    application_id uuid NOT NULL, task_id text NOT NULL, processing_token uuid NOT NULL,
    state text NOT NULL CHECK(state IN ('prepared','send_started','succeeded','retryable_unsent','terminal','uncertain')),
    attempts integer NOT NULL DEFAULT 0 CHECK(attempts BETWEEN 0 AND 3),
    retry_after timestamptz, created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
    PRIMARY KEY(mode,request_hash),
    CHECK((state='retryable_unsent') = (retry_after IS NOT NULL))
  );`,
}, {
  id: '010_cv_fields_publication',
  sql: `ALTER TABLE vacancies ADD COLUMN extraction_reference_date date;
    CREATE TABLE extraction_field_corrections (
      application_id uuid NOT NULL, task_id text NOT NULL, question_id text NOT NULL,
      value jsonb NOT NULL, corrected_by text REFERENCES "user"(id) ON DELETE SET NULL,
      corrected_at timestamptz NOT NULL DEFAULT now(),
      PRIMARY KEY(application_id,task_id,question_id),
      FOREIGN KEY(application_id,task_id) REFERENCES application_tasks(application_id,task_id) ON DELETE CASCADE
    );`,
}] as const;
