import fastifyModule from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import fastifyFormbody from '@fastify/formbody';
import { apiRoutes } from './api_routes.js';
import { loginRoutes } from './login_routes.js';

const fastify = fastifyModule({
  routerOptions: {
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true
  }
});

fastify.register(fastifyFormbody);

fastify.register(fastifyStatic, {
  root: '/var/www'
});

fastify.register(fastifyJWT, {
  secret: 'KEY'
});

fastify.setNotFoundHandler((req, reply) => {
  return reply.code(200).sendFile('/page.html');
});

fastify.register(apiRoutes, { prefix: '/api' });
fastify.register(loginRoutes);

fastify.listen({port: 3000,  host: '0.0.0.0'}, (err, address) => {
  if (err) throw err
})
