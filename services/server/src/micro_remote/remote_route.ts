import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

import { fastify } from "./main.ts";

import "@fastify/websocket";
import WebSocket from "ws";

import { Id, RemotePongReasonCode } from "../common/types.ts";
import { GameWebSocket, JoinType, PongMessageType } from "./local_type.ts";

import { pong_party_add_player } from "./pong_party.ts";

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
  if (id === null) {
    ws.send(
      JSON.stringify({
        type: "join",
        status: false,
        reason: RemotePongReasonCode.NOT_CONNECTED,
      })
    );
    return ws.close(3000, RemotePongReasonCode.NOT_CONNECTED);
  }
  (ws as GameWebSocket).id = id;
  const room_id = payload.room_id;
  if (!room_id) {
    ws.send(
      JSON.stringify({
        type: "join",
        status: false,
        reason: RemotePongReasonCode.GAME_NOT_FOUND,
      })
    );
    return ws.close(3001, RemotePongReasonCode.GAME_NOT_FOUND);
  }
  if (pong_party_add_player(room_id, id, ws as GameWebSocket) === false) {
    ws.send(
      JSON.stringify({
        type: "join",
        status: false,
        reason: RemotePongReasonCode.CANNOT_JOIN_GAME,
      })
    );
    return ws.close(3002, RemotePongReasonCode.CANNOT_JOIN_GAME);
  }
  return ws.send(JSON.stringify({ type: "join", status: true }));
}

async function ws_message_join(ws: WebSocket, message: string) {
  try {
    const messageObject = JSON.parse(message) as PongMessageType;
    if (messageObject.type !== "join") return;

    await ws_join(ws, messageObject.payload);
  } catch (e) {
    console.error("join: ", e);
  }
}

async function ws_message_ping(ws: WebSocket, message: string) {
  const messageObject = JSON.parse(message) as PongMessageType;
  if (messageObject.type !== "ping") return;

  return ws.send(
    JSON.stringify({ type: "pong", payload: messageObject.payload })
  );
}

function client_entrypoint(ws: WebSocket, req: FastifyRequest) {
  ws.addEventListener(
    "open",
    (event) => {
      console.log("new client");
    },
    { once: true }
  );
  ws.addEventListener(
    "error",
    (event) => {
      console.log("websocket error:", event.message);
      ws.close();
    },
    { once: true }
  );
  ws.addEventListener(
    "close",
    (event) => {
      console.log("websocket close:", event.reason);
      ws.close();
    },
    { once: true }
  );
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
