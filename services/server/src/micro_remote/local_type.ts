import { Id } from "../common/types";
import WebSocket from "ws";

export type RequestType = "JOIN" | "PING" | "GAME";
export type input_type = "pressUp" | "releaseUp" | "pressDown" | "releaseDown";
export type JoinType = { token: string; room_id: string };

export type PongMessageType =
  | {
      type: "input";
      input: "pressDown" | "releaseDown" | "pressUp" | "releaseUp";
    }
  | { type: "join"; payload: any }
  | { type: "ping"; payload: any };

export interface GameWebSocket extends WebSocket {
  id: Id;
}
