import { FastifyInstance } from "fastify";
import db from "./database";
import Database from "better-sqlite3";
import { Id } from "./types";
import { resolvePtr } from "dns";

const CLIENT_ID = "Ov23liFNHGBJPQQnaqZa";
// je peu en régénérer une au besoin
const CLIENT_SECRET = "003530775d960f318554c656cc1e80c404e8cf52";

let dbQuery: {
  InsertUser: Database.Statement<{
    username: string;
    githubUser: number;
  }>;
  getUserByUsername: Database.Statement<
    {
      username: string;
    },
    { id: Id; githubUser: number }
  >;
  getAllUsername: Database.Statement<
    { username: string },
    { username: string }
  >;
};

function InsertNumberInUsername(username: string, nb: number) {
  const nbStr = nb.toString();
  if (username.length - nbStr.length < 3)
    return "User" + Math.random().toString().slice(0, 8);
  return username.slice(0, username.length - nbStr.length) + nbStr;
}

function usernameFormator(username: string): string {
  if (username.length > 20) {
    username = username.substring(0, 20);
  }
  const rows = dbQuery.getAllUsername.all({ username });
  if (rows.every((row) => row.username != username)) return username;

  let nb = 0;
  while (
    rows.every((row) => {
      let newUsername = InsertNumberInUsername(username, nb++);
      row.username != newUsername;
    })
  );
  return InsertNumberInUsername(username, nb);
}

export default function authentification(fastify: FastifyInstance) {
  dbQuery = {
    InsertUser: db.prepare<{ username: string; githubId: number }, void>(
      "INSERT INTO users (username, githubId) VALUES (:username, :githubId)"
    ),
    getUserByUsername: db.prepare<
      { username: string },
      { id: Id; githubId: number }
    >(
      "SELECT id, githubId FROM users WHERE lower(username) = lower(:username)"
    ),
    getAllUsername: db.prepare<{ username: string }, { username: string }>(
      "SELECT username FROM users WHERE lower(username) LIKE REPLACE(:username, '_', '\\_') || '%' ESCAPE '\\'"
    ),
  };

  // REGISTER GITHUB
  fastify.post<{ Body: { username: string; githubId: number } }>(
    "/github/register",
    {
      // preValidation: checkBodyInput(["username"], true),
    },
    async (req, reply) => {
      let username = req.body.username;
      const githubId = req.body.githubId;
      try {
        const res = dbQuery.InsertUser.run({ username, githubId });
        if (res.changes === 0) {
          // not normal
          return reply
            .code(403)
            .send({ success: false, message: ["DB_REFUSED"] });
        }
        const token = fastify.jwt.sign(
          { id: res.lastInsertRowid },
          { expiresIn: "15m" }
        );
        return reply
          .header("x-authenticated", token)
          .send({ success: true, message: ["WELCOME_USERNAME", username] });
      } catch (err) {
        username = usernameFormator(username);
        const res = dbQuery.InsertUser.run({ username, githubId });
        if (res.changes === 0) {
          // not normal
          return reply
            .code(403)
            .send({ success: false, message: ["DB_REFUSED"] });
        }
        const token = fastify.jwt.sign(
          { id: res.lastInsertRowid },
          { expiresIn: "15m" }
        );
        return reply
          .header("x-authenticated", token)
          .send({ success: true, message: ["WELCOME_USERNAME", username] });
      }
    }
  );

  // LOGIN GITHUB
  fastify.post<{ Body: { username: string; password: string } }>(
    "/github/login",
    {
      // preValidation: checkBodyInput(["username"], true),
    },
    async (req, reply) => {
      const username = req.body.username;
      let row = dbQuery.getUserByUsername.get({ username });
      if (!row) {
        return reply.code(401).send({
          success: false,
          message: [
            "USERNAME_NOT_FOUND",
            username.length > 20 ? username.substring(0, 20) + "..." : username,
          ],
        });
      }
      const token = fastify.jwt.sign({ id: row.id }, { expiresIn: "15m" });
      return reply
        .header("x-authenticated", token)
        .send({ success: true, message: ["WELCOME_USERNAME", username] });
    }
  );

  fastify.get("github/getAccessToken", async (req, res) => {
    const { code } = req.query as { code: string };

    const url = new URL("https://github.com/login/oauth/access_token");
    url.searchParams.set("client_id", CLIENT_ID);
    url.searchParams.set("client_secret", CLIENT_SECRET);
    url.searchParams.set("code", code);

    const response = await fetch(url, {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    const data = await response.json();
    console.log(data);
    res.send(data);
  });

  fastify.get("github/getUserData", async (req, res) => {
    const authHeader = req.headers["authorization"];
    console.log("Authorization =>", authHeader);
    const response = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: authHeader,
      },
    });

    const data = await response.json();
    console.log(data);
    res.send(data);
  });
}
