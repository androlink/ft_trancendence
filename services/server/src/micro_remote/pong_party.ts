import { GameWebSocket, MessageType } from "./local_type";
import { Id, UserRow } from "../common/types";
import db from "../common/database";
import { WebSocket } from "ws";
import { PlayerEntity } from "./engine/engine_interfaces";
import { PongEngine } from "./engine/Engine";

let games: Map<string, PongEngine> = new Map();

let test = new PongEngine(["test", "test2"], [1, 2]);

let get_username: (id: Id) => string;
{
  const statement = db.prepare<{ id: Id }, string>(
    "SELECT username FROM  users WHERE id = :id"
  );

  get_username = (id) => {
    const username = statement.get({ id: id });
    if (!username) return "player";
    return username;
  };
}

export function pong_party_create(
  game_id: string,
  players_id: Id[]
): PongEngine {
  const players_name = players_id.map((id) => get_username(id));
  let game = new PongEngine(players_name, players_id, 5);
  game.setId(game_id);
  games.set(game_id, game);
  console.log(game);
  return game;
}

export function pong_party_delete(game_id: string): void {
  let p = pong_party_get(game_id);
  if (!p) return;
  games.delete(game_id);
  p.players.forEach((player) => player.ws?.close());
}

function set_player_event(ws: WebSocket, player: PlayerEntity) {
  ws.addEventListener("message", (event) => {
    const messageObject = JSON.parse(event.data.toString()) as MessageType;
    if (messageObject.type !== "input") return;

    if (messageObject.payload == "pressDown") player.down = true;
    if (messageObject.payload == "releaseDown") player.down = false;
    if (messageObject.payload == "pressUp") player.up = true;
    if (messageObject.payload == "releaseUp") player.up = false;
  });

  ws.addEventListener("close", () => {
    player.ready = "GONE";
  });
}

export function pong_party_add_player(
  game_id: string,
  id: Id,
  ws: GameWebSocket
): boolean {
  let party = pong_party_get(game_id);
  if (!party) return false;
  let player_index = party.players_id.findIndex((i) => i == id);
  if (player_index == -1) return false; //if not found in game
  if (party.players[player_index].ready === "HERE") return false; //if already here

  let player = party.players[player_index];

  player.ready = "HERE";
  player.ws = ws;

  set_player_event(ws, player);

  return true;
}

export function pong_party_get(game_id: string): GameParty | null {
  if (pong_party_exists(game_id)) {
    return games.get(game_id) as GameParty;
  }
  return null;
}

export function pong_party_exists(game_id: string): boolean {
  return games.has(game_id);
}
