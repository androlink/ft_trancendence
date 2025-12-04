import { GameParty, GameWebsocket } from "./engine/engine_interfaces";
import { generateParty, generatePLayerEntity } from "./engine/engine_inits";
import { Id, UserRow } from "../common/types";
import db from "../common/database";
import { WebSocket } from "ws";

let games: Map<string, GameParty> = new Map();

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
): GameParty {
  const players_name = players_id.map((id) => get_username(id));
  let game: GameParty = generateParty(players_name, players_id, 5);
  game.id = game_id;
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

export function pong_party_add_player(game_id: string, id: Id, ws: WebSocket) {
  let p = pong_party_get(game_id);
  if (!p) return;
  let player_index = p.players_id.findIndex((i) => i == id);
  if (player_index == -1) return;
  let player = p.players[player_index];
  player.ready = "HERE";
  player.ws = ws;
  (ws as GameWebsocket).oninput = (ev, message) => {
    console.log(message.input);
    if (message.input == "pressDown") player.down = true;
    if (message.input == "releaseDown") player.down = false;
    if (message.input == "pressUp") player.up = true;
    if (message.input == "releaseUp") player.up = false;
  };
  ws.onclose = (ev) => {
    player.ready = "GONE";
  };
  console.log(p);
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
