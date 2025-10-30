
import fastifyConf from './config.js'

import { apiRoutes } from './api_routes.js';
import { loginRoutes } from './accounts_routes.js';
import { launchDB } from './database.js';
import { assetsPath } from './config.js';
import { errorRoutes } from './error_routes.js';

const fastify = fastifyConf();
await launchDB();

fastify.setNotFoundHandler((req, reply) => {
  if (req.method !== "GET") return reply.code(405).send(`Method ${req.method} not implemented on this route\n`);
  if (req.url.startsWith(assetsPath)) return reply.code(404).send("Not Found\n");
  return reply.code(200).sendFile('/page.html');
});
fastify.register(apiRoutes, { prefix: '/api' });
fastify.register(loginRoutes);
fastify.register(errorRoutes, {prefix: '/error'})

fastify.listen({port: 3000,  host: '0.0.0.0'}, (err, address) => {
  if (err) throw err
});
