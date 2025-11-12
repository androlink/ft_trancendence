import fastifyModule from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import fastifyFormbody from '@fastify/formbody';
import fastifyMultipart from '@fastify/multipart'
import fastifyWebSocket from "@fastify/websocket";
import { JwtUserPayload, Id } from './types';

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: Id;
    user: JwtUserPayload;
  }
}

// if changed for better naming convention
// need to be changed in page.html and template too
export const assetsPath = '/resources';

export default function () {
  const fastify = fastifyModule({
    bodyLimit: 100485760,
    routerOptions: {
      ignoreTrailingSlash: true,
    }
  });

  fastify.register(fastifyMultipart);

  fastify.register(fastifyWebSocket);
  fastify.register(fastifyFormbody);

  fastify.register(fastifyStatic, {
    root: '/var/www',
    prefix: assetsPath
  });
  
  fastify.get(`/${assetsPath}`, (req, reply) =>
    reply.send("Hello user, that's where we keep our static files\n"));
  fastify.get(`/favicon.ico`, (req, reply) =>
    reply.sendFile("favicon.ico"));

  fastify.register(fastifyJWT, {
    secret: process.env.JWT_SECURITY_KEY,
  });
  

  return fastify;
}