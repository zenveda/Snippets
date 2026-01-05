import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'snippets.db'));

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    team_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS snippets (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    shortcut TEXT,
    category TEXT,
    owner_id TEXT NOT NULL,
    scope TEXT NOT NULL DEFAULT 'personal',
    status TEXT NOT NULL DEFAULT 'draft',
    version INTEGER NOT NULL DEFAULT 1,
    tags TEXT,
    usage_count INTEGER DEFAULT 0,
    last_used_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (owner_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS snippet_versions (
    id TEXT PRIMARY KEY,
    snippet_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    name TEXT NOT NULL,
    body TEXT NOT NULL,
    shortcut TEXT,
    category TEXT,
    tags TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (snippet_id) REFERENCES snippets(id),
    UNIQUE(snippet_id, version)
  );

  CREATE INDEX IF NOT EXISTS idx_snippets_owner ON snippets(owner_id);
  CREATE INDEX IF NOT EXISTS idx_snippets_scope ON snippets(scope);
  CREATE INDEX IF NOT EXISTS idx_snippets_status ON snippets(status);
  CREATE INDEX IF NOT EXISTS idx_snippets_shortcut ON snippets(shortcut);
  CREATE INDEX IF NOT EXISTS idx_snippets_category ON snippets(category);
  CREATE INDEX IF NOT EXISTS idx_snippet_versions_snippet ON snippet_versions(snippet_id);
`);

export default db;
