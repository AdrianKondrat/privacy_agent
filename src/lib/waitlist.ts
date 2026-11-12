import { randomBytes } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { consentVersion, type Region, type Variant, type Worry } from './launch';

const schemaVersion = 2;
const columns = `
  email TEXT PRIMARY KEY COLLATE NOCASE,
  variant TEXT NOT NULL,
  consent_version TEXT NOT NULL,
  joined_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  region TEXT,
  worry TEXT,
  followup_token TEXT
`;
const dayAgo = `strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')`;

let database: DatabaseSync | undefined;

function open() {
  if (database) return database;
  const path = resolve(process.env.WAITLIST_DB_PATH ?? import.meta.env.WAITLIST_DB_PATH ?? '.data/waitlist.sqlite');
  mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const connection = new DatabaseSync(path);
  try {
    connection.exec('PRAGMA busy_timeout = 3000; BEGIN IMMEDIATE');
    try {
      const version = Number(connection.prepare('PRAGMA user_version').get()?.user_version ?? 0);
      if (version < schemaVersion) {
        if (connection.prepare(`SELECT 1 FROM sqlite_schema WHERE type = 'table' AND name = 'waitlist'`).get()) {
          // Version 1 limited `variant` with a CHECK, which SQLite cannot alter in place, so copy the rows across.
          connection.exec(`
            CREATE TABLE waitlist_next (${columns}) STRICT;
            INSERT INTO waitlist_next (email, variant, consent_version, joined_at)
              SELECT email, variant, consent_version, joined_at FROM waitlist;
            DROP TABLE waitlist;
            ALTER TABLE waitlist_next RENAME TO waitlist;
          `);
        } else {
          connection.exec(`CREATE TABLE waitlist (${columns}) STRICT`);
        }
        connection.exec(`
          CREATE UNIQUE INDEX waitlist_followup ON waitlist (followup_token) WHERE followup_token IS NOT NULL;
          PRAGMA user_version = ${schemaVersion};
        `);
      }
      connection.exec('COMMIT');
    } catch (error) {
      connection.exec('ROLLBACK');
      throw error;
    }
    database = connection;
    return connection;
  } catch (error) {
    connection.close();
    throw error;
  }
}

/**
 * Saves a signup and returns a one-day token for the optional follow-up answers.
 * An email already on the list keeps its row, and the returned token then matches nothing,
 * so a response never reveals whether an address was already listed.
 */
export function saveSignup(email: string, variant: Variant) {
  const db = open();
  const token = randomBytes(16).toString('hex');
  db.exec(`UPDATE waitlist SET followup_token = NULL WHERE followup_token IS NOT NULL AND joined_at < ${dayAgo}`);
  db.prepare('INSERT INTO waitlist (email, variant, consent_version, followup_token) VALUES (?, ?, ?, ?) ON CONFLICT(email) DO NOTHING')
    .run(email, variant, consentVersion, token);
  return token;
}

export function saveAnswers(token: string, region: Region | null, worry: Worry | null) {
  open().prepare(`UPDATE waitlist SET region = ?, worry = ?, followup_token = NULL WHERE followup_token = ? AND joined_at >= ${dayAgo}`)
    .run(region, worry, token);
}
