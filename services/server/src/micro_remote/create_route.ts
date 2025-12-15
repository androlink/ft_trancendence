import fastifyModule, { FastifyInstance } from "fastify";
import fastifyFormbody from "@fastify/formbody";
import fastifyMultipart from "@fastify/multipart";
import { Id, RemotePongReasonCode } from "../common/types";
import { pong_party_create } from "./pong_party";
import db from "../common/database";

export default async function createRoute(fastify: FastifyInstance) {
  fastify.register(fastifyMultipart);
  fastify.register(fastifyFormbody);
  fastify.post<{ Body: { player1: Id; player2: Id } }>(
    "/create",
    async (req, reply) => {
      if (req.body === undefined)
        return reply.send({
          status: false,
          reason: RemotePongReasonCode.INVALID_REQUEST,
        });
      const body = JSON.parse(req.body as unknown as string);
      const ids = [body.player1, body.player2];
      if (body.player1 === body.player2)
        return reply.send({
          status: false,
          reason: RemotePongReasonCode.CANNOT_PLAY_WITH_YOURSELF,
        });
      let party = pong_party_create(ids);
      if (party.status === false) return reply.send(party);
      return reply.send(
        JSON.stringify({
          status: true,
          room_id: party.room_id,
          player1: body.player1,
          player2: body.player2,
        })
      );
    }
  );
}
