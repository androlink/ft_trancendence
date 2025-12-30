import { FastifyInstance, FastifyReply } from "fastify";
import db from "../common/database";
import Database from "better-sqlite3";
import { Id } from "../common/types";
import fs, { realpath } from "fs";
import { fileTypeFromBuffer } from "file-type";

const CLIENT_ID = "Ov23liFNHGBJPQQnaqZa";
// je peu en régénérer une au besoin
const CLIENT_SECRET = "003530775d960f318554c656cc1e80c404e8cf52";

/**
 * statement for database
 */
let dbQuery: {
  InsertUser: Database.Statement<{
    username: string;
    githubId: number;
    bio: string;
  }>;
  getUserByUsername: Database.Statement<
    {
      username: string;
    },
    { id: Id; githubId: number }
  >;
  getUsername: Database.Statement<{ username: string }, { username: string }>;
  getUserByGithubId: Database.Statement<
    { githubId: number },
    { id: Id; pfp: string; username: string }
  >;
  UpdateUserPfp: Database.Statement<{ pfp: string; githubId: number }>;
};

/**
 * insert a number to the username and slice if the username is greather than 20
 * @param username usernane of github username
 * @param nb number
 * @returns
 */
function InsertNumberInUsername(username: string, nb: number) {
  const nbStr = nb.toString();
  if (username.length - nbStr.length < 3)
    return "User" + Math.random().toString().slice(0, 8);
  if (username.length + nbStr.length < 20) return username + nbStr;
  return username.slice(0, username.length - nbStr.length) + nbStr;
}

/**
 * format a username if it already exist on the database
 * @param username username of github user
 */
function usernameFormator(username: string): string {
  if (username.length > 20) {
    username = username.substring(0, 20);
  }
  const rows = dbQuery.getUsername.all({ username });
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
/**
 * Set the profile picture provided by GitHub user data in the database.
 * @param pdp profile picture URL
 * @param githubId id of github user
 * @param reply fastify reply
 */
async function setGithubAvatar(
  pdp: URL,
  githubId: number,
  reply: FastifyReply
): Promise<boolean> {
  try {
    const responsePdp = await fetch(pdp);
    if (!responsePdp.ok) {
      return false;
    }

    const buffer = Buffer.from(await (await fetch(pdp)).arrayBuffer());
    const extensionBuffer = await fileTypeFromBuffer(buffer);
    if (!extensionBuffer) return false;
    const filename = `${githubId.toString()}avatar_github.${
      extensionBuffer?.ext
    }`;
    await fs.promises.writeFile(`/var/www/pfp/${filename}`, buffer);
    const row = dbQuery.getUserByGithubId.get({ githubId });
    const res = dbQuery.UpdateUserPfp.run({ pfp: filename, githubId });
    if (!row || !res.changes) {
      return false;
    }
    if (row.pfp !== "default.jpg" && row.pfp !== filename) {
      fs.unlink(`/var/www/pfp/${row.pfp}`, () => {});
    }
  } catch (err) {
    console.log("githubAvatar Error", err);
    return false;
  }
  return true;
}

// =========================================================================

export default function authentification(fastify: FastifyInstance) {
  dbQuery = {
    InsertUser: db.prepare<{ username: string; githubId: number; bio: string }>(
      "INSERT INTO users (username, githubId, bio) VALUES (:username, :githubId, :bio)"
    ),
    getUserByUsername: db.prepare<
      { username: string },
      { id: Id; githubId: number }
    >(
      "SELECT id, githubId FROM users WHERE lower(username) = lower(:username)"
    ),
    getUsername: db.prepare<{ username: string }, { username: string }>(
      "SELECT username FROM users WHERE lower(username) LIKE REPLACE(:username, '_', '\\_') || '%' ESCAPE '\\'"
    ),
    getUserByGithubId: db.prepare<
      { githubId: number },
      { id: Id; pfp: string; username: string }
    >("SELECT id, username, pfp FROM users WHERE githubId = :githubId"),
    UpdateUserPfp: db.prepare<{ pfp: string; githubId: number }>(
      "UPDATE users SET pfp = :pfp WHERE githubId = :githubId"
    ),
  };

  /**
   * create a account with user data get from github
   * @param username username of github user
   * @param githubId id of github user
   * @param pdp profile picture of github user
   * @param reply fastify reply
   */
  async function GithubRegister(
    username: string,
    githubId: number,
    pdp: URL,
    bio: string,
    reply: FastifyReply
  ) {
    try {
      username = usernameFormator(username);
      const res = dbQuery.InsertUser.run({ username, githubId, bio });
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

      const success = await setGithubAvatar(pdp, githubId, reply);
      if (!success)
        return reply
          .code(502)
          .send({ success: false, message: "Bad Gateaway from github.com" });

      return reply
        .header("x-authenticated", token)
        .send({ success: true, message: ["WELCOME_USERNAME", username] });
    } catch (err) {
      return reply
        .code(502)
        .send({ success: false, message: "Bad Gateaway from github.com" });
    }
  }

  /**
   * create a account or log in if a user use Github
   */
  fastify.post<{
    Body: { username: string; githubId: number; pdp: URL; bio: string };
  }>(
    "/connection",
    {
      // preValidation: checkBodyInput(["username"], true),
    },
    async (req, reply) => {
      let username = req.body.username;
      const githubId = req.body.githubId;
      const pdp = req.body.pdp;
      const bio = req.body.bio;
      const row = dbQuery.getUserByGithubId.get({ githubId });

      if (!row) return GithubRegister(username, githubId, pdp, bio, reply);

      const token = fastify.jwt.sign({ id: row.id }, { expiresIn: "15m" });
      return reply
        .header("x-authenticated", token)
        .send({ success: true, message: ["WELCOME_USERNAME", row.username] });
    }
  );

  /**
   * creates an access_token with a code provided after connecting to GitHub
   */
  fastify.get("/getAccessToken", async (req, res) => {
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
  /**
   * get user data like: 'username', 'bio', 'id', 'profile picture' from github
   */
  fastify.get("/getUserData", async (req, res) => {
    const authHeader = req.headers["authorization"];
    console.log("Authorization =>", authHeader);
    const response = await fetch("https://api.github.com/user", {
      method: "GET",
      headers: {
        Authorization: authHeader || "",
      },
    });

    const data = await response.json();
    res.send(data);
  });
}
