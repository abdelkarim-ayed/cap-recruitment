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
}] as const;
