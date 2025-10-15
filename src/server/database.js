import Database from 'better-sqlite3';

export const dbPath = '/var/www/example.db';
export function launchDB() {
  // Create a connection to the database
  const db = new Database(dbPath);
  // Execute a query to create a table
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    bio TEXT NOT NULL DEFAULT 'Damn is that the default bio ?',
    password TEXT NOT NULL
  )
  `);
  const insert = db.prepare('REPLACE INTO users (username, password) VALUES (?, ?)');
  // insert.run('geymat', 'pass');
  // insert.run('geymat;\'\"--', 'b');
  // insert.run('a', 'a');
  // insert.run('nimda', 'admin');
  // insert.run('Lorem', 'ipsum');
  db.close();
}