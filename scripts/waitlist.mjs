import { resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const [command, value] = process.argv.slice(2);
if (!['count', 'answers', 'export', 'remove'].includes(command) || (command === 'remove' && !value?.includes('@'))) {
  console.error('Usage: npm run waitlist -- count | answers | export | remove you@example.com');
  process.exit(1);
}
const path = resolve(process.env.WAITLIST_DB_PATH ?? '.data/waitlist.sqlite');
let db;
try {
  db = new DatabaseSync(path, { readOnly: command !== 'remove' });
  db.exec('PRAGMA busy_timeout = 3000');
  // A database created before the follow-up questions gains these columns on its next signup.
  const hasAnswers = Boolean(db.prepare(`SELECT 1 FROM pragma_table_info('waitlist') WHERE name = 'region'`).get());
  const tally = (column) => {
    for (const row of db.prepare(`SELECT coalesce(${column}, 'not answered') AS answer, count(*) AS signups FROM waitlist GROUP BY ${column} ORDER BY signups DESC`).all()) {
      console.log('  ' + row.answer + ': ' + row.signups);
    }
  };
  if (command === 'count') {
    for (const row of db.prepare('SELECT variant, count(*) AS signups FROM waitlist GROUP BY variant').all()) {
      console.log(row.variant + ': ' + row.signups);
    }
    console.log('total: ' + db.prepare('SELECT count(*) AS count FROM waitlist').get().count);
  } else if (command === 'answers') {
    if (!hasAnswers) {
      console.log('No answers yet. This database predates the follow-up questions.');
    } else {
      console.log('Where people live');
      tally('region');
      console.log('What worries them most');
      tally('worry');
    }
  } else if (command === 'export') {
    const fields = 'email, variant, consent_version, joined_at' + (hasAnswers ? ', region, worry' : '');
    for (const row of db.prepare(`SELECT ${fields} FROM waitlist ORDER BY joined_at`).iterate()) {
      console.log(JSON.stringify(row));
    }
  } else {
    const result = db.prepare('DELETE FROM waitlist WHERE email = ? COLLATE NOCASE').run(value.trim());
    console.log(result.changes ? 'Removed one signup.' : 'No matching signup.');
  }
} catch {
  console.error('Could not open or update the waitlist database. Check WAITLIST_DB_PATH and file permissions.');
  process.exitCode = 1;
} finally {
  db?.close();
}
