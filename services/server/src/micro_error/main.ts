import fastifyModule from "fastify";

import errorRoute from "./error_routes";

// if changed for better naming convention
// need to be changed in page.html and template too
export const assetsPath = "/resources";

const fastify = fastifyModule({
  routerOptions: {
    ignoreTrailingSlash: true,
  },
});

fastify.register(errorRoute, { prefix: "/error" });

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
});
