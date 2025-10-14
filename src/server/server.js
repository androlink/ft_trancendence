
import fastifyConf from './config.js'

import { apiRoutes } from './api_routes.js';
import { loginRoutes } from './login_routes.js';
import { launchDB } from './database.js';

const fastify = fastifyConf();
launchDB();

fastify.setNotFoundHandler((req, reply) => {
  if (req.method === "GET") return reply.code(200).sendFile('/page.html');
  return reply.code(405).send(`Method ${req.method} not implemented on this route`);
});
fastify.register(apiRoutes, { prefix: '/api' });
fastify.register(loginRoutes);

fastify.listen({port: 3000,  host: '0.0.0.0'}, (err, address) => {
  if (err) throw err
});
