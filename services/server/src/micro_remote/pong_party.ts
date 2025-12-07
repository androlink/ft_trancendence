import { GameWebSocket, MessageType } from "./local_type";
import { Id, UserRow } from "../common/types";
import db from "../common/database";
import { WebSocket } from "ws";
import { PlayerEntity } from "./engine/engine_interfaces";
import { PongEngine } from "./engine/Engine";
import { randomUUID } from "crypto";

let games: Map<string, PongEngine> = new Map();

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

export function pong_party_create(players_id: Id[]): PongEngine {
  const players_name = players_id.map((id) => get_username(id));
  let game_id = randomUUID();
  while (games.has(game_id) === true) game_id = randomUUID();
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
}

export function pong_party_add_player(
  game_id: string,
  id: Id,
  ws: GameWebSocket
): boolean {
  let party = pong_party_get(game_id);
  if (!party) return false;
  return party.setPlayer(id, ws);
}

export function pong_party_get(game_id: string): PongEngine | null {
  if (pong_party_exists(game_id)) {
    return games.get(game_id) as PongEngine;
  }
  return null;
}

export function pong_party_exists(game_id: string): boolean {
  return games.has(game_id);
}
