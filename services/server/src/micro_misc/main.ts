import fastifyModule from "fastify";
import fastifyJWT from "@fastify/jwt";

import miscRoute from "./api_misc";
import { initDB } from "../common/database";
import { Id, JwtUserPayload } from "../common/types";

// if changed for better naming convention
// need to be changed in page.html and template too
export const assetsPath = "/resources";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: Id;
    user: JwtUserPayload;
  }
}

const fastify = fastifyModule({
  bodyLimit: 100485760,
  routerOptions: {
    ignoreTrailingSlash: true,
    ignoreDuplicateSlashes: true,
  },
});

await initDB();

fastify.register(fastifyJWT, {
  secret: process.env.JWT_SECURITY_KEY || "",
});

fastify.register(miscRoute, { prefix: "/api/misc" });
fastify.register(fastifyJWT, {
  secret: process.env.JWT_SECURITY_KEY || "",
});

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
});

(async () => {})().catch((err) => console.error(err));
