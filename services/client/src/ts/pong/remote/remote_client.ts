import { goToURL } from "../../utils.js";
import { getKeyConfig } from "../config/local_settings.js";
import { DataFrame, keyControl } from "../engine/engine_interfaces.js";
import { FrameManager } from "./frameManager.js";

let pingTimeout: ReturnType<typeof setTimeout> | undefined = undefined;
const ping_time = 5000;

export type PongMessageType =
  | { type: "pong"; payload: number }
  | { type: "join"; status: true }
  | { type: "join"; status: false; reason: string }
  | { type: "update"; payload: DataFrame };

let ws: WebSocket;
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
      let message;
      message = control.pressed ? "press" : "release";
      message += i === 0 ? "Up" : "Down";
      console.log("input:" + control.key);
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
  document.removeEventListener("keydown", eventKeyInputPong);
  document.removeEventListener("keyup", eventKeyInputPong);
  display = undefined;
  ws_disconnect();
}

self["join_party"] = join_party;

function sendJoinMessage(game_id: string) {
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
  if (ws) {
    ws.close();
  }
  console.log("Connecting to remote pong websocket...");
  ws = new WebSocket("/api/remote");
  ws.onopen = () => {
    console.log("WebSocket connection established");
    sendJoinMessage(game_id);
    pingTimeout = setTimeout(() => ws_ping(), ping_time);
  };
  ws.addEventListener("close", (event) => {
    console.log(event.code, event.reason);
    ws_delete();
  });
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    ws_delete();
  };
  ws.onmessage = (event) => {
    ws_message(event);
  };
  ws.addEventListener("message", (event) => {
    console.log(event);
    ws_message_pong(event.data.toString());
  });
  ws.addEventListener("message", ws_join);
}

self["ws_connect"] = ws_connect;

function ws_message_pong(message: string) {
  const messageObject = JSON.parse(message) as PongMessageType;
  if (messageObject.type !== "pong") return;

  let ping_id: number = messageObject.payload;
  if (ping_id != last_ping.id) return;

  let send_time = last_ping.time;
  let rtt = performance.now() - send_time;
  console.log(`Ping time: ${rtt} ms`);
  pingTimeout = setTimeout(() => ws_ping(), ping_time);
}

function ws_join(event: MessageEvent) {
  const message = JSON.parse(event.data) as PongMessageType;

  if (message.type !== "join") return;

  if (message.status === true) {
    goToURL("netplay", true);
    console.log("popstate added");
    self.addEventListener("popstate", ws_delete, { once: true });

    ws.addEventListener("message", (event) => {
      ws_message_update(event.target as WebSocket, event.data.toString());
    });
    display = new FrameManager();
    config = getKeyConfig("player_one");
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
  const node = document.createTextNode(message);
  para.appendChild(node);
  chat.appendChild(para);
}

function ws_message_update(ws: WebSocket, message: string) {
  const messageObject = JSON.parse(message) as PongMessageType;
  if (messageObject.type !== "update") return;
  try {
    display.update(messageObject.payload);
  } catch {}
}

function ws_message(event) {
  let message = JSON.parse(event.data.toString()) as PongMessageType;
  console.log("message:", message);
}

function ws_ping() {
  let ping_id = ping_count++;
  let performance_now = performance.now();
  last_ping = { id: ping_id, time: performance_now };
  ws.send(JSON.stringify({ type: "ping", payload: ping_id }));
}

function ws_disconnect() {
  if (ws) {
    ws.close();
  }
}
