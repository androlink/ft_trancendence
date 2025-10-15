
import Database from "better-sqlite3";
import { dbPath } from "./database.js";

export async function loginRoutes(fastifyInstance) {
    /**
     * basically parse the body
     * - minLenght : necessit a minimum size
     * - maxLenght : restrict above a maximum size
     * - alphanumeric_ : checks for only chars, digits and underscores
     * @param requiredFields ex : {username: {minLength: 2, maxLength: 20, alphanumeric_: true}}
     * @returns a function used for a hook
     */
    function checkBodyInput(requiredFields) {
        return async function (req, reply) {
            for (const field of requiredFields) {
                if (!Object.hasOwn(req.body, field))
                    return reply.code(401).send(`query ${field} missing`);
                if (typeof req.body[field] !== "string")
                    return reply.code(401).send(`${field} must be a string`);
                if (requiredFields[field].minLength && req.body[field].length < requiredFields[field].minLength)
                    return reply.code(401).send(`${field} must be at least ${requiredFields[field]} chars long`);
                if (requiredFields[field].maxLength && req.body[field].length > requiredFields[field].maxLength)
                    return reply.code(401).send(`${field} must be at most ${requiredFields[field]} chars long`);
                if (requiredFields[field].alphanumeric_ && req.body[field].match("^[a-zA-Z0-9_]*$"))
                    return reply.code(401).send(`${field} can have only letters, digits and underscores`);
            }
        };
    }

    /**
     * Send back an error 415 if there is no body with Content-Type x-www-form-urlencoded
     */
    async function needFormBody(req, reply) {
        if (!("content-type" in req.headers)) {
            return reply.code(415).send(`Content-Type not found in a ${req.method} request`);
        }
        if (!req.headers["content-type"].startsWith("application/x-www-form-urlencoded")){
            return reply.code(415).send(`We only support application/x-www-form-urlencoded when doing ${req.method} on ${req.url}`);
        }
    };

    /**
     * identify who is the user based on JWT.
     * Uses cookies, meaning can be set as an onRequestHook, should be used early to access account
     * @returns 
     */
    async function identifyUser(req, reply) {
        try {
            await req.jwtVerify();
        } catch (err) {
            return reply.code(401).send("You need to be connected");
        }
    };

    fastifyInstance.post("/login", { preValidation: needFormBody }, async (req, reply) => {
        const data = req.body;
        if (!Object.hasOwn(data, "username"))
            return reply.code(401).send("query username missing");
        if (!Object.hasOwn(data, "password"))
            return reply.code(401).send("query password missing");
        const username = data["username"]; 
        const password = data["password"]; // add security soon and everything
        if (!username)
            return reply.send({success: false, reason: "No username given"});
        const db = new Database(dbPath);
        let row = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password);
        if (!row) {
            row = db.prepare("SELECT * FROM users WHERE username = ?").get(username);
            db.close();
            return reply.send({success: false, reason: row ? "wrong password" : `no account with username "${username}"`});
        }
        db.close();
        const token = fastifyInstance.jwt.sign({id: row.id},  {expiresIn: '15m'});
        const cookiesOptions =  {path: '/', httpOnly: true, secure: true, sameSite: "Strict", maxAge: 15 * 60};
        return reply.header("x-authenticated", true)
            .setCookie("account", token, cookiesOptions)
            .send({success: true, reason: `welcome ${username}`});
    });

    // checkBodyInput({username: {minLength: 2, maxLength: 20, alphanumeric_: true}})
    fastifyInstance.post("/update", { onRequest: [identifyUser, needFormBody] }, async (req, reply) => {
        const data = req.body;
        if (!Object.hasOwn(data, "username"))
            return reply.code(401).send("query username missing");
        if (!Object.hasOwn(data, "biography"))
            return reply.code(401).send("query bio missing");
        const username = data["username"]; 
        const bio = data["biography"];
        if (!username)
            return reply.send({success: false, reason: "No username given"});
        const db = new Database(dbPath);
        const update = db.prepare("UPDATE users SET username = ?, bio = ? WHERE id = ?");
        const res = update.run(username, bio, req.user.id);
        db.close();
        if (res.changes == 0) {
            return reply.send({success: false, reason: "Databse didn't find you"});
        }
        return reply.send({success: true, reason: ':D'});
    });

    fastifyInstance.post("/password", { onRequest: [identifyUser, needFormBody],  }, async (req, reply) => {
        const data = req.body;
        if (!Object.hasOwn(data, "password"))
            return reply.code(401).send("query password missing");
        const password = data["password"];
        if (!password) // gonna need better password securities obviously
            return {success: false, reason: "No password given"};
        const db = new Database(dbPath);
        const update = db.prepare("UPDATE users SET password = ? WHERE id = ?");
        res = update.run(password, req.user.id).changes == 0
        db.close();
        if (res.changes == 0) {
            return reply.send({success: false, reason: "Databse didn't find you"});
        }
        return reply.send({success: true, reason: ":D"});
    });

    fastifyInstance.post("/logout", async (req, reply) => {
        reply.clearCookie("account");
        return reply.header("x-authenticated", false).send("Goodbye");
    });
}
