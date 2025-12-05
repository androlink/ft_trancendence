import WebSocket from "ws";

import { GameWebSocket } from "./local_type";
import { Id } from "../common/types";

export function initGameWebSocket(ws: WebSocket, id: Id): void {
  (ws as GameWebSocket).id = id;
}
