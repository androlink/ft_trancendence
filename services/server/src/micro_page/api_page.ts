import db from "../common/database.js";
import { dbLogFile } from "../common/database.js";
import fs from "fs";
import { assetsPath } from "../config.js";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { Id, LanguageObject, UserRow } from "../common/types.js";

// response format for that page :
// {
//   template?: string,
//   title?: string,
//   replace?:  {[key:string]:string | {[language:string]:string}},
//   inner?: string,
// }
// if you reuse code for other page, take it into consideration

export default async function apiPage(fastifyInstance: FastifyInstance) {
  fastifyInstance.setNotFoundHandler((req, reply) => {
    return reply.code(404).send({
      template: "Error",
      replace: { status: "404 Not Found", message: ["ERR_404"] },
      title: "404 Not Found",
    });
  });

  fastifyInstance.addHook("onRequest", async (req, reply) => {
    try {
      await req.jwtVerify();
      const token = fastifyInstance.jwt.sign(
        { id: req.user.id },
        { expiresIn: "15m" }
      );
      reply.header("x-authenticated", token);
    } catch (err) {
      req.user = { id: -1 };
      reply.header("x-authenticated", false);
    }
  });

  let needConnection: (
    req: FastifyRequest,
    reply: FastifyReply
  ) => Promise<void>;
  {
    /** get the full row corresponding to the id */
    const statement1 = db.prepare<{ id: Id }, UserRow>(
      "SELECT * FROM users WHERE id = :id"
    );
    needConnection = async (req: FastifyRequest, reply: FastifyReply) => {
      if (req.user.id === -1) {
        return void reply.code(403).send({
          template: "Home",
          title: ["LOGIN"],
          inner: "LogIn",
        });
      }
      const row = statement1.get({ id: req.user.id });
      if (!row) {
        // might happen naturally if jwt from a previous DB or account deleted
        reply.header("x-authenticated", false);
        return void reply.send({
          template: "Home",
          title: ["LOGIN"],
          inner: "LogIn",
        });
      }
      req.user.username = row.username;
      req.user.admin = row.admin;
      req.user.password = row.password;
      req.user.bio = row.bio;
      req.user.pfp = row.pfp;
    };
  }

  fastifyInstance.get("/", (req, reply) => {
    return reply.send({
      template: "Home",
      title: "ft_transcendence",
      inner: "Welcome",
    });
  });

  fastifyInstance.get("/pong", (req, reply) => {
    return reply.send({
      template: "Home",
      title: "actually the real Pong",
      inner: "Pong",
    });
  });

  fastifyInstance.get(
    "/profile",
    { onRequest: needConnection },
    (req, reply) => {
      return reply.send({
        template: "Home",
        replace: {
          "username-p1": req.user.username,
          "biography-p1": req.user.bio,
          "profile-picture": `${assetsPath}/pfp/${req.user.pfp}`,
          ...(req.user.password === ""
            ? { "label-change-password": ["CREATE PASSWORD"] }
            : {}),
        },
        title: ["YOU"],
        inner: "Profile1",
      });
    }
  );

  fastifyInstance.get(
    "/friends",
    { onRequest: needConnection },
    (req, reply) => {
      return reply.send({
        template: "Home",
        replace: {
          "username-p1": req.user.username,
          "biography-p1": req.user.bio,
          "profile-picture": `${assetsPath}/pfp/${req.user.pfp}`,
        },
        title: ["FRIENDS"],
        inner: "Friend",
      });
    }
  );

  {
    /** get all the infos for the user searched */
    const statement1 = db.prepare<
      { username: string },
      {
        id: Id;
        username: string;
        bio: string;
        pfp: string;
        wins: number;
        losses: number;
        draws: number;
      }
    >(`SELECT
          u.id,
          u.username,
          u.bio,
          u.pfp,
          (SELECT COUNT(*) FROM history_game WHERE player_one = u.id AND result_type = 'win' OR player_two = u.id AND result_type = 'loss') AS wins,
          (SELECT COUNT(*) FROM history_game WHERE player_two = u.id AND result_type = 'win' OR player_one = u.id AND result_type = 'loss') as losses,
          (SELECT COUNT(*) FROM history_game WHERE (player_one = u.id OR player_two = u.id) AND result_type = 'draw') AS draws
        FROM users u
        WHERE lower(username) = lower(:username)`);
    /** see if they are blocked */
    const statement2 = db.prepare<{ requesterId: Id; targetId: Id }, { 1: 1 }>(
      "SELECT 1 FROM user_blocks WHERE blocker_id = :requesterId AND blocked_id = :targetId"
    );
    /** see if there is already a friend request sent */
    const statement3 = db.prepare<{ requesterId: Id; targetId: Id }, { 1: 1 }>(
      "SELECT 1 FROM friend_requests WHERE requester = :requesterId AND requested = :targetId"
    );
    /** see if there is sent the other way around */
    const statement4 = db.prepare<{ requesterId: Id; targetId: Id }, { 1: 1 }>(
      "SELECT 1 FROM friend_requests WHERE requested = :requesterId AND requester = :targetId"
    );
    /** see if they are friend already */
    const statement5 = db.prepare<{ requesterId: Id; targetId: Id }, { 1: 1 }>(
      "SELECT 1 FROM friends WHERE (friend_one = :requesterId AND friend_two = :targetId) OR (friend_one = :targetId AND friend_two = :requesterId)"
    );
    /** transaction to do all the sql at once from the db view */
    const selectSituation = db.transaction(
      (
        requesterId: Id,
        targetId: Id
      ): { friend: LanguageObject; block: LanguageObject } => {
        const params = { requesterId, targetId };
        if (requesterId === -1) {
          return { friend: ["NOT_CONNECTED"], block: ["NOT_CONNECTED"] };
        }
        if (requesterId === targetId) {
          return { friend: ["IT_IS_YOU"], block: ["IT_IS_YOU"] };
        }
        if (statement2.get(params)) {
          return { friend: ["THEY ARE BLOCKED"], block: ["UN_BLOCK"] };
        }
        if (statement3.get(params)) {
          return { friend: ["UN_FRIEND_REQUEST"], block: ["BLOCK"] };
        }
        if (statement4.get(params)) {
          return { friend: ["ACCEPT_FRIEND"], block: ["BLOCK"] };
        }
        if (statement5.get(params)) {
          return { friend: ["UN_FRIEND"], block: ["BLOCK"] };
        }
        return { friend: ["REQUEST_FRIEND"], block: ["BLOCK"] };
      }
    );
    fastifyInstance.get<{ Params: { username: string } }>(
      "/profile/:username",
      (req, reply) => {
        const username = req.params.username;
        const row = statement1.get({ username });
        if (!row) {
          return reply.send({
            template: "Home",
            title: username,
            inner: "Error",
            replace: {
              status: "404 Not Found",
              message: [
                "USERNAME_NOT_FOUND",
                username.length > 20
                  ? username.substring(0, 20) + "..."
                  : username,
              ],
            },
          });
        }
        let { friend, block } = selectSituation(req.user.id, row.id);
        return reply.send({
          template: "Home",
          replace: {
            "username-p2": row.username,
            "biography-p2": row.bio,
            "profile-picture": `${assetsPath}/pfp/${row.pfp}`,
            "friend request": friend,
            "blocking request": block,
            wins: String(row.wins),
            losses: String(row.losses),
            draws: String(row.draws),
            ratio: row.losses
              ? String((row.wins / row.losses).toFixed(2))
              : "N/A",
          },
          title: row.username,
          inner: "Profile2",
        });
      }
    );
  }

  fastifyInstance.get("/help", (req, reply) => {
    return reply.send({
      template: "Home",
      title: ["BORING"],
      inner: "PopUp",
    });
  });

  fastifyInstance.get("/netplay", (req, reply) => {
    return reply.send({
      template: "Home",
      title: ["netplay"],
      inner: "RemotePong",
    });
  });

  fastifyInstance.get(
    "/db-logs",
    { onRequest: needConnection },
    (req, reply) => {
      if (!req.user.admin) {
        return reply.code(403).send({
          template: "Error",
          title: "403 Forbidden",
          replace: { status: "403 NUH UH", message: ["NEED_ADMIN"] },
        });
      }
      const start = Math.max(fs.statSync(dbLogFile).size - 10 * 1024 * 1024, 0);
      reply.type("text/html");
      reply.raw.write(
        "<!DOCTYPE html><html><head><title>db logs</title></head><body>"
      );
      const stream = fs.createReadStream(dbLogFile, {
        encoding: "utf8",
        start,
      });
      stream.on("data", (chunk) => {
        // chunk is a string due to encoding utf8 above
        reply.raw.write((chunk as string).replace(/(?:\r\n|\r|\n)/g, "<br>"));
      });
      stream.on("end", () => {
        reply.raw.end("</body></html>");
      });
      stream.on("error", (err) => {
        reply.raw.statusCode = 500;
        reply.raw.end("Error reading log file");
      });
    }
  );
}
