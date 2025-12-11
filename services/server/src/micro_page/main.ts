import fastifyModule from "fastify";
import fastifyJWT from "@fastify/jwt";

import pageRoute from "./api_page";
import { Id, JwtUserPayload } from "../common/types";
import { initDB } from "../common/database";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: Id;
    user: JwtUserPayload;
  }
}

// if changed for better naming convention
// need to be changed in page.html and template too
export const assetsPath = "/resources";

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

fastify.register(pageRoute, { prefix: "/api/page" });

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
});
