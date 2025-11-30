import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import fastify from "../server";
import "@fastify/websocket";
import WebSocket from "ws";
import db from "../database"
import fastifyJwt from "@fastify/jwt";
import { Id } from "../types";
import {GameWebsocket, IMessage, RequestType} from "./engine/engine_interfaces.ts";

import { pong_party_add_player, pong_party_create, pong_party_exists } from "./pong_party.ts";

function parse_message(data: WebSocket.Data): IMessage | null {
  let message: IMessage;
  message = JSON.parse(data.toString());
  return message;
}

function ws_join_handler(ws: WebSocket.WebSocket, req: FastifyRequest, message: IMessage) {
  try {
    const token: string = message.token;
    if (token == undefined)
    {
      ws.send(JSON.stringify({ type: "JOIN", message: "token not found"}));
      ws.close();
      return ;
    }
    const id: Id = fastify.jwt.decode(token)["id"]//get sender id;
    ws["id"] = id;
    const game_id: string = message.message;
    if (token === undefined)
    {
      ws.send(JSON.stringify({ type: "JOIN", message: "invalid game_id"}));
      ws.close();
      return ;
    }
    if (!pong_party_exists(game_id)) {
      pong_party_create("000", [2, 3]);//return ws.send(JSON.stringify({ type: "JOIN", message: "game not found"}));
    }
    pong_party_add_player(game_id, id, ws);
    return ws.send(JSON.stringify({ type: "JOIN", message: "ok"}));
  }
  catch (err) {
    console.log("join:", err);
  }
}

export default function remotePongRoute(ws: WebSocket.WebSocket, req: FastifyRequest) {
  {//on connection
  console.log("new connection to remote pong");
  }
  ws.onmessage = (event) => {
    try {
      let message = parse_message(event.data);
      if (!message) {
        throw new Error("Invalid message format");
      }
      switch (message.type as RequestType) {
        case "JOIN": {
          ws_join_handler(ws, req, message);
        } break;
        case "PING": {
          ws.send(JSON.stringify({ type: "PING", message: message.message }));
        } break;
        case "GAME": {
          if (ws["oninput"])
            (ws as GameWebsocket).oninput(event, message);
        } break;
        default: {
          ws.send(JSON.stringify({ type: "WTF", message: event.data.toString()}));
        } break;
      }
    }
    catch (err) {
      console.error("Error handling remote pong message: ", err);
    }
  }
}
