import db from "./database.js";
import { FastifyInstance } from "fastify";
import { Id } from "./types";

// response format for that page :
// whatever you need.
// The failure would be an empty response, meaning it won't be treated as an error
// Thus these routes are assumed as never failing
//
// if you reuse code for other page, take it into consideration

export async function miscRoutes(fastifyInstance: FastifyInstance) {
  fastifyInstance.setNotFoundHandler((req, reply) => {
    return reply
      .code(404)
      .send(
        "all the /misc request are for the frontend tools, like the user research thing at the top. You should not be able to read this"
      );
  });

  {
    /** select username and pfp of all the user that starts with :start */
    const statement1 = db.prepare<
      { start: string },
      { username: string; pfp: string }
    >(
      "SELECT username, pfp FROM users WHERE lower(username) LIKE REPLACE(:start, '_', '\\_') || '%' ESCAPE '\\'"
    );
    fastifyInstance.get<{ Querystring: { start: string } }>(
      "/users",
      (req, reply) => {
        let start = req.query.start;
        if (start === undefined) return reply.send([]);
        let arr = statement1.all({ start });
        arr = arr.sort((a, b) => (a.username > b.username ? 1 : -1));
        return reply.send(arr.slice(0, 20));
      }
    );
  }

  {
    /** find id of the user searched */
    const statement1 = db.prepare<{ target: string }, { id: Id }>(
      "SELECT id FROM users WHERE lower(username) = lower(:target)"
    );
    /** find all the infos of the user from the id above */
    const statement2 = db.prepare<
      { targetId: Id },
      { time: string; winner: string; loser: string }
    >(
      "SELECT strftime('%Y-%m-%dT%H:%M:%fZ', time) AS time, (SELECT username FROM users WHERE id = h.winner) AS winner, (SELECT username FROM users WHERE id = h.loser) AS loser FROM history_game h WHERE winner = :targetId OR loser = :targetId"
    );
    fastifyInstance.get<{ Querystring: { user: string } }>(
      "/history",
      (req, reply) => {
        let target = req.query.user;
        if (target === undefined) return reply.send([]);
        const row = statement1.get({ target });
        if (!row) return reply.send([]);
        let arr = statement2.all({ targetId: row.id });
        arr = arr.sort((a, b) => (a.time < b.time ? 1 : -1));
        return reply.send(arr.slice(0, 100));
      }
    );
  }

  {
    /** find all the infos of the user */
    const statement1 = db.prepare<
      { id: Id },
      { username: string; pfp: string }
    >(
      "SELECT u.username, u.pfp FROM friends f JOIN users u ON u.id = CASE WHEN f.friend_one = :id THEN f.friend_two ELSE f.friend_one END WHERE :id IN (f.friend_one, f.friend_two)"
    );
    fastifyInstance.get<{ Querystring: { page: string } }>(
      "/friends",
      async (req, reply) => {
        let page = parseInt(req.query.page, 10);
        if (page < 1 || !isFinite(page)) page = 1;
        page -= 1;
        try {
          await req.jwtVerify();
        } catch (err) {
          return reply.send([0, []]);
        }
        let arr = statement1.all({ id: req.user.id });
        if (arr.length <= 16 * page) {
          page = Math.floor(arr.length / 16);
        }
        arr = arr.sort((a, b) => (a.username > b.username ? 1 : -1));
        return reply.send([arr.length, arr.slice(page * 16, page * 16 + 17)]);
      }
    );
  }

  {
    /**
     * That route is purely debug
     * It's to manually add game history,
     * while we don't have any way to make real games
     */
    /** insert a game according to the winner and loser */
    const statement1 = db.prepare<[Id, Id], undefined>(
      "INSERT INTO history_game (winner, loser) VALUES (?, ?)"
    );
    fastifyInstance.post<{ Querystring: { winner: string; loser: string } }>(
      "/win",
      (req, reply) => {
        let winner_id = parseInt(req.query.winner);
        let loser_id = parseInt(req.query.loser);
        if (
          winner_id != winner_id ||
          loser_id != loser_id ||
          loser_id === winner_id
        )
          return reply.send("failed");
        statement1.run(winner_id, loser_id);
        return reply.send("success");
      }
    );
  }
}
