import { WebSocket } from "ws";
import { WSmessage, TypeMessage } from "../common/types";

const request_url = "http://remote_microservice:3000/api/create";

export async function invite_message(event: WebSocket.MessageEvent) {
  const msg: WSmessage = JSON.parse(event.data.toString());

  if (msg.type !== TypeMessage.invite) return;

  const request = {
    method: "POST",
    body: JSON.stringify({
      player1: 0,
      player2: 0,
    }),
  };
  try {
    const response = await fetch(request_url, request);
    if (!response.ok) return;
    const result = response.json();
    //todo do something with result;
  } catch (e) {
    console.error("invite:", e);
  }
}
