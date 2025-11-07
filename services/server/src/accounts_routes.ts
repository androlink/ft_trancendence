
import db, { hashPassword, comparePassword } from "./database";
import MSG from "./messages_collection";
import fs from 'fs'
import { fileTypeFromBuffer } from 'file-type';
import { FastifyInstance } from 'fastify'
import { UserRow } from "./interfaces";


// response format for that page :
// {
//   success: boolean,
//   message: {[key:string]:string | {[language:string]:string}}
// }
// setting message as a plain string will set have all the language display the same
// if you reuse code for other page, take it into consideration

export async function loginRoutes(fastifyInstance: FastifyInstance) {

  /**
   * treat the element you want based on a collection of requirements decided arbitrary in the scope
   * @param requiredFields ex : ["username", "biography", "password"]
   * @param presenceOnly setting it as true will stop the checks at the presence in the body
   * @returns a function used for a hook
   */
  function checkBodyInput(requiredFields: string[], presenceOnly = false) {
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

  let identifyUser;
  {
    const statement1 = db.prepare("SELECT * FROM users WHERE id = :id");
    identifyUser = async (req, reply) => {
      try {
        await req.jwtVerify();
        const row= statement1.get({id: req.user.id}) as UserRow;
        if (!row) {
          reply.header('x-authenticated', false);
          return reply.code(404).send({success: false, message: MSG.NOT_IN_DB()});
        }
        req.user.username = row.username;
        req.user.admin = row.admin;
        req.user.password = row.password;
        req.user.bio = row.bio;
        const token = fastifyInstance.jwt.sign({id: req.user.id},  {expiresIn: '15m'});
        reply.header('x-authenticated', token);
      } catch (err) {
        reply.header('x-authenticated', false);
        return reply.code(401).send({success: false, message: MSG.NOT_RECOGNIZED()});
      }
    };
  }

  {
    const statement1 = db.prepare('INSERT INTO users (username, password) VALUES (:username, :password)');
    fastifyInstance.post<{Body: {username: string, password: string}}>("/register",
      {
        preValidation: checkBodyInput(["username", "password"]),
      },
      async (req, reply) => {
        const username = req.body.username;
        const password = await hashPassword(req.body.password);
        try {
          const res = statement1.run({username, password});
          if (res.changes === 0) {
            // not normal
            return reply.code(403).send({success: false, message: MSG.DB_REFUSED()});
          }
          const token = fastifyInstance.jwt.sign({id: res.lastInsertRowid},  {expiresIn: '15m'});
          const cookiesOptions =  {path: '/', httpOnly: true, secure: true, sameSite: "Strict", maxAge: 15 * 60};
          return reply.header("x-authenticated", token)
            .send({success: true, message: MSG.WELCOME_USERNAME(username)});
        }
        catch (err) {
          // statement will crash if if doesn't respect db rules, so if username not UNIQUE
          return reply.code(409).send({success: false, message: MSG.USERNAME_TAKEN(username)});
        }
    });
  }

  {
    const statement1 = db.prepare("SELECT id, password FROM users WHERE lower(username) = lower(:username)");
    fastifyInstance.post<{Body: {username: string, password: string}}>("/login",
      {
        onRequest: [needFormBody],
        preValidation: checkBodyInput(["username", "password"], true),
      },
      async (req, reply) => {
        const username = req.body.username;
        const password = req.body.password;
        let row = statement1.get({username}) as UserRow;
        if (!row) {
          return reply.code(401).send({success: false, message: MSG.USERNAME_NOT_FOUND(username)});
        }
        if (!await comparePassword(password, row.password)) {
          return reply.code(401).send({success: false, message: MSG.WRONG_PASSWORD()});
        }
        const token = fastifyInstance.jwt.sign({id: row.id},  {expiresIn: '15m'});
        const cookiesOptions =  {path: '/', httpOnly: true, secure: true, sameSite: "Strict", maxAge: 15 * 60};
        return reply.header("x-authenticated", token)
          .send({success: true, message: MSG.WELCOME_USERNAME(username)});
    });
  }
  
  fastifyInstance.post("/logout", async (req, reply) => {
    return reply.header("x-authenticated", false).send({success: true, message: MSG.GOODBYE()});
  });

  {
    const statement1 = db.prepare("UPDATE users SET username = :username, bio = :bio WHERE id = :id");
    fastifyInstance.put<{Body: {username: string, biography: string}, User: {id: number}}>("/update",
      {
        onRequest: [identifyUser, needFormBody],
        preValidation: checkBodyInput(["username", "biography"]),
      },
      async (req, reply) => {
        const username = req.body.username;
        const bio = req.body.biography;
        try {
          const res = statement1.run({username, bio, id: req.user.id});
          if (!res.changes) {
            // might happen if account deleted between start of request treating and statement's run
            return reply.code(404).header("x-authenticated", false).send({success: false, message: MSG.NOT_IN_DB()});
          }
          return reply.send({success: true, message: ":D"});
        }
        catch (err) {
          // statement will crash if if doesn't respect db rules, so if username not UNIQUE
          return reply.code(409).send({success: false, message: MSG.USERNAME_TAKEN(username)});
        }
    });
  }

  {
    const statement1 = db.prepare('SELECT pfp FROM users WHERE id = :id');
    const statement2 = db.prepare("UPDATE users SET pfp = :pfp WHERE id = :id");
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
        if (!detectedType || !['image/png', 'image/apng', 'image/jpeg', 'image/gif', 'image/webp'].includes(detectedType.mime)) {
          return reply.code(401).send({ success: false, message: MSG.NOT_IMG() });
        }
        const filename = `${req.user.id}${String(Math.random()).substring(2)}.${detectedType.ext}`;
        try {
          await fs.promises.writeFile(`/var/www/pfp/${filename}`, buffer);
        } catch (error) {
          return reply.code(500).send({ success: false, message: 'Failed to save file: ' + error });
        }
        const row = statement1.get({id: req.user.id}) as UserRow;
        const res = statement2.run({pfp: filename, id: req.user.id});
        // below might happen on race condition, if someone deleted their accounts between SQL request for instance
        if (!row || !res.changes) {
          return reply.code(404).header("x-authenticated", false).send({success: false, message: MSG.NOT_IN_DB()});
        }
        if (row.pfp !== "default.jpg" && row.pfp !== filename) {
          // if unlink fails, it's sad, but won't bother with an error
          fs.unlink(`/var/www/pfp/${row.pfp}`, () => {});
        }
        return reply.send({success: true, message: ":D"});
    });
  }

  {
    const statement1 = db.prepare("UPDATE users SET password = :password WHERE id = :id");
    fastifyInstance.put<{Body: {password: string}}>("/password",
      {
        onRequest: [identifyUser, needFormBody],
        preValidation: checkBodyInput(["password"]),
      },
      async (req, reply) => {
        const password = await hashPassword(req.body.password);
        const res = statement1.run({password, id: req.user.id});
        if (!res.changes) 
          return reply.code(403).send({success: false, message: MSG.DB_REFUSED()});
        return reply.send({success: true, message: ":D"});
    });
  }

  {
    // find who is getting blocked
    const statement1 = db.prepare("SELECT id FROM users WHERE lower(username) = lower(?)");
    // try to unblock them
    const statement2 = db.prepare("DELETE FROM user_blocks WHERE blocker_id = :requesterId AND blocked_id = :targetId RETURNING 1");
    // if unblocking failed, then we block them instead
    const statement3 = db.prepare("DELETE FROM friend_requests WHERE requester = :requesterId AND requested = :targetId");
    // So we remove any potential friendship
    const statement4 = db.prepare("DELETE FROM friends WHERE (friend_one = :requesterId AND friend_two = :targetId) OR (friend_two = :requesterId AND friend_one = :targetId)");
    // And we remove any potential friend request from the person who blocked 
    const statement5 = db.prepare("INSERT INTO user_blocks (blocker_id, blocked_id) VALUES (:requesterId, :targetId)");
    // Transactions avoid race conditions
    const toggleBlock = db.transaction((requesterId, targetId) => {
      const params = {requesterId, targetId};
      if (statement2.get(params)) {
        return "Unblocked";
      }
      statement3.run(params);
      statement4.run(params);
      statement5.run(params);
      return "Blocked";
    });

    fastifyInstance.post<{Querystring: {user: string}}>("/block",
      {
        onRequest: [identifyUser],
      },
      async (req, reply) => {
        let target = req.query.user;
        // line below doesn't need translation, the front should never see it
        if (!target) {
          return reply.send({success: false, message: "You need to tell the target in the query as example /block?user=AllMighty"});
        }
        if (req.user.username === target) {
          return reply.send({success: false, message: MSG.THAT_IS_YOU()});
        }
        let row = statement1.get(target) as UserRow;
        if (!row) {
          return reply.send({success: false, message: MSG.USERNAME_NOT_FOUND(target)});
        }
        try {
          return reply.send({success: true, message: toggleBlock(req.user.id, row.id)});
        }
        catch (err){
          return reply.code(409).send({success: false, message: MSG.ERR_409()});
        }
    });
  }

  {
    const statement1 = db.prepare("SELECT id FROM users WHERE lower(username) = lower(?)");
    // if the other person is blocked
    const statement2 = db.prepare('SELECT 1 FROM user_blocks WHERE blocker_id = :requesterId AND blocked_id = :targetId');
    // if the other person already requested you, accept it
    const statement3 = db.prepare('DELETE FROM friend_requests WHERE requester = :targetId AND requested = :requesterId RETURNING 1');
    const statement4 = db.prepare('INSERT INTO friends (friend_one, friend_two) VALUES (:requesterId, :targetId)');
    // if it's your friend, remove it
    const statement5 = db.prepare('DELETE FROM friends WHERE (friend_one = :requesterId AND friend_two = :targetId) OR (friend_two = :requesterId AND friend_one = :targetId) RETURNING 1');
    // if it's you already had a request, remove it
    const statement6 = db.prepare('DELETE FROM friend_requests WHERE requester = :requesterId AND requested = :targetId RETURNING 1');
    // New friend request
    const statement7 = db.prepare('INSERT INTO friend_requests (requester, requested) VALUES (:requesterId, :targetId)');
    // Transactions avoid race conditions
    const toggleFriend = db.transaction((requesterId, targetId) => {
      const params = {requesterId, targetId};
      if (statement2.get(params)) {
        return "You can't he's blocked";
      }
      if (statement3.get(params)) {
        statement4.run(params);
        return "new friend";
      }
      if (statement5.get(params)) {
        return "removed friend";
      }
      if (statement6.get(params)) {
        return "removed request";
      }
      statement7.run(params);
      return "friend request :D";
    });
    fastifyInstance.post<{Querystring: {user: string}}>("/friend",
      {
        onRequest: [identifyUser],
      },
      async (req, reply) => {
        let target = req.query.user;
        // line below doesn't need translation, the front should never see it
        if (!target)
          return reply.code(401).send({success: false, message: "You need to tell the target in the query as example /friend?user=AllMighty"});
        if (req.user.username === target)
          return reply.code(403).send({success: false, message: MSG.THAT_IS_YOU()});
        let row = statement1.get(target) as UserRow;
        if (!row)
          return reply.code(401).send({success: false, message: MSG.USERNAME_NOT_FOUND(target)});
        try {
          return reply.send({success: true, message: toggleFriend(req.user.id, row.id)});
        }
        catch (err){
          return reply.code(409).send({success: false, message: MSG.ERR_409()});
        }
    });
  }

  {
    const statement1 = db.prepare("DELETE FROM users WHERE id = :id RETURNING pfp");
    fastifyInstance.delete<{Body: {username: string}}>("/delete",
      {
        onRequest: [identifyUser, needFormBody],
        preValidation: checkBodyInput(["username"], true),
      },
      async (req, reply) => {
        if (req.user.admin) {
          return reply.code(403).send({success: false, message: MSG.REFUSED_ADMIN()});
        }
        if (req.body.username != req.user.username) {
          return reply.code(401).send({success: false, message: MSG.WRONG_USERNAME()});
        }
        const row = statement1.get({id: req.user.id}) as UserRow;
        if (!row) {
          // should not happen, unless two /delete request at the same time, i think
          return reply.code(404).header("x-authenticated", false).send({success: false, message: MSG.NOT_IN_DB()});
        }
        if (row.pfp != "default.jpg") {
          fs.unlink(`/var/www/pfp/${row.pfp}`, () => {});
        }
        // Not a 204 No content because 204 should not have a body and the front wants to have success
        return reply.header("x-authenticated", false).send({success: true, message: MSG.GOODBYE()});
    });
  }
}
