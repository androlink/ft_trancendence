import fastifyModule from "fastify";
import fastifyJWT from "@fastify/jwt";
import fastifyFormbody from "@fastify/formbody";
import fastifyMultipart from "@fastify/multipart";

import apiAccount from "./accounts_routes";
import { Id, JwtUserPayload } from "../common/types";

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

fastify.register(fastifyMultipart);
fastify.register(fastifyFormbody);
fastify.register(fastifyJWT, {
  secret: process.env.JWT_SECURITY_KEY || "",
});

fastify.register(apiAccount, { prefix: "/api/account" });

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
});
