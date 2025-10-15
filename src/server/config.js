import fastifyModule from 'fastify';
import fastifyStatic from '@fastify/static';
import fastifyJWT from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyFormbody from '@fastify/formbody';

// if changed for better naming convention
// need to be changed in page.html and template.ts too
const assetsPath = '/resources';

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
    prefix: assetsPath,
    wildcard: false
  });

  fastify.register(fastifyCookie);
  // would be good to add a signature for the cookies.
  // It's an easy security to add

  fastify.register(function (fastifyInstance) {
    fastifyInstance.get('/', (req, reply) =>
      reply.send("Hello user, that's where we keep our static files"));
    fastifyInstance.setNotFoundHandler((req, reply) =>
      reply.code(404).send('Not Found'));
  }, { prefix: assetsPath });

  fastify.register(fastifyJWT, {
    secret: "We should have a secret that's long so it's secure against bruteforce",
    // need to be changed for something hidden
    cookie: {
      cookieName: 'account',
      signed: false,
    }
  });

  return fastify;
}