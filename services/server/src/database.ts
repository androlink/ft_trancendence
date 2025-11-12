import Database from 'better-sqlite3';
import bcrypt from "bcrypt"
import fs from 'fs';

export const dbPath = '/var/db/database.db';
export const dbLogFile = '/var/db/log.txt';

/**
 * hash a string, works up to 72 Bytes due to the algorithm used
 */
export async function hashPassword(str: string): Promise<string> {
  return await bcrypt.hash(str + process.env.PEPPER_KEY_PASSWORDS, 12);
}

/**
 * compare a string to a password set with hashPassword (if the pepper hasn't changed)
 */
export async function comparePassword(str: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(str + process.env.PEPPER_KEY_PASSWORDS, hashedPassword)
}

/**
 * database connection. NEVER CLOSE IT. Faster than having many connections
 */
export default new Database(dbPath,
  {
    verbose: (message) => fs.writeFileSync(dbLogFile, message + '\n', { flag: 'a' }),
  }
);

import db from './database.js'
/**
 * init the db if not exists already
 */
export async function launchDB() {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?")
    .get('users');
  if (row)
    return ;
  
  fs.unlink(dbLogFile, () => {});
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    bio TEXT NOT NULL DEFAULT 'Damn is that the default bio ?',
    pfp TEXT NOT NULL DEFAULT 'default.jpg',
    password TEXT NOT NULL,
    admin INTEGER DEFAULT 0
  );
  CREATE UNIQUE INDEX idx_username_lower ON users (lower(username));
  CREATE TABLE user_blocks (
    rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    blocker_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blocked_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (blocker_id, blocked_id)
  );
  CREATE INDEX idx_user_blocks_blocked ON user_blocks (blocker_id, blocked_id);
  CREATE TABLE friend_requests (
    rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    requester INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    requested INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (requester, requested)
  );
  CREATE INDEX idx_friend_requested ON friend_requests (requester, requested);
  CREATE TABLE friends (
    rowid INTEGER PRIMARY KEY AUTOINCREMENT,
    friend_one INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    friend_two INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (friend_one, friend_two)
  );
  CREATE INDEX idx_friends ON friends (friend_one, friend_two);
  CREATE TABLE history_game (
    game INTEGER PRIMARY KEY AUTOINCREMENT,
    time DATETIME NOT NULL DEFAULT(DATETIME('now')),
    winner INTEGER NOT NULL,
    loser INTEGER NOT NULL
  );
  `);
  const res = db.prepare("INSERT INTO users (username, password, bio, admin) VALUES (?, ?, ?, ?)")
    .run("AllMighty", await hashPassword(process.env.ADMIN_PASSWORD), "ADMIN", 1);
}