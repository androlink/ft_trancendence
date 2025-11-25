import { DataFrame } from "../engine/engine_interfaces";


let ws: WebSocket | null = null;
let pingInterval: ReturnType<typeof setTimeout> | null = null;

const ping_time = 5000;
const ping_map: Map<number, number> = new Map();

let game_view: DataFrame | null = null;

type RequestType = "JOIN" | "LEAVE" | "PING" | "GAME" | "CONNECTION";

interface IMessage
{
  type: RequestType;
  message?: any;
};

function ws_connect()
{
  try {
      
    console.log("Connecting to remote pong websocket...");
    ws = new WebSocket("/api/ws/pong");
    ws.onopen = () => {
      console.log("WebSocket connection established");
      ws.send(JSON.stringify({ type: "CONNECTION", message: localStorage.getItem("token") || "" }));
      pingInterval = setTimeout(ws_ping, ping_time);
    };
    ws.onclose = () => {
      console.log("WebSocket connection closed");
      ws = null;
      clearTimeout(pingInterval!);
      pingInterval = null;
      ping_map.clear();
    };
    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      ping_map.clear();
    };
    ws.onmessage = (event) => {
      console.log("WebSocket message received:", event.data);
      ws_message(event);
    };
    } catch (error) {
    console.error("WebSocket connection error:", error);
    console.debug(ws);
  }
}

function ws_message(event: MessageEvent)
{
  let message = JSON.parse(event.data.toString()) as IMessage;

  switch (message.type)
  {
    case "PING":
    {
      if (message.message !== undefined)
        return ;
      let ping_id: number = message.message;
      let sent_time = ping_map.get(ping_id);
      if (!sent_time)
        return;
      let rtt = performance.now() - sent_time;
      console.log(`Ping time: ${rtt} ms`);
      ping_map.delete(ping_id);
      pingInterval = setTimeout(ws_ping, ping_time);
    }break;
    case "CONNECTION":
    {

    }break;
    case "JOIN":
    {

    }break;
    case "GAME":
    {
      
    }break;
    default:
    {
      console.log("Unknown message type:", message.type);
    } break;
  }
}

let ping_count = 0;

function ws_ping()
{
  let ping_id = ping_count++;
  let performance_now = performance.now();
  ping_map.set(ping_id, performance_now);
  ws.send(JSON.stringify({ type: "PING", message: ping_id}));
}

ws_connect();

function ws_disconnect()
{
  if (ws)
  {
    ws.close();
    ws = null;
  }
}

export function ws_join(game_id: string)
{
  if (ws)
  {
    const message = {
      type: "JOIN",
      message: game_id
    };
    ws.send(JSON.stringify(message));
  }
}

export function get_ws(): WebSocket | null
{
  return ws;
}
