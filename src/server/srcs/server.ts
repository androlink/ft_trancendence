import fastifyModule from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import fastifyWS from '@fastify/websocket';
import fastifyFormbody from '@fastify/formbody';
import { apiRoutes } from './api_routes';
import { loginRoutes } from './login_routes';
import liveChat from './live_chat';

const fastify = fastifyModule({
  logger: true,
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

fastify.register(fastifyWS, 
{
  options: {
    clientTracking: true,
    maxPayload: 1048576
  }
});


fastify.setNotFoundHandler((_req, reply) => {
  return reply.code(418).sendFile('/page.html');
});

fastify.register(apiRoutes, { prefix: '/api' });
fastify.register(loginRoutes);
fastify.register(liveChat);

fastify.listen({port: 3000,  host: '0.0.0.0'}, (err, address) => {
  if (err) throw err
})
