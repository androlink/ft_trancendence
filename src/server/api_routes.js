
import Database from "better-sqlite3";
import { dbPath } from "./database.js";

export async function apiRoutes(fastifyInstance) {
    fastifyInstance.setNotFoundHandler ( (req, reply) => {
        return reply.code(404).send({
            template: "Error",
            replace: {status: "Error 404", message: "are you lost by any chance ?"}, 
            title: "404 Not Found",
        });
    });

    fastifyInstance.addHook('onRequest', async (req, reply) => {
        try {
            await req.jwtVerify();
            const token = fastifyInstance.jwt.sign({id: req.user.id},  {expiresIn: '15m'});
            reply.setCookie('account', token, {path: '/', httpOnly: true, secure: true, sameSite: 'Strict', maxAge: 15 * 60, });
            reply.header('x-authenticated', true);
        } catch (err) {
            req.user = {id: -1};
            reply.header('x-authenticated', false);
        }
    });

    const needConnection = async (req, reply) => {
        if (req.user.id === -1) {
            return reply.send({
                template: "Home",
                title: "login",
                inner: "Login",
            });
        }
    };
    // login now only use the profile route due to consistency
    // and because it made no sense to have a login page when connected
    
    // those comments will be removed in a future pull request

    // fastifyInstance.get('/login', (req, reply) => {
    //     return reply.send({
    //         template: "Home",
    //         title: "login",
    //         inner: "Login",
    //     });
    // });

    fastifyInstance.get('/', (req, reply) => {
        return reply.send({
            template: "Home",
            title: "ft_transcendence",
            inner: "Pdf",
        });
    });

    fastifyInstance.get('/game', (req, reply) => {
        return reply.send({
            template: "Home",
            title: "Pong soon",
            inner: "Game",
        });
    });

    fastifyInstance.get('/profile', { onRequest: needConnection }, (req, reply) => {
        const db = new Database(dbPath);
        const row = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
        db.close();
        if (!row) {
            // might happen if someone got their account deleted between requests
            return reply.code(404).send({
                template: "Home", title: "who ?", inner: "Error",
                replace: {status: "Error 404", message: "You don't exist in the DB for some reason"},
            });
        }
        return reply.send({
            template: "Home",
            replace: {username: row.username, biography: row.bio},
            title: "You", inner: "Profile1",
        });
    });

    fastifyInstance.get('/profile/:username', (req, reply) => {
        const username = req.params.username;
        const db = new Database(dbPath);
        const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        db.close();
        if (!row)
            return reply.send({
                template: "Home", title: username, inner: "Error",
                replace: {status: "Error 404", message: "That user doesn't exist"},
            });
        return reply.send({
            template: "Home",
            replace: {username: username, biography: row.bio},
            title: username, inner: "Profile2",
        });
    });

    fastifyInstance.get('/blank', (req, reply) => {
        return reply.send({
            template: "Home",
            title: "Boooriiing",
            inner: "Blank",
        });
    });
}
