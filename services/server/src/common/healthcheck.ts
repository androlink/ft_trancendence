import { FastifyInstance } from "fastify";

export default async function HealthCheckRoutes(
  fastifyInstance: FastifyInstance
) {
  fastifyInstance.get("/healthcheck", (req, reply) => {
    return reply.code(200).send("¯\\_(ツ)_/¯");
  });
}
