import fastifyModule from "fastify";

import miscRoute from "./api_misc";

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

fastify.register(miscRoute, { prefix: "/api/misc" });

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
});
