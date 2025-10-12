
import Database from "better-sqlite3";
import { dbPath } from "./database.js";

export async function loginRoutes(fastifyInstance) {
    fastifyInstance.post('/login', async (req, reply) => {
        // might add a cleaner addHook of type prevalidation for the 2 "if" below. 
        // For now it is working enough as it is, and more understandable
        if (!("content-type" in req.headers)) {
            return reply.code(415).send("Content-Type not found in a post request");
        }
        if (req.headers["content-type"] !== "application/x-www-form-urlencoded"){
            return reply.code(415).send("We only support application/x-www-form-urlencoded");
        }
        const data = req.body
        if (!Object.hasOwn(data, "username"))
            return { success: false, reason: "query username missing" };
        if (!Object.hasOwn(data, "password"))
            return { success: false, reason: "query password missing" };
        const username = data["username"];
        const password = data["password"]; // add cryptage and everything
        const db = new Database(dbPath);
        let row = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
        if (row)
            return { success: true, reason: `welcome ${username}`};
        row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!row)
            return { success: false, reason: `no account with username ${username}`};
        return { success: false, reason: "wrong password" };
    });
}
