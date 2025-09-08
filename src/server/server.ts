const fastify = require('fastify')({
   routerOptions: {
    ignoreTrailingSlash: true
  }
});

const path = require('node:path')

fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, '../client'),
})

fastify.get('/api/login', function (req, reply) {
  return {template: "Login", title: "login"}
})

fastify.get('/api/home', function (req, reply) {
  return {template: "Home", title: "ft_transcendence", inner: "Pdf"}
})

fastify.get('/api/game', function (req, reply) {
  return {template: "Home", title: "Pong soon", inner: "Game"}
})

fastify.get('/api/video', function (req, reply) {
  return {template: "Home", title: "Dana Terrace", inner: "Video"}
})

fastify.get('/api/*', function (req, reply) {
  return {template: "Error", replace: {status: "Error 404", message: "are you lost by any chance ?"}, title: "404 Not Found"}
})

fastify.get('/api', function (req, reply) {
  return {template: "Welcome", title: "welcome"}
})

fastify.setNotFoundHandler((req, reply) => {
  reply.sendFile('page.html');
});

// note to whoever read : https://github.com/fastify/fastify-static

// Run the server!
fastify.listen({ port: 3000,  host: '0.0.0.0'}, (err, address) => {
  if (err) throw err
})
