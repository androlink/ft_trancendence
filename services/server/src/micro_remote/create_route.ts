import fastifyModule, { FastifyInstance } from "fastify";
import fastifyFormbody from "@fastify/formbody";
import fastifyMultipart from "@fastify/multipart";
import { Id } from "../common/types";
import { pong_party_create } from "./pong_party";
import db from "../common/database";

export default async function createRoute(fastify: FastifyInstance) {
  fastify.register(fastifyMultipart);
  fastify.register(fastifyFormbody);
  fastify.post<{ Body: { player1: Id; player2: Id } }>(
    "/create",
    async (req, reply) => {
      if (req.body === undefined) return reply.code(400).send("");
      const body = JSON.parse(req.body as unknown as string);
      console.log(body);
      console.log(body.player1);
      console.log(body.player2);
      const ids = [body.player1, body.player2];
      console.log("ids", ids);
      if (body.player1 === body.player2) return reply.code(400).send("");
      let party = pong_party_create(ids);
      if (party === null) return reply.code(500).send("");
      console.log(`new party id: ${party.getId()}`);
      return reply.code(200).send(
        JSON.stringify({
          game_id: party.getId(),
          player1: body.player1,
          player2: body.player2,
        })
      );
    }
  );
}
