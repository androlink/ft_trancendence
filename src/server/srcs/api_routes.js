"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRoutes = apiRoutes;
async function apiRoutes(fastifyInstance) {
    fastifyInstance.get('/*', (req, reply) => {
        return reply.code(404).send({ template: "Error", replace: { status: "Error 404", message: "are you lost by any chance ?" }, title: "404 Not Found" });
    });
    fastifyInstance.get('/login', (req, reply) => {
        return reply.send({ template: "Home", title: "login", inner: "Login" });
    });
    fastifyInstance.get('/', (req, reply) => {
        return reply.send({ template: "Home", title: "ft_transcendence", inner: "Pdf" });
    });
    fastifyInstance.get('/game', (req, reply) => {
        return reply.send({ template: "Home", title: "Pong soon", inner: "Game" });
    });
    fastifyInstance.get('/profile', (req, reply) => {
        return reply.send({ template: "Home", replace: { username: "You apparently", biography: "Is a dev, not a user, hopefully" }, title: "You", inner: "Profile1" });
    });
    fastifyInstance.get('/profile/:username', (req, reply) => {
        const username = req.params.username;
        return reply.send({ template: "Home", replace: { username: username, biography: "I am a friend" }, title: username, inner: "Profile2" });
    });
    fastifyInstance.get('/blank', (req, reply) => {
        return reply.send({ template: "Home", title: "Boooriiing", inner: "Blank" });
    });
}
