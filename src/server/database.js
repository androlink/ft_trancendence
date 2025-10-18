import Database from 'better-sqlite3';
import bcrypt from "bcrypt"
import fs from 'fs';

export const dbPath = '/var/db/example.db';
export const dbLogFile = '/var/db/log.txt';

let securityKey = `diẑ6epù*pze12$*$af,zç_à87e*âpdz98°az%eç"éç'è"_bré-&à b" ée`;

/**
 * hash a string, works up to 72 Bytes due to the algorithm used
 * @param {string} str 
 * @returns {Promise<string>}
 */
export async function hashPassword(str) {
  return await bcrypt.hash(str + securityKey, 12);
}

/**
 * compare a string to a password set with hashPassword (if the pepper hasn't changed)
 * @param {string} str 
 * @returns {Promise<boolean>}
 */
export async function comparePassword(str, hashedPassword) {
  return await bcrypt.compare(str + securityKey, hashedPassword)
}

/**
 * database connection. NEVER CLOSE IT. Faster than having many connections
 */
export default new Database(dbPath,
  {
    verbose: (message) => fs.writeFileSync(dbLogFile, message + '\n', { flag: 'a' }),
  }
);

/**
 * init the db if not exists already
 */
import db from './database.js'
export async function launchDB() {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name = ?").get('users');
  if (row)
    return ;
  
  fs.unlink(dbLogFile, () => {});
  db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    bio TEXT NOT NULL DEFAULT 'Damn is that the default bio ?',
    password TEXT NOT NULL,
    admin INTEGER DEFAULT 0
  );
  `);
  db.prepare("INSERT INTO users (username, password, admin) VALUES (?, ?, ?)").run("AllMighty", await hashPassword("placeholder"), 1);
}