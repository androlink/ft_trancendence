import { GameWebSocket, MessageType } from "./local_type";
import { Id, UserRow } from "../common/types";
import db from "../common/database";
import { WebSocket } from "ws";
import { PlayerEntity } from "./engine/engine_interfaces";
import { PongEngine } from "./engine/Engine";
import { randomUUID } from "crypto";
import { info } from "console";

let games: Map<string, PongEngine> = new Map();

let get_username: (id: Id) => string | undefined;
{
  const statement = db.prepare<{ id: Id }, { username: string }>(
    "SELECT username FROM users WHERE id = :id"
  );

  get_username = (id) => {
    const username = statement.get({ id: id })?.username;
    return username;
  };
}

function pong_party_log() {
  let infos: string[] = [];
  infos.push("============= game log =============");
  infos.push(`game found: ${games.size}`);
  for (let game of games) {
    const players = game[1].getPlayers();
    infos.push(
      `  {${game[1].getId()}}: [${players[0].view.name}(${
        players[0].view.score
      }), ${players[1].view.name}(${players[1].view.score})]`
    );
  }
  console.info(infos.join("\n"));
}

setInterval(pong_party_log, 30000);

export function pong_party_create(
  players_id: Id[]
): { status: false; reason: string } | { status: true; room_id: string } {
  console.log("players_id", players_id);
  const players_name = players_id.map((id) => get_username(id));
  console.log("players_name", players_name);
  if (!players_name.every((pn) => pn !== undefined))
    return { status: false, reason: "one of player is not found" };
  let game_id = randomUUID();
  while (games.has(game_id) === true) game_id = randomUUID();
  let game = new PongEngine(players_name as string[], players_id, 5);
  game.setId(game_id);
  games.set(game_id, game);
  console.log(game);
  game.addEventListener("abort", () => {
    pong_party_abort(game_id);
  });
  game.addEventListener("finish", () => {
    pong_party_finish(game_id);
  });
  return { status: true, room_id: game.getId() };
}

function pong_party_finish(game_id: string) {
  console.info(`game ${game_id} has been finished`);
  //log to db
  pong_party_delete(game_id);
}

function pong_party_abort(game_id: string) {
  console.info(`game ${game_id} has been aborted`);
  pong_party_delete(game_id);
}

export function pong_party_delete(game_id: string): void {
  let p = pong_party_get(game_id);
  if (!p) return;
  games.delete(game_id);
  console.info(`game ${game_id} has been removed`);
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
