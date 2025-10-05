import fastifyModule from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import { userRoutesGet } from './fastify_get.js';
import { userRoutesLogin } from './fastify_login.js';

const fastify = fastifyModule({
  routerOptions: {
    ignoreTrailingSlash: true
  }
});

fastify.register(fastifyStatic, {
  root: '/var/www'
});

fastify.register(fastifyJWT, {
  secret: 'KEY'
});

fastify.register(userRoutesGet);

fastify.listen({port: 3000,  host: '0.0.0.0'}, (err, address) => {
  if (err) throw err
})
