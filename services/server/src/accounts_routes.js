
import { assetsPath } from "./config.js";
import db, { hashPassword, comparePassword } from "./database.js";
import MSG from "./messages_collection.js";
import fs from 'fs'
import { pipeline } from "stream/promises";
import { fileTypeFromBuffer } from 'file-type';


// response format for that page :
// {
//   success: boolean,
//   message: {[key:string]:string | {[language:string]:string}}
// }
// setting message as a plain string will set have all the language display the same
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
          return reply.code(401).send({success: false, message: MSG.MUST_BE_STR(field)});
        if (conditions[field].minLength && req.body[field].length < conditions[field].minLength)
          return reply.code(401).send({success: false, message: MSG.MIN_STR_LENGTH(field, conditions[field].minLength)});
        if (conditions[field].maxLength && req.body[field].length > conditions[field].maxLength)
          return reply.code(401).send({success: false, message: MSG.MAX_STR_LENGTH(field, conditions[field].maxLength)});
        if (conditions[field].maxByteLength && Buffer.byteLength(req.body[field]) > conditions[field].maxByteLength)
          return reply.code(401).send({success: false, message: MSG.MAX_BYTE_LENGTH(field, conditions[field].maxByteLength)});
        if (conditions[field].alphanumeric_ && !req.body[field].match("^[a-zA-Z0-9_]*$"))
          return reply.code(401).send({success: false, message: MSG.ALPHANUMERIC_(field)});
      }
    };
  }

  /**
   * Send back an error 415 if there is no header about Content-Type x-www-form-urlencoded
   */
  async function needFormBody(req, reply) {
    if (!("content-type" in req.headers)) {
      return reply.code(415).send({success: false, message: MSG.EXPECTED_CONTENT_TYPE(req.method)});
    }
    if (!req.headers["content-type"].startsWith("application/x-www-form-urlencoded")){
      return reply.code(415).send({success: false, message: MSG.EXPECTED_FORMBODY(req.method, req.url)});
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
      const row = db.prepare("SELECT * FROM users WHERE id = ? -- identifyUser from accounts_routes.js").get(req.user.id);
      if (!row) {
        reply.clearCookie("account");
        reply.header('x-authenticated', false);
        return reply.code(401).send({success: false, message: MSG.NOT_IN_DB()});
      }
      req.user.username = row.username;
      req.user.admin = row.admin;
      req.user.password = row.password;
      req.user.bio = row.bio;
      const token = fastifyInstance.jwt.sign({id: req.user.id},  {expiresIn: '15m'});
      reply.setCookie('account', token, {path: '/', httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 15 * 60, });
      reply.header('x-authenticated', true);
    } catch (err) {
      reply.header('x-authenticated', false);
      return reply.code(403).send({success: false, message: MSG.NOT_RECOGNIZED()});
    }
  };

  fastifyInstance.post("/register",
    {
      preValidation: checkBodyInput(["username", "password"]),
    },
    async (req, reply) => {
      const username = req.body.username;
      const password = await hashPassword(req.body.password);
      const res = db.prepare('INSERT OR IGNORE INTO users (username, password) VALUES (?, ?) -- register route').run(username, password);
      if (res.changes === 0) {
        // the only error that makes sense now is account duplicates
        return reply.code(409).send({success: false, message: MSG.USERNAME_TAKEN(username)});
      }
      const token = fastifyInstance.jwt.sign({id: res.lastInsertRowid},  {expiresIn: '15m'});
      const cookiesOptions =  {path: '/', httpOnly: true, secure: true, sameSite: "Strict", maxAge: 15 * 60};
      return reply.header("x-authenticated", true)
        .setCookie("account", token, cookiesOptions)
        .send({success: true, message: MSG.WELCOME_USERNAME(username)});
  });

  fastifyInstance.post("/login",
    {
      onRequest: [needFormBody],
      preValidation: checkBodyInput(["username", "password"], true),
    },
    async (req, reply) => {
      const username = req.body.username;
      const password = req.body.password;
      let row = db.prepare("SELECT id, password FROM users WHERE username = ? -- login route").get(username);
      if (!row) {
        return reply.code(401).send({success: false, message: MSG.USERNAME_NOT_FOUND(username)});
      }
      if (!await comparePassword(password, row.password))
        return reply.code(401).send({success: false, message: MSG.WRONG_PASSWORD()});
      const token = fastifyInstance.jwt.sign({id: row.id},  {expiresIn: '15m'});
      const cookiesOptions =  {path: '/', httpOnly: true, secure: true, sameSite: "Strict", maxAge: 15 * 60};
      return reply.header("x-authenticated", true)
        .setCookie("account", token, cookiesOptions)
        .send({success: true, message: MSG.WELCOME_USERNAME(username)});
  });

  fastifyInstance.post("/logout", async (req, reply) => {
    reply.clearCookie("account");
    return reply.header("x-authenticated", false).send({success: true, message: MSG.GOODBYE()});
  });

  fastifyInstance.put("/update",
    {
      onRequest: [identifyUser, needFormBody],
      preValidation: checkBodyInput(["username", "biography"]),
    },
    async (req, reply) => {
      const username = req.body.username;
      const bio = req.body.biography;
      const row = db.prepare('SELECT id FROM users WHERE username = ? -- update route').get(username);
      if (row && row.id != req.user.id) {
        return reply.code(409).send({success: 0, message: MSG.USERNAME_TAKEN(username)});
      }
      const res = db.prepare("UPDATE or IGNORE users SET username = ?, bio = ? WHERE id = ? -- update route").run(username, bio, req.user.id);
      if (!res.changes) // might happen if username taken between two requests
        return reply.code(403).send({success: false, message: MSG.DB_REFUSED()});
      return reply.send({success: true, message: ":D"});
  });

  fastifyInstance.put("/pfp",
    {
      onRequest: [identifyUser],
    },
    async (req, reply) => {
      const data = await req.file();
      if (!data || !data.filename) {
        return reply.code(400).send({ success: false, message: MSG.NO_FILE() });
      }
      const buffer = await data.toBuffer();
      const detectedType = await fileTypeFromBuffer(buffer);
      if (!detectedType || !['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(detectedType.mime)) {
        return reply.code(400).send({ success: false, message: MSG.NOT_IMG() });
      }
      const filename = `${req.user.id}.${detectedType.ext}`;
      try {
        await fs.promises.writeFile(`/var/www/pfp/${filename}`, buffer);
      } catch (error) {
        return reply.code(500).send({ success: false, message: 'Failed to save file: ' + error });
      }
      const row = db.prepare('SELECT pfp FROM users WHERE id = ? -- pfp route').get(req.user.id);
      const res = db.prepare("UPDATE or IGNORE users SET pfp = ? WHERE id = ? -- pfp route").run(filename, req.user.id);
      if (!res.changes) // should really not happen
        return reply.code(403).send({success: false, message: MSG.DB_REFUSED()});
      if (row.pfp !== "default.jpg" && row.pfp !== filename) {
        // if unlink fails, it's sad, but won't bother with an error
        fs.unlink(`/var/www/pfp/${row.pfp}`, () => {});
      }
      return reply.send({success: true, message: ":D"});
  });

  fastifyInstance.put("/password",
    {
      onRequest: [identifyUser, needFormBody],
      preValidation: checkBodyInput(["password"]),
    },
    async (req, reply) => {
      const password = await hashPassword(req.body.password);
      const res = db.prepare("UPDATE users SET password = ? WHERE id = ? -- password route").run(password, req.user.id);
      if (!res.changes) 
        return reply.code(403).send({success: false, message: MSG.DB_REFUSED()});
      return reply.send({success: true, message: ":D"});
  });

  
  fastifyInstance.delete("/delete",
    {
      onRequest: [identifyUser, needFormBody],
      preValidation: checkBodyInput(["username"], true),
    },
    async (req, reply) => {
      if (req.user.admin)
        return reply.code(403).send({success: false, message: MSG.REFUSED_ADMIN()});
      if (req.body.username != req.user.username)
        return reply.code(401).send({success: false, message: MSG.WRONG_USERNAME()});
      const res = db.prepare("DELETE FROM users WHERE id = ? -- delete route").run(req.user.id);
      if (!res.changes) // should not happen
        return reply.code(401).send({success: false, message: MSG.DB_REFUSED()});
      reply.clearCookie("account");
      // Not a 204 No content because 204 should not have a body and the front wants to have success
      return reply.header("x-authenticated", false).send({success: true, message: MSG.GOODBYE()});
  });
}
