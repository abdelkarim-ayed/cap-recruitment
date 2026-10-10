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
}] as const;
