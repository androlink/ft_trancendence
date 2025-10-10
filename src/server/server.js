
import fastifyConf from './config.js'

import { apiRoutes } from './api_routes.js';
import { loginRoutes } from './login_routes.js';

const fastify = fastifyConf();

fastify.setNotFoundHandler((req, reply) => reply.code(200).sendFile('/page.html'));
fastify.register(apiRoutes, { prefix: '/api' });
fastify.register(loginRoutes);

fastify.listen({port: 3000,  host: '0.0.0.0'}, (err, address) => {
  if (err) throw err
});
