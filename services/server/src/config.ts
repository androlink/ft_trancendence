import fastifyModule from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyFormbody from '@fastify/formbody';
import { dbLogFile } from './database';

// if changed for better naming convention
// need to be changed in page.html and template too
export const assetsPath = '/resources';

export default function () {
  const fastify = fastifyModule({
    routerOptions: {
      ignoreTrailingSlash: true,
      ignoreDuplicateSlashes: true
    }
  });

  fastify.register(fastifyFormbody);

  fastify.register(fastifyStatic, {
    root: '/var/www',
    prefix: assetsPath
  });
  
  fastify.get(`/${assetsPath}`, (req, reply) =>
    reply.send("Hello user, that's where we keep our static files\n"));

  fastify.register(fastifyJWT, {
    secret: process.env.JWT_SECURITY_KEY,
  });

  return fastify;
}