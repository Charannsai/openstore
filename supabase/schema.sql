-- ═══════════════════════════════════════════════════════════════════════════════
-- OpenStore — Supabase PostgreSQL Schema
-- ═══════════════════════════════════════════════════════════════════════════════

-- ─── Categories ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  slug       TEXT NOT NULL UNIQUE,
  icon       TEXT,
  color      TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Applications ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS applications (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name                 TEXT NOT NULL,
  slug                 TEXT NOT NULL UNIQUE,
  description          TEXT NOT NULL,
  long_description     TEXT,
  icon_url             TEXT,
  category_id          TEXT REFERENCES categories(id),
  license              TEXT,
  repository_url       TEXT,
  official_website     TEXT,
  documentation_url    TEXT,
  developer            TEXT,
  organization         TEXT,
  platforms            TEXT[] DEFAULT '{}',
  architectures        TEXT[] DEFAULT '{}',
  latest_version       TEXT,
  installation_methods TEXT[] DEFAULT '{}',
  difficulty           TEXT CHECK (difficulty IN ('easy', 'moderate', 'advanced')) DEFAULT 'easy',
  is_featured          BOOLEAN DEFAULT false,
  download_count       INTEGER DEFAULT 0,
  star_count           INTEGER DEFAULT 0,
  security_metadata    JSONB DEFAULT '{}',
  created_at           TIMESTAMPTZ DEFAULT now(),
  updated_at           TIMESTAMPTZ DEFAULT now()
);

-- ─── Releases ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS releases (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  version          TEXT NOT NULL,
  platform         TEXT NOT NULL,
  architecture     TEXT NOT NULL,
  download_url     TEXT NOT NULL,
  checksum         TEXT,
  signature        TEXT,
  file_size        BIGINT DEFAULT 0,
  release_date     TIMESTAMPTZ DEFAULT now(),
  release_notes    TEXT,
  source           TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── Screenshots ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_screenshots (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  url              TEXT NOT NULL,
  caption          TEXT,
  sort_order       INTEGER DEFAULT 0,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── Requirements ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS app_requirements (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  name             TEXT NOT NULL,
  type             TEXT CHECK (type IN ('runtime', 'tool', 'system', 'service')),
  version          TEXT,
  required         BOOLEAN DEFAULT true,
  check_command    TEXT,
  install_url      TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── Installation Workflows ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS installation_workflows (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  version          TEXT,
  platform         TEXT NOT NULL,
  architecture     TEXT NOT NULL,
  steps            JSONB NOT NULL DEFAULT '[]',
  requirements     TEXT[] DEFAULT '{}',
  verification     JSONB DEFAULT '[]',
  rollback         JSONB DEFAULT '[]',
  source           TEXT,
  generated_by     TEXT CHECK (generated_by IN ('manual', 'ai', 'maintainer')) DEFAULT 'manual',
  validated        BOOLEAN DEFAULT false,
  created_at       TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── Installation Jobs ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS installation_jobs (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  workflow_id      UUID REFERENCES installation_workflows(id),
  device_id        UUID,
  status           TEXT CHECK (status IN ('pending', 'running', 'paused', 'completed', 'failed', 'cancelled')) DEFAULT 'pending',
  current_step     INTEGER DEFAULT 0,
  error            TEXT,
  logs             JSONB DEFAULT '[]',
  started_at       TIMESTAMPTZ DEFAULT now(),
  completed_at     TIMESTAMPTZ
);

-- ─── Devices ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform         TEXT,
  os_version       TEXT,
  architecture     TEXT,
  hostname         TEXT,
  agent_version    TEXT,
  last_seen        TIMESTAMPTZ DEFAULT now(),
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── Installed Apps (local tracking, synced to cloud) ────────────────────────
CREATE TABLE IF NOT EXISTS installed_apps (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id   UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  device_id        UUID REFERENCES devices(id),
  version          TEXT,
  install_method   TEXT,
  install_path     TEXT,
  status           TEXT CHECK (status IN ('running', 'stopped', 'error', 'updating')) DEFAULT 'stopped',
  local_url        TEXT,
  installed_at     TIMESTAMPTZ DEFAULT now(),
  updated_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── Activity Log ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activity_log (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id        UUID REFERENCES devices(id),
  type             TEXT CHECK (type IN ('install', 'update', 'uninstall', 'launch', 'stop', 'error')),
  application_name TEXT,
  message          TEXT,
  details          TEXT,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_applications_category ON applications(category_id);
CREATE INDEX IF NOT EXISTS idx_applications_slug ON applications(slug);
CREATE INDEX IF NOT EXISTS idx_applications_featured ON applications(is_featured) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_releases_app ON releases(application_id);
CREATE INDEX IF NOT EXISTS idx_screenshots_app ON app_screenshots(application_id);
CREATE INDEX IF NOT EXISTS idx_requirements_app ON app_requirements(application_id);
CREATE INDEX IF NOT EXISTS idx_workflows_app ON installation_workflows(application_id);
CREATE INDEX IF NOT EXISTS idx_jobs_app ON installation_jobs(application_id);
CREATE INDEX IF NOT EXISTS idx_installed_device ON installed_apps(device_id);

-- ─── Full Text Search ────────────────────────────────────────────────────────
ALTER TABLE applications ADD COLUMN IF NOT EXISTS search_vector tsvector;

CREATE OR REPLACE FUNCTION update_search_vector()
RETURNS trigger AS $$
BEGIN
  NEW.search_vector := to_tsvector('english',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.description, '') || ' ' ||
    coalesce(NEW.long_description, '') || ' ' ||
    coalesce(NEW.developer, '') || ' ' ||
    coalesce(NEW.organization, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trig_update_search_vector ON applications;
CREATE TRIGGER trig_update_search_vector
  BEFORE INSERT OR UPDATE ON applications
  FOR EACH ROW EXECUTE FUNCTION update_search_vector();

CREATE INDEX IF NOT EXISTS idx_applications_search ON applications USING GIN(search_vector);
