import fastifyModule from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart'
import { dbLogFile } from './database.js';



// if changed for better naming convention
// need to be changed in page.html and template.ts too
export const assetsPath = '/resources';

export default function () {
  const fastify = fastifyModule({
    bodyLimit: 100485760,
    routerOptions: {
      ignoreTrailingSlash: true,
      ignoreDuplicateSlashes: true
    }
  });

  fastify.register(fastifyMultipart);

  fastify.register(fastifyFormbody);

  fastify.register(fastifyStatic, {
    root: '/var/www',
    prefix: assetsPath
  });
  
  fastify.get(`/${assetsPath}`, (req, reply) =>
    reply.send("Hello user, that's where we keep our static files\n"));

  fastify.register(fastifyCookie, {
    secret: process.env.COOKIE_SECURITY_KEY,
  });

  fastify.register(fastifyJWT, {
    secret: process.env.JWT_SECURITY_KEY,
    cookie: {
      cookieName: 'account',
      signed: false,
    }
  });

  return fastify;
}