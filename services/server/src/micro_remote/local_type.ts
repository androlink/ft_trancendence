import { Id } from "../common/types";
import WebSocket from "ws";

export type input_type = "pressUp" | "releaseUp" | "pressDown" | "releaseDown";
export type JoinType = { token: string; room_id: string };

export type PongMessageType =
  | {
      type: "input";
      input: input_type;
    }
  | { type: "join"; payload: JoinType }
  | { type: "ping"; payload: any };

export interface GameWebSocket extends WebSocket {
  id: Id;
}
