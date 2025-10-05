
export async function userRoutesGet(fastify) {
    fastify.get('/api/login', function (req, reply) {
        return {template: "Login", title: "login"}
    })

    fastify.get('/api/', function (req, reply) {
        return {template: "Home", title: "ft_transcendence", inner: "Pdf"}
    })

    fastify.get('/api/game', function (req, reply) {
        return {template: "Home", title: "Pong soon", inner: "Game"}
    })

    fastify.get('/api/profile', function (req, reply) {
        return {template: "Home", replace: {username: "You apparently", biography: "Is a dev, not a user, hopefully"}, title: "You", inner: "Profile1"}
    })

    fastify.get('/api/profile/*', function (req, reply) {
        return {template: "Home", replace: {username: "Someone else", biography: "I am a friend"}, title: "You", inner: "Profile2"}
    })

    fastify.get('/api/blank', function (req, reply) {
        return {template: "Home", title: "Boooriiing", inner: "Blank"}
    })

    fastify.get('/api/*', function (req, reply) {
    reply.status(404)
        return {template: "Error", replace: {status: "Error 404", message: "are you lost by any chance ?"}, title: "404 Not Found"}
    })

    fastify.setNotFoundHandler((req, reply) => {
        reply.sendFile('page.html');
    });
}

    // note to whoever read : https://github.com/fastify/fastify-static

