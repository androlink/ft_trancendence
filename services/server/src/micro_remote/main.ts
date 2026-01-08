import fastifyModule from "fastify";
import fastifyWebSocket from "@fastify/websocket";
import fastifyJWT from "@fastify/jwt";

import { Id, JwtUserPayload } from "../common/types";
import { initDB } from "../common/database";
import apiRemote from "./remote_route";
import createRoute from "./create_route";
import HealthCheckRoutes from "../common/healthcheck";

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

fastify.register(apiRemote, { prefix: "/api" });
fastify.register(createRoute, { prefix: "/api" });

fastify.register(HealthCheckRoutes);

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
});
