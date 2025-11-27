import fastifyConf from "./config";

import { apiRoutes } from "./api_routes";
import { loginRoutes } from "./accounts_routes";
import { launchDB } from "./database";
import { assetsPath } from "./config";
import liveChat from "./live_chat";
import { errorRoutes } from "./error_routes";
import { miscRoutes } from "./misc_routes";

export default fastifyConf();
import fastify from "./server";

await launchDB();

fastify.setNotFoundHandler((req, reply) => {
  if (req.method !== "GET")
    return reply
      .code(405)
      .send(`Method ${req.method} not implemented on this route\n`);
  if (req.url.startsWith(assetsPath))
    return reply.code(404).send("Not Found\n");
  return reply.code(200).sendFile("/page.html");
});
fastify.register(apiRoutes, { prefix: "/api" }); // should be renamed /api/display due to being about front display
fastify.register(loginRoutes); // should be renamed /api/account due to being about all the accounts
fastify.register(errorRoutes, { prefix: "/error" }); // does not need any prefix if its own docker
fastify.register(miscRoutes, { prefix: "/misc" }); // should be renamed something like /api/misc
fastify.register(liveChat); // i don't know ask sjean

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
});
