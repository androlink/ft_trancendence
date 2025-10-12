
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

    fastifyInstance.get('/login', (req, reply) => {
        return reply.send({
            template: "Home",
            title: "login",
            inner: "Login",
        });
    });

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

    fastifyInstance.get('/profile', (req, reply) => {
        if (1) {
            // redirection change the UI, not the url of the browser. 
            // It's intended, can be changed if needed
            return reply.redirect('login');
        }
        return reply.send({
            template: "Home",
            replace: {username: "You apparently", biography: "Is a dev"},
            title: "You", inner: "Profile1",
        });
    });

    fastifyInstance.get('/profile/:username', (req, reply) => {
        const username = req.params.username;
        const db = new Database(dbPath);
        const row = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
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
