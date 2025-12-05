import { PongDisplay } from "../display.js";
import { goToURL } from "../../utils.js";

let pingTimeout: ReturnType<typeof setTimeout> | null = null;
const ping_time = 5000;

export type MessageType = { type: string; payload: any };

let ws: WebSocket;
let display: PongDisplay;
let last_ping: { id: number; time } = { id: 0, time: 0 };
let ping_count: number = 0;

function eventKeyInputPong(event: KeyboardEvent) {
  let message = null;
  if (event.key !== "w" && event.key !== "s") return;
  message = event.type === "keydown" ? "press" : "release";
  message += event.key === "w" ? "Up" : "Down";
  console.log("input:" + event.key);
  return ws.send(JSON.stringify({ type: "input", input: message }));
}

export function connect_remote_play(game_id: string) {
  ws_connect(game_id);

  self.addEventListener(
    "popstate",
    (ev) => {
      if (location.pathname !== "/netplay") ws_delete();
    },
    { once: true }
  );
  document.addEventListener("keydown", eventKeyInputPong);
  document.addEventListener("keyup", eventKeyInputPong);
}

function ws_delete() {
  document.removeEventListener("keydown", eventKeyInputPong);
  document.removeEventListener("keyup", eventKeyInputPong);
  if (ws) ws.close();
}

function ws_connect(game_id: string) {
  console.log("Connecting to remote pong websocket...");
  ws = new WebSocket("/api/remote");
  ws.onopen = () => {
    console.log("WebSocket connection established");
    ws.send(
      JSON.stringify({
        type: "join",
        payload: {
          token: localStorage.getItem("token"),
          message: game_id,
        },
      })
    );
    pingTimeout = setTimeout(() => ws_ping(), ping_time);
  };
  ws.addEventListener("close", (event) => {
    console.log(event.code, event.reason);
  });
  ws.onclose = (event) => {
    console.log("WebSocket connection closed");
    ws = null;
    clearTimeout(pingTimeout);
    pingTimeout = null;
    document.removeEventListener("keydown", eventKeyInputPong);
    document.removeEventListener("keyup", eventKeyInputPong);
  };
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
  ws.onmessage = (event) => {
    console.log("WebSocket message received:", event.data);
    ws_message(event);
  };
  ws.addEventListener("message", (event) => {
    ws_message_pong(event.target as WebSocket, event.data.toString());
  });
}

function ws_message_pong(ws: WebSocket, message: string) {
  const messageObject = JSON.parse(message) as MessageType;
  if (messageObject.type !== "pong") return;

  let ping_id: number = messageObject.payload;
  if (ping_id != last_ping.id) return;

  let send_time = last_ping.time;
  let rtt = performance.now() - send_time;
  console.log(`Ping time: ${rtt} ms`);
  pingTimeout = setTimeout(() => ws_ping(), ping_time);
}

function ws_message_update(ws: WebSocket, message: string) {
  const messageObject = JSON.parse(message) as MessageType;
  if (messageObject.type !== "update") return;

  if (display === undefined) display = new PongDisplay();
  display.update(messageObject.payload);
}

function ws_message(event) {
  let message = JSON.parse(event.data.toString()) as MessageType;

  switch (message.type) {
    case "join":
      {
        // if (message.message == "ok")
        //   goToURL("netplay").then(() => display = new PongDisplay());
        ws.addEventListener("message", (event) => {
          ws_message_update(event.target as WebSocket, event.data.toString());
        });
        console.log(message);
      }
      break;
      break;
  }
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
    ws = null;
  }
}

connect_remote_play("000");
