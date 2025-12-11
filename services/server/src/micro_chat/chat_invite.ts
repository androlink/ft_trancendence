import { WebSocket } from "ws";
import {
  WSmessage,
  TypeMessage,
  UserRow,
  Id,
  InternalCreateResponse,
  InternalCreateRequestBody,
} from "../common/types";

import db from "../common/database";
import { fastify } from "./main";
import { send } from "process";
import { req, res } from "pino-std-serializers";

import { DirectMessage, connectedClients } from "./chat_route";

const request_url = "http://remote_microservice:3000/api/create";

function get_player(
  token: string,
  target: string
):
  | { status: true; player1: UserRow; player2: UserRow }
  | { status: false; reason: string } {
  try {
    const get_user_from_name = db.prepare<{ username: string }, UserRow>(
      "SELECT * FROM users WHERE lower(username) = lower(:username)"
    );
    const get_user_from_id = db.prepare<{ id: Id }, UserRow>(
      "SELECT * FROM users WHERE id = :id"
    );

    const get_is_user_blocked = db.prepare<
      { user1: Id; user2: Id },
      { blocker_id: Id; blocked_id: Id }
    >(
      "SELECT * FROM user_blocks WHERE blocker_id = :user2 AND blocked_id = :user1;"
    );
    const sender: { id: Id } | null = fastify.jwt.decode(token);
    if (sender === null) return { status: false, reason: "not connected" };
    const player1 = get_user_from_id.get({ id: sender.id });
    const player2 = get_user_from_name.get({ username: target! });
    if (player2 === undefined || player1 === undefined)
      return { status: false, reason: "can't find players" };
    const is_blocked = get_is_user_blocked.get({
      user1: player1.id,
      user2: player2.id,
    });
    if (is_blocked !== undefined)
      return { status: false, reason: "can't find players" };
    return { status: true, player1, player2 };
  } catch (e) {
    return { status: false, reason: "invalid token" };
  }
}

async function get_party(players: {
  player1: Id;
  player2: Id;
}): Promise<InternalCreateResponse | null> {
  try {
    const request = {
      method: "POST",
      body: JSON.stringify({
        player1: players.player1,
        player2: players.player2,
      } as InternalCreateRequestBody),
    };

    const response = await fetch(request_url, request);
    if (!response.ok) {
      throw new Error(`error on request: ${response.status}`);
    }
    const result = await response.json();

    return result;
  } catch (e) {
    return null;
  }
}

export async function invite_message(event: WebSocket.MessageEvent) {
  const msg: WSmessage = JSON.parse(event.data.toString());

  if (msg.type !== TypeMessage.invite) return;

  console.log(msg);

  const players = get_player(msg.user, msg.target!);
  if (players.status === false) {
    event.target.send(
      JSON.stringify({
        type: TypeMessage.replyInvite,
        status: false,
        reason: players.reason,
      } as WSmessage)
    );
    return;
  }

  let respond = await get_party({
    player1: players.player1.id,
    player2: players.player2.id,
  });

  if (respond === null) {
    event.target.send(
      JSON.stringify({
        type: TypeMessage.replyInvite,
        status: false,
        reason: "internal error",
      } as WSmessage)
    );
    return;
  }

  let reply: WSmessage;
  if (respond.status === true) {
    let reply: WSmessage = {
      type: TypeMessage.replyInvite,
      status: true,
      room_id: respond.room_id,
      sender: players.player1.username,
      target: players.player2.username,
    };
    event.target.send(JSON.stringify(reply));
    connectedClients.get(players.player2.id)?.send(JSON.stringify(reply));
  } else {
    let reply: WSmessage = {
      type: TypeMessage.replyInvite,
      status: false,
      reason: respond.reason,
    };
    event.target.send(JSON.stringify(reply));
  }
}
