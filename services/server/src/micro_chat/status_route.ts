import { FastifyInstance } from "fastify";
import { getClientById } from "./chat_route";
import { Id } from "../common/types";

export default async function StatusRoute(fastifyInstance: FastifyInstance) {
  fastifyInstance.get<{ Querystring: { id: string } }>(
    "/user_status",
    (req, reply) => {
      const client = getClientById(parseInt(req.query.id));
      if (!req.query.id) return reply.send({ status: false });

      return reply.send({ status: client ? true : false });
    }
  );
}
