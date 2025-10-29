
import db, { hashPassword, comparePassword } from "./database";
// response format for that page :
// {
//   success: boolean,
//   message: string,
// }
// if you reuse code for other page, take it into consideration

export async function loginRoutes(fastifyInstance) {

  /**
   * treat the element you want based on a collection of requirements decided arbitrary in the scope
   * @param requiredFields ex : ["username", "biography", "password"]
   * @param presenceOnly setting it as true will stop the checks at the presence in the body
   * @returns a function used for a hook
   */
  function checkBodyInput(requiredFields, presenceOnly = false) {
    let conditions = {
      username: {minLength: 3, maxLength: 20, alphanumeric_: true },
      biography: {maxLength: 3000 },
      password: {minLength: 4, maxByteLength: 42 },
    }
    return async function (req, reply) {
      for (const field of requiredFields) {
        if (!Object.hasOwn(req.body, field))
          return reply.code(401).send({success: false, message: `query ${field} missing`});
        if (presenceOnly) 
          continue ;
        if (!Object.hasOwn(conditions, field)) // during development only. Should never happen anyway
          return reply.code(500).send("That input is not in our conditions, no idea how to parse it. Our fault LOL");
        if (typeof req.body[field] !== "string")
          return reply.code(401).send({success: false, message: `${field} must be a string`});
        if (conditions[field].minLength && req.body[field].length < conditions[field].minLength)
          return reply.code(401).send({success: false, message: `${field} must be at least ${conditions[field].minLength} chars long`});
        if (conditions[field].maxLength && req.body[field].length > conditions[field].maxLength)
          return reply.code(401).send({success: false, message: `${field} must be at most ${conditions[field].maxLength} chars long`});
        if (conditions[field].maxByteLength && Buffer.byteLength(req.body[field]) > conditions[field].maxByteLength)
          return reply.code(401).send({success: false, message: `${field} must be at most ${conditions[field].maxLength} bytes long`});
        if (conditions[field].alphanumeric_ && !req.body[field].match("^[a-zA-Z0-9_]*$"))
          return reply.code(401).send({success: false, message: `${field} can have only letters, digits and underscores`});
      }
    };
  }

  /**
   * Send back an error 415 if there is no header about Content-Type x-www-form-urlencoded
   */
  async function needFormBody(req, reply) {
    if (!("content-type" in req.headers)) {
      return reply.code(415).send({success: false, message: `Content-Type not found in a ${req.method} request`});
    }
    if (!req.headers["content-type"].startsWith("application/x-www-form-urlencoded")){
      return reply.code(415).send({success: false, message: 
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
      const row = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.id);
      if (!row) {
        reply.header('x-authenticated', false);
        return reply.code(401).send({success: false, message: "You are not present in the db, got disconnected"});
      }
      req.user.username = row.username;
      req.user.admin = row.admin;
      req.user.password = row.password;
      req.user.bio = row.bio;
      const token = fastifyInstance.jwt.sign({id: req.user.id},  {expiresIn: '15m'});
      reply.header('x-authenticated', token);
    } catch (err) {
      reply.header('x-authenticated', false);
      return reply.code(403).send({success: false, message: err.message});
    }
  };

  fastifyInstance.post("/register",
    {
      preValidation: checkBodyInput(["username", "password"]),
    },
    async (req, reply) => {
      const username = req.body.username;
      const password = await hashPassword(req.body.password);
      const res = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)').run(username, password);
      if (res.changes === 0) {
        // the only error that makes sense now is account duplicates
        return reply.code(409).send({success: false, message: `${username} already exists `});
      }
      const token = fastifyInstance.jwt.sign({id: res.lastInsertRowid},  {expiresIn: '15m'});
      return reply.header("x-authenticated", token)
        .send({success: true, message: `welcome ${username}`});
  });

  fastifyInstance.post("/login",
    {
      onRequest: [needFormBody],
      preValidation: checkBodyInput(["username", "password"], true),
    },
    async (req, reply) => {
      const username = req.body.username;
      const password = req.body.password;
      let row = db.prepare("SELECT id, password FROM users WHERE username = ?").get(username);
      if (!row) {
        return reply.code(401).send({success: false, message: `no account with username "${username}"`});
      }
      if (!await comparePassword(password, row.password))
        return reply.code(401).send({success: false, message: "wrong password"});
      const token = fastifyInstance.jwt.sign({id: row.id},  {expiresIn: '15m'});
      return reply.header("x-authenticated", token)
        .send({success: true, message: `welcome ${username}`});
  });

  fastifyInstance.post("/logout", async (req, reply) => {
    return reply.header("x-authenticated", false).send({success: true, message: "We can't have you forever"});
  });

  fastifyInstance.put("/update",
    {
      onRequest: [identifyUser, needFormBody],
      preValidation: checkBodyInput(["username", "biography"]),
    },
    async (req, reply) => {
      const username = req.body.username; 
      const bio = req.body.biography;
      const row = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
      if (row && row.id != req.user.id) {
          return reply.code(409).send({success: 0, message: `${username} is already taken... Jealous ?`});
      }
      const res = db.prepare("UPDATE or IGNORE users SET username = ?, bio = ? WHERE id = ?").run(username, bio, req.user.id);
      if (!res.changes) // might happen if username taken between two requests, or if the id is not linked to an account (aka user account deleted)
        return reply.code(403).send({success: false, message: "The database doesn't feel like it"});
      return reply.send({success: true, message: ":D"});
  });

  fastifyInstance.put("/password",
    {
      onRequest: [identifyUser, needFormBody],
      preValidation: checkBodyInput(["password"]),
    },
    async (req, reply) => {
      const password = await hashPassword(req.body.password);
      const res = db.prepare("UPDATE users SET password = ? WHERE id = ?").run(password, req.user.id);
      if (!res.changes) 
        return reply.code(403).send({success: false, message: "The database doesn't feel like it"});
      return reply.send({success: true, message: ":D"});
  });


  fastifyInstance.delete("/delete",
    {
      onRequest: [identifyUser, needFormBody],
      preValidation: checkBodyInput(["username"], true),
    },
    async (req, reply) => {
      if (req.user.admin)
        return reply.code(403).send({success: false, message: "No! Stop!! You're admin"});
      if (req.body.username != req.user.username)
        return reply.code(401).send({success: false, message: "Nope that's not your username"});
      const res = db.prepare("DELETE FROM users WHERE id = ?").run(req.user.id);
      if (!res.changes) // should not happen
        return reply.code(401).send({success: false, message: "DB refused, sorry"});
      // Not a 204 No content because 204 should not have a body and the front wants to have success
      return reply.header("x-authenticated", false).send({success: true, message: "Goodbye :D"});
  });
}
