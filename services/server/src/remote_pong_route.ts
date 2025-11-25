import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"

import fastify from "./server";
import "@fastify/websocket";
import WebSocket from "ws";
import db from "./database"
import fastifyJwt from "@fastify/jwt";
import { Id } from "./types";


interface IGame{}

let wait_list: Map<Id, WebSocket.WebSocket> = new Map();
let connections: Set<WebSocket.WebSocket> = new Set();

let games: Map<string, IGame> = new Map();

type RequestType = "JOIN" | "LEAVE" | "PING" | "GAME" | "CONNECTION";

interface IMessage
{
  type: RequestType;
  message?: any;
}

function parse_message(data: WebSocket.Data): IMessage | null {
  let message: IMessage;
  message = JSON.parse(data.toString());
  return message;
}

function ws_join_handler(ws: WebSocket.WebSocket, req: FastifyRequest, message: IMessage) {
  if (connections.has(ws)) { // already connected
    return ws.send(JSON.stringify({ type: "CONNECTION", message: "not connected"}));
  }
  try {
    const game_id: string = message.message;
    if (!games.has(game_id)) {
      throw new Error("Game not found");
    }
  }
  catch (err) {
    ws.send(JSON.stringify({ type: "JOIN", message: "game not found"}));
  }
}

function ws_connection_handler(ws: WebSocket.WebSocket, req: FastifyRequest, message: IMessage) {
  if (!connections.has(ws)) { // already connected
    return ws.send(JSON.stringify({ type: "CONNECTION", message: "already connected"}));
  }
  try {
    const token: string = message.message;
    const id: Id = fastify.jwt.decode(token)["id"]//get sender id;
    connections.delete(ws);
    ws["id"] = id;
    wait_list.set(id, ws);    // add to wait list
    ws.onclose = (event) => { // change close event
      wait_list.delete(id);
    };
    return ws.send(JSON.stringify({ type: "CONNECTION", message: "connected" }) );
  }
  catch (err) {
    return ws.send(JSON.stringify({ type: "CONNECTION", message: "not connected"}));
  }
}

export default function remotePongRoute(ws: WebSocket.WebSocket, req: FastifyRequest) {
    {//on connection
    console.log("new connection to remote pong");
      connections.add(ws);
    }
    ws.onclose = (event) => {
      connections.delete(ws);
    };
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
          case "LEAVE": {
          } break;
          case "PING": {
            ws.send(JSON.stringify({ type: "PING", message: message.message }));
          } break;
          case "GAME": {
          } break;
          case "CONNECTION": {
            ws_connection_handler(ws, req, message);
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
