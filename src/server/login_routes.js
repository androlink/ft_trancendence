
import Database from "better-sqlite3";
import { dbPath } from "./database.js";

export async function loginRoutes(fastifyInstance) {

    const needFormFobdy = async (req, reply) => {
        if (!("content-type" in req.headers)) {
            return reply.code(415).send(`Content-Type not found in a ${req.method} request`);
        }
        if (req.headers["content-type"] !== "application/x-www-form-urlencoded"){
            return reply.code(415).send(`We only support application/x-www-form-urlencoded when doing ${req.method} on ${req.url}`);
        }
    };


    const identifyRequest = async (req, reply) => {
        try {
            await req.jwtVerify();
        } catch (err) {
            return reply.code(401).send("You need to be connected");
        }
    };

    fastifyInstance.post('/login', { preHandler: needFormFobdy }, async (req, reply) => {
        const data = req.body;
        if (!Object.hasOwn(data, "username"))
            return reply.code(401).send("query username missing");
        if (!Object.hasOwn(data, "password"))
            return reply.code(401).send("query password missing");
        const username = data["username"]; 
        const password = data["password"]; // add security soon and everything
        if (!username)
            return {success: false, reason: "No username given"};
        try {
            const db = new Database(dbPath);
            let row = db.prepare('SELECT * FROM users WHERE username = ? AND password = ?').get(username, password);
            if (row) {
                // success HERE
                const token = fastifyInstance.jwt.sign({id: row.id},  {expiresIn: '15m'});
                return reply.header('x-authenticated', true).setCookie('account', token,
                    {path: '/', httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 15 * 60, }
                    ).send({success: true, reason: `welcome ${username}`});
                }
            row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
            if (!row)
                return {success: false, reason: `no account with username "${username}"`};
            return {success: false, reason: "wrong password"};
        } catch (err) {
            return {success: false, reason: "the database fetching failed"};
        }
    });

    fastifyInstance.post('/profile', { onRequest: identifyRequest, preHandler: needFormFobdy }, async (req, reply) => {
        const data = req.body;
        if (!Object.hasOwn(data, "username"))
            return reply.code(401).send("query username missing");
        if (!Object.hasOwn(data, "biography"))
            return reply.code(401).send("query bio missing");
        const username = data["username"]; 
        const bio = data["biography"];
        if (!username)
            return {success: false, reason: "No username given"};
        const db = new Database(dbPath);
        const update = db.prepare('UPDATE users SET username = ?, bio = ? WHERE id = ?');
        if (update.run(username, bio, req.user.id).changes == 0) {
            db.close();
            return {success: false, reason: "Databse didn't find you"};
        }
        db.close();
        return {success: true, reason: ':D'};
    });

    fastifyInstance.post('/password', { onRequest: identifyRequest, preHandler: needFormFobdy }, async (req, reply) => {
        const data = req.body;
        if (!Object.hasOwn(data, "password"))
            return reply.code(401).send("query password missing");
        const password = data["password"];
        if (!password) // gonna need better password securities obviously
            return {success: false, reason: "No password given"};
        const db = new Database(dbPath);
        const update = db.prepare('UPDATE users SET password = ? WHERE id = ?');
        if (update.run(password, req.user.id).changes == 0) {
            db.close();
            return {success: false, reason: "Databse didn't find you"};
        }
        db.close();
        return {success: true, reason: ':D'};
    });

    fastifyInstance.post('/logout', async (req, reply) => {
        reply.clearCookie('account');
        return reply.header('x-authenticated', false).send("Goodbye");
    });
}
