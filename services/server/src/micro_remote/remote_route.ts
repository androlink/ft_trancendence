import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { fastify } from "./main.ts";

import "@fastify/websocket";
import WebSocket from "ws";

import { Id } from "../common/types.ts";
import { GameWebSocket, JoinType, MessageType } from "./local_type.ts";

import {
  pong_party_add_player,
  pong_party_create,
  pong_party_exists,
} from "./pong_party.ts";

async function authenticate(token: string): Promise<Id | null> {
  try {
    const id: { id: Id } | null = fastify.jwt.decode(token);
    if (!id) throw 0;
    return id.id;
  } catch {
    return null;
  }
}

async function ws_join(ws: WebSocket, payload: JoinType): Promise<void> {
  const id = await authenticate(payload.token || "");
  if (id === null) return ws.close(3000, "token not found");
  (ws as GameWebSocket).id = id;
  const room_id = payload.room_id;
  if (!room_id) return ws.close(3001, `room ${payload.room_id} not found`);
  if (pong_party_add_player(room_id, id, ws as GameWebSocket) === false)
    return ws.close(3002, "cannot join game");
}

async function ws_message_join(ws: WebSocket, message: string) {
  try {
    const messageObject = JSON.parse(message) as MessageType;
    if (messageObject.type !== "join") return;

    await ws_join(ws, messageObject.payload);
  } catch (e) {
    console.error("join: ", e);
  }
}

async function ws_message_ping(ws: WebSocket, message: string) {
  const messageObject = JSON.parse(message) as MessageType;
  if (messageObject.type !== "ping") return;

  return ws.send(
    JSON.stringify({ type: "pong", payload: messageObject.payload })
  );
}

function client_entrypoint(ws: WebSocket, req: FastifyRequest) {
  ws.addEventListener("open", (event) => {
    event.target;
  });
  ws.addEventListener("open", (event) => {
    console.log("new client");
  });
  ws.addEventListener("error", (event) => {
    console.log("websocket error:", event.message);
  });
  ws.addEventListener("message", (event) => {
    ws_message_join(event.target, event.data.toString());
  });
  ws.addEventListener("message", (event) => {
    ws_message_ping(event.target, event.data.toString());
  });
}

export default async function apiRemote(fastify: FastifyInstance) {
  fastify.get("/remote", { websocket: true }, client_entrypoint);
}
