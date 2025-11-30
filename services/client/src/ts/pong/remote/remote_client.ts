
import { PongDisplay } from "../display.js";
import { goToURL } from "../../utils.js";

let pingTimeout: ReturnType<typeof setTimeout> | null = null;
const ping_time = 5000;

type RequestType = "JOIN" | "PING" | "GAME";

interface IMessage
{
  type: RequestType;
  message?: any;
};



let ws: WebSocket;
let display: PongDisplay;
let ping_map: Map<number, number> = new Map();
let ping_count: number = 0;

function eventKeyInputPong(event: KeyboardEvent)
{

  let message = null;
  if (event.key !== 'w' && event.key !== 's' )
    return;
  message = event.type === "keydown" ? "press" : "release";
  message += event.key === 'w' ? "Up": "Down";
  console.log("input:" + event.key);
  return ws.send(JSON.stringify({type: "GAME", input: message}));
}

export function connect_remote_play(game_id: string)
{

  ws_connect(game_id);

  self.addEventListener("popstate", (ev) => {
    if(location.pathname !== "/netplay")
      ws_delete();
    }, {once: true});
  document.addEventListener("keydown", eventKeyInputPong);
  document.addEventListener("keyup", eventKeyInputPong);
}

function ws_delete()
{
  document.removeEventListener("keydown", eventKeyInputPong);
  document.removeEventListener("keyup", eventKeyInputPong);
  if (ws)
    ws.close();
}

function ws_connect(game_id: string)
{
  console.log("Connecting to remote pong websocket...");
  ws = new WebSocket("/api/ws/pong");
  ws.onopen = () => {
    console.log("WebSocket connection established");
    ws.send(JSON.stringify({ type: "JOIN", token: localStorage.getItem("token"), message: game_id}));
    pingTimeout = setTimeout(() => ws_ping(), ping_time);
  };
  ws.onclose = () => {
    console.log("WebSocket connection closed");
    ws = null;
    clearTimeout(pingTimeout);
    pingTimeout = null;
    ping_map.clear();
    document.removeEventListener("keydown", eventKeyInputPong);
    document.removeEventListener("keyup", eventKeyInputPong);
  };
  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    ping_map.clear();
  };
  ws.onmessage = (event) => {
    console.log("WebSocket message received:", event.data);
    ws_message(event);
  };
}

function ws_message(event)
{
  let message = JSON.parse(event.data.toString()) as IMessage;

  switch (message.type)
  {
    case "PING":
    {
      if (message.message === undefined)
        return ;
      let ping_id: number = message.message;
      let send_time = ping_map.get(ping_id);
      if (!send_time)
        return;
      let rtt = performance.now() - send_time;
      console.log(`Ping time: ${rtt} ms`);
      ping_map.delete(ping_id);
      pingTimeout = setTimeout(() => ws_ping(), ping_time);
    }break;
    case "JOIN":
    {
      // if (message.message == "ok")
      //   goToURL("netplay").then(() => display = new PongDisplay());
      console.log(message);
    }break;
    case "GAME":
    {
      if (display === undefined)
        display = new PongDisplay();
      display.update(message.message);
    }break;
    default:
    {
      console.log("Unknown message type:", message.type);
    } break;
  }
}

function ws_ping()
{
  let ping_id = ping_count++;
  let performance_now = performance.now();
  ping_map.set(ping_id, performance_now);
  ws.send(JSON.stringify({ type: "PING", message: ping_id}));
}

function ws_disconnect()
{
  if (ws)
  {
    ws.close();
    ws = null;
  }
}

connect_remote_play("000");