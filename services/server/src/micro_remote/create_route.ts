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
      if (req.body === undefined) return reply.code(400);
      console.log(req.body);
      let party = pong_party_create([req.body.player1, req.body.player2]);
      if (!party) return reply.code(500);
      console.log(`new party id: ${party.getId()}`);
      return reply.code(200).send(
        JSON.stringify({
          success: true,
          content: {
            game_id: party.getId(),
            player1: req.body.player1,
            player2: req.body.player2,
          },
        })
      );
    }
  );
}
