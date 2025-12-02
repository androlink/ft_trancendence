import fastifyModule from "fastify";
import fastifyStatic from "@fastify/static";

// if changed for better naming convention
// need to be changed in page.html and template too
export const assetsPath = "/resources";

const fastify = fastifyModule({
  routerOptions: {
    ignoreTrailingSlash: true,
  },
});

fastify.setNotFoundHandler((req, reply) => {
  if (req.method !== "GET")
    return reply
      .code(405)
      .send(`Method ${req.method} not implemented on this route\n`);
  if (req.url.startsWith(assetsPath))
    return reply.code(404).send("Not Found\n");
  return reply.code(200).sendFile("/page.html");
});

fastify.register(fastifyStatic, {
  root: "/var/www",
  prefix: assetsPath,
});

fastify.get(`/${assetsPath}`, (req, reply) =>
  reply.send("Hello user, that's where we keep our static files\n")
);

fastify.get(`/favicon.ico`, (req, reply) => reply.sendFile("favicon.ico"));

fastify.listen({ port: 3000, host: "0.0.0.0" }, (err, address) => {
  if (err) throw err;
});
