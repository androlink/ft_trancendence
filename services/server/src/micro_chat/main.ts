import fastifyModule from "fastify";
import fastifyWebSocket from "@fastify/websocket";
import fastifyJWT from "@fastify/jwt";

import { Id, JwtUserPayload } from "../common/types";
import chatRoute from "./chat_route";
import { initDB } from "../common/database";
import HealthCheckRoutes from "../common/healthcheck";
import StatusRoute from "./status_route";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: Id;
    user: JwtUserPayload;
  }
}

// if changed for better naming convention
// need to be changed in page.html and template too
export const assetsPath = "/resources";

export const fastify = fastifyModule({
  routerOptions: {
    ignoreTrailingSlash: true,
  },
});

fastify.register(fastifyWebSocket);
fastify.register(fastifyJWT, {
  secret: process.env.JWT_SECURITY_KEY || "",
});

await initDB();

fastify.register(chatRoute, { prefix: "/api" });
fastify.register(StatusRoute);

fastify.register(HealthCheckRoutes);

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
});
