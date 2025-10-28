
import fastifyConf from './config'

import { apiRoutes } from './api_routes';
import { loginRoutes } from './accounts_routes';
import { launchDB } from './database';
import { assetsPath } from './config';
import liveChat from './live_chat';
import fastifyWebSocket from "@fastify/websocket";

const fastify = fastifyConf();
await launchDB();

fastify.register(fastifyWebSocket);

fastify.setNotFoundHandler((req, reply) => {
  if (req.method !== "GET") return reply.code(405).send(`Method ${req.method} not implemented on this route\n`);
  if (req.url.startsWith(assetsPath)) return reply.code(404).send("Not Found\n");
  return reply.code(200).sendFile('/page.html');
});
fastify.register(apiRoutes, { prefix: '/api' });
fastify.register(loginRoutes);
fastify.register(liveChat);

fastify.listen({port: 3000,  host: '0.0.0.0'}, (err, address) => {
  if (err) throw err
});
