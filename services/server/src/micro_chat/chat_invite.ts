import { WebSocket } from "ws";
import { WSmessage, TypeMessage, UserRow, Id } from "../common/types";

import db from "../common/database";
import { fastify } from "./main";
import { send } from "process";
import { req } from "pino-std-serializers";

import { DirectMessage, connectedClients } from "./chat_route";

const request_url = "http://remote_microservice:3000/api/create";

export async function invite_message(event: WebSocket.MessageEvent) {
  const msg: WSmessage = JSON.parse(event.data.toString());

  if (msg.type !== TypeMessage.invite) return;

  console.log(msg);
  try {
    const get_id_from_name = db?.prepare<{ username: string }, UserRow>(
      "SELECT * FROM users WHERE username = :username"
    );
    const sender: { id: Id } | null = fastify.jwt.decode(msg.user);
    if (sender === null) throw new Error("invalid token");
    const player1 = sender.id;
    const player2 = get_id_from_name.get({ username: msg.target! });
    if (player2 === undefined)
      throw new Error(`cannot found player: ${msg.target}`);

    const request = {
      method: "POST",
      body: JSON.stringify({
        player1: player1,
        player2: player2.id,
      }),
    };
    console.log(request.body);
    const response = await fetch(request_url, request);
    if (!response.ok) {
      throw new Error(`error on request: ${response.status}`);
    }
    const result = await response.json();
    console.log(result.game_id);

    let respond: WSmessage = {
      type: TypeMessage.directMessage,
      content: result.game_id,
      msgId: "0",
      user: "someone",
      target: msg.target,
    };

    connectedClients.get(player1)?.send(JSON.stringify(respond));
    connectedClients
      .get(player2.id)
      ?.send(JSON.stringify({ ...respond, target: msg.user }));
    DirectMessage(respond);
    DirectMessage({ ...respond, target: msg.user });
  } catch (e) {
    event.target.send(JSON.stringify({ msg: "cant generate party" }));
    console.error("invite:", e);
  }
}
