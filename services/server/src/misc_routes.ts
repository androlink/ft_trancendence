
import db from "./database.js";
import {FastifyInstance} from "fastify"
import { Id } from "./types"

// response format for that page :
// whatever you need.
// The failure would be an empty response, meaning it won't be treated as an error
// Thus these routes are assumed as never failing
//
// if you reuse code for other page, take it into consideration

export async function miscRoutes(fastifyInstance: FastifyInstance) {
  fastifyInstance.setNotFoundHandler((req, reply) => {
    return reply.code(404).send("all the /misc request are for the frontend tools, like the user research thing at the top. You should not be able to read this");
  });

  fastifyInstance.get<{Querystring: {start: string}}>('/users', (req, reply) => {
    let start = req.query.start;
    if (!start) start = "";
    let arr = db.prepare("SELECT username, pfp FROM users WHERE lower(username) LIKE lower(?) -- users search route ").all(start + '%') as {username: string, pfp: string}[];
    arr = arr.sort((a, b) => a.username > b.username ? 1 : -1);
    return reply.send(arr.slice(0, 20));
  });

  fastifyInstance.get<{Querystring: {user: string}}>('/history', (req, reply) => {
    let user = req.query.user;
    if (!user) return reply.send([]);
    const row = db.prepare<[string], {id: Id}>("SELECT id FROM users WHERE lower(username) = lower(?)").get(user);
    let arr = db.prepare<[Id, Id], {time: string, winner: string, loser: string}>("SELECT time, (SELECT username FROM users WHERE id = h.winner) AS winner, (SELECT username FROM users WHERE id = h.loser) AS loser FROM history_game h WHERE winner = ? OR loser = ? -- history search route ").all(row.id, row.id);
    arr = arr.sort((a, b) => a.time > b.time ? 1 : -1);
    return reply.send(arr.slice(0, 100));
  });

  fastifyInstance.post<{Querystring: {winner: string, loser: string}}>('/win', (req, reply) => {
    let winner_id = parseInt(req.query.winner);
    let loser_id = parseInt(req.query.loser);
    if (winner_id != winner_id || loser_id != loser_id || loser_id === winner_id) return reply.send("failed");
    db.prepare("INSERT INTO history_game (winner, loser) VALUES (?, ?) -- win route route ").run(winner_id, loser_id);
    return reply.send("success");
  });
}