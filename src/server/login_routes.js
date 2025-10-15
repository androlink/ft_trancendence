
import Database from "better-sqlite3";
import { dbPath } from "./database.js";



export async function loginRoutes(fastifyInstance) {

  /**
   * treat the element you want based on a collection of requirements decided arbitrary in the scope
   * @param requiredFields ex : ["username", "biography, password]
   * @param presenceOnly setting it as true will stop the checks at the presence in the body  
   * @returns a function used for a hook
   */
  function checkBodyInput(requiredFields, presenceOnly = false) {
    let conditions = {
      username: {minLength: 3, maxLength: 20, alphanumeric_: true },
      biography: {maxLength: 2000 },
      password: {minLength: 4},
    }
    return async function (req, reply) {
      for (const field of requiredFields) {
        if (!Object.hasOwn(conditions, field))
          return reply.code(500).send("That input is not in our conditions, no idea how to parse it");
        if (!Object.hasOwn(req.body, field))
          return reply.code(401).send({success: false, reason: `query ${field} missing`});
        if (presenceOnly) 
          continue ;
        if (typeof req.body[field] !== "string")
          return reply.code(401).send({success: false, reason: `${field} must be a string`});
        if (conditions[field].minLength && req.body[field].length < conditions[field].minLength)
          return reply.code(401).send({success: false, reason: `${field} must be at least ${conditions[field].minLength} chars long`});
        if (conditions[field].maxLength && req.body[field].length > conditions[field].maxLength)
          return reply.code(401).send({success: false, reason: `${field} must be at most ${conditions[field].maxLength} chars long`});
        if (conditions[field].alphanumeric_ && !req.body[field].match("^[a-zA-Z0-9_]*$"))
          return reply.code(401).send({success: false, reason: `${field} can have only letters, digits and underscores`});
      }
    };
  }

  /**
   * Send back an error 415 if there is no header about Content-Type x-www-form-urlencoded
   */
  async function needFormBody(req, reply) {
    if (!("content-type" in req.headers)) {
      return reply.code(415).send({success: false, reason: `Content-Type not found in a ${req.method} request`});
    } 
    if (!req.headers["content-type"].startsWith("application/x-www-form-urlencoded")){
      return reply.code(415).send({success: false, reason: 
        `Expected 'application/x-www-form-urlencoded' Content-Type for ${req.method} on ${req.url}.`});
    }
  };

  /**
   * identify who is the user based on JWT.
   * Uses cookies, meaning can be set as soon as onRequestHook,
   * should be used early to access account.
   * 
   * WARNING: it will send 401 Unauthorized and stop treating request on error.
   */
  async function identifyUser(req, reply) {
    try {
      await req.jwtVerify();
    } catch (err) {
      return reply.code(401).send("You need to be connected");
    }
  };

  fastifyInstance.post("/login",
    {
      onRequest: [needFormBody],
      preValidation: checkBodyInput(["username", "password"], true),
    },
    async (req, reply) => {
      const username = req.body.username;
      const password = req.body.password; // add security soon and everything
      const db = new Database(dbPath);
      let row = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
      if (!row) {
        row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
        db.close();
        return reply.send({success: false, reason: row ? "wrong password" : `no account with username "${username}"`});
      }
      db.close();
      const token = fastifyInstance.jwt.sign({id: row.id},  {expiresIn: '15m'});
      const cookiesOptions =  {path: '/', httpOnly: true, secure: true, sameSite: "Strict", maxAge: 15 * 60};
      return reply.header("x-authenticated", true)
        .setCookie("account", token, cookiesOptions)
        .send({success: true, reason: `welcome ${username}`});
  });

  fastifyInstance.post("/register",
    {
      preValidation: checkBodyInput(["username", "password"]),
    },
    async (req, reply) => {
      const username = req.body.username;
      const password = req.body.password; // add security soon and everything
      const db = new Database(dbPath);
      const res = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)').run(username, password);
      db.close();
      if (res.changes === 0){
        return reply.code(400).send({success: false, reason: `propably another account named ${username}. I haven't really checked`});
      }
      const token = fastifyInstance.jwt.sign({id: res.lastInsertRowid},  {expiresIn: '15m'});
      const cookiesOptions =  {path: '/', httpOnly: true, secure: true, sameSite: "Strict", maxAge: 15 * 60};
      return reply.header("x-authenticated", true)
        .setCookie("account", token, cookiesOptions)
        .send({success: true, reason: `welcome ${username}`});
  });

  fastifyInstance.post("/update",
    {
      onRequest: [identifyUser, needFormBody],
      preValidation: checkBodyInput(["username", "biography"]),
    },
    async (req, reply) => {
      const username = req.body.username; 
      const bio = req.body.biography;
      const db = new Database(dbPath);
      const res = db.prepare("UPDATE users SET username = ?, bio = ? WHERE id = ?").run(username, bio, req.user.id);
      db.close();
      return reply.send({success: res.changes !== 0, reason: res.changes !== 0 ? ":D" : "Databse didn't succeed"});
  });

  fastifyInstance.post("/password",
    {
      onRequest: [identifyUser, needFormBody],
      preValidation: checkBodyInput(["password"]),
    },
    async (req, reply) => {
      const password = req.body.password; // need to add security on the password obviously
      const db = new Database(dbPath);
      const res = db.prepare("UPDATE users SET password = ? WHERE id = ?").run(password, req.user.id);
      db.close();
      return reply.send({success: res.changes !== 0, reason: res.changes !== 0 ? ":D" : "Databse didn't succeed"});
  });

  fastifyInstance.post("/logout", async (req, reply) => {
    reply.clearCookie("account");
    return reply.header("x-authenticated", false).send("Goodbye");
  });
}
