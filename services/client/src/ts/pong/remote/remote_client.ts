import { sendMessage } from "../../html/events.js";
import { findLanguage, selectLanguage } from "../../html/templates.js";
import { goToURL } from "../../utils.js";
import { getKeyConfig } from "../config/local_settings.js";
import { DataFrame, keyControl } from "../engine/engine_interfaces.js";
import { players } from "../engine/engine_variables.js";
import { FrameManager } from "./frameManager.js";

let pingTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
const ping_time = 5000;

export type PongMessageType =
  | { type: "pong"; payload: number }
  | { type: "join"; status: true; players: string[] }
  | { type: "join"; status: false; reason: string }
  | { type: "update"; payload: DataFrame };

let ws: WebSocket | undefined = undefined;

let display: FrameManager;
let last_ping: { id: number; time: ReturnType<typeof performance.now> } = {
  id: 0,
  time: 0,
};
let ping_count: number = 0;

let config: [keyControl, keyControl];

function eventKeyInputPong(event: KeyboardEvent) {
  if (!config) return;

  if (event.repeat) return;
  config.forEach((control, i) => {
    if (
      control.code !== undefined
        ? control.code === event.code
        : control.key.toLowerCase() === event.key.toLowerCase()
    ) {
      control.pressed = event.type === "keydown";
      event.preventDefault();
      let message: string = "";
      message = control.pressed ? "press" : "release";
      message += i === 0 ? "Up" : "Down";
      ws.send(JSON.stringify({ type: "input", input: message }));
    }
  });
}

export function join_party(game_id: string) {
  ws_connect(game_id);
  document.addEventListener("keydown", eventKeyInputPong);
  document.addEventListener("keyup", eventKeyInputPong);
}

function ws_delete() {
  clearTimeout(pingTimeout);
  pingTimeout = undefined;
  self.removeEventListener("popstate", ws_delete);
  document.removeEventListener("keydown", eventKeyInputPong);
  document.removeEventListener("keyup", eventKeyInputPong);
  display = undefined;
  ws_disconnect();
}

self["join_party"] = join_party;

function sendJoinMessage(ws: WebSocket, game_id: string) {
  ws.send(
    JSON.stringify({
      type: "join",
      payload: {
        token: localStorage.getItem("token"),
        room_id: game_id,
      },
    })
  );
}

function ws_connect(game_id: string) {
  console.log(ws);
  if (ws) {
    return;
  }
  ws = new WebSocket("/api/remote");
  ws.onopen = () => {
    sendJoinMessage(ws, game_id);
    pingTimeout = setTimeout(() => ws_ping(ws), ping_time);
  };
  ws.onclose = (event) => {
    console.info("WebSocket close:", event.reason);
    ws_delete();
  };
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    ws_delete();
  };
  ws.addEventListener("message", ws_message_pong);
  ws.addEventListener("message", ws_join);
}

function ws_message_pong(event: MessageEvent) {
  const messageObject = JSON.parse(event.data) as PongMessageType;
  if (messageObject.type !== "pong") return;

  let ping_id: number = messageObject.payload;
  if (ping_id != last_ping.id) return;

  let send_time = last_ping.time;
  let rtt = performance.now() - send_time;
  console.log(`Ping time: ${rtt} ms`);
  pingTimeout = setTimeout(() => ws_ping(ws), ping_time);
}

function ws_join(event: MessageEvent) {
  const message = JSON.parse(event.data) as PongMessageType;

  if (message.type !== "join") return;

  if (message.status === true) {
    goToURL("netplay", true);
    self.addEventListener("popstate", ws_delete, { once: true });

    event.target.addEventListener("message", ws_message_update);
    display = new FrameManager();
    config = getKeyConfig("player_one");
    sendMessage(selectLanguage(["game presentation", ...message.players]));
  } else {
    show_join_message_error(message.reason);
  }
  event.target.removeEventListener("message", ws_join);
}

function show_join_message_error(message: string) {
  const chat = document.getElementById("chat-content");
  if (!chat) {
    console.error(
      `message '${message}' not sent to the chat because the chat is not found`
    );
    return false;
  }
  const para = document.createElement("p");
  const node = document.createTextNode(findLanguage(message));
  para.appendChild(node);
  chat.appendChild(para);
}

function ws_message_update(event: MessageEvent) {
  const messageObject = JSON.parse(event.data) as PongMessageType;
  try {
    if (messageObject.type !== "update") return;
    display.update(messageObject.payload);
  } catch {}
}

function ws_ping(ws: WebSocket) {
  let ping_id = ping_count++;
  let performance_now = performance.now();
  last_ping = { id: ping_id, time: performance_now };
  ws.send(JSON.stringify({ type: "ping", payload: ping_id }));
}

function ws_disconnect() {
  if (!ws) {
    return;
  }
  ws.removeEventListener("message", ws_message_pong);
  ws.removeEventListener("message", ws_message_update);
  ws.removeEventListener("message", ws_join);
  ws.close();
  ws = undefined;
}
