
import fastifyConf from './config'

import { apiRoutes } from './api_routes';
import { loginRoutes } from './accounts_routes';
import { launchDB } from './database';
import { assetsPath } from './config';
import liveChat from './live_chat';
import { errorRoutes } from './error_routes';
import { miscRoutes } from './misc_routes';

export default fastifyConf();
import  fastify from "./server"

await launchDB();

fastify.setNotFoundHandler((req, reply) => {
  if (req.method !== "GET") return reply.code(405).send(`Method ${req.method} not implemented on this route\n`);
  if (req.url.startsWith(assetsPath)) return reply.code(404).send("Not Found\n");
  return reply.code(200).sendFile('/page.html');
});
fastify.register(apiRoutes, { prefix: '/api' });
fastify.register(loginRoutes);
fastify.register(errorRoutes, {prefix: '/error'});
fastify.register(miscRoutes, {prefix: '/misc'});
fastify.register(liveChat);

fastify.listen({port: 3000,  host: '0.0.0.0'}, (err, address) => {
  if (err) throw err
});
