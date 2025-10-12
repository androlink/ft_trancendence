import Database from 'better-sqlite3';

export const dbPath = '/var/www/example.db';
export function LaunchDB() {
    // Create a connection to the database
    const db = new Database(dbPath);
    // Execute a query to create a table
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        username TEXT NOT NULL PRIMARY KEY,
        bio TEXT NOT NULL,
        password TEXT NOT NULL
    )
    `);
    const insert = db.prepare('REPLACE INTO users (username, bio, password) VALUES (?, ?, ?)');
    insert.run('geymat', 'the guy coding this', 'pass');
    insert.run('geymat;\'\"--', 'it looks like we are sql injection safe. better-sqlite3 is GREAT', 'b');
    insert.run('a', 'an account just to say hello', 'a');
    insert.run('nimda', 'My password is \'admin\'', 'admin');
    db.close();
}