import { BallEntity, PlayerEntity, PlayerView, GameParty } from "./engine_interfaces.js";
import { paddle_width, paddle_height, paddle_speed, ball_size, delay } from "./engine_variables.js";
import {tick} from "./engine_tick.js"
import { Id } from "../../types.js";

/**
 * will reset the ball to it's default place
 * @param ball the ball to be reset
 * @param speedX the offset of each ticks for the X coordinate
 * @param speedY the offset of each ticks for the Y coordinate
 * @param last the player that will win the point if nobody touches it 
 */
export function resetBall(ball: BallEntity, speedX: number, speedY: number, last: PlayerEntity) {
  ball.speed.x = speedX;
  ball.speed.y = speedY;
  ball.view.x = 50 - ball.view.size / 2;
  ball.view.y = 50 - ball.view.size / 2;
  ball.last = last;
}

/**
 * a constructor for the interface PlayerEntity
 * @param TL the coordonnates of the top left corner
 * @param up the key config to raise the bar
 * @param down the key config to lower the bar 
 * @param direction W or E to tell where the ball gonna be sent back
 * @param speed the speed of the bar. Set all bars at the same speed for mandatory requirements
 * @returns the new PlayerEntity
 */
export function generatePLayerEntity(name: string | [string, ...string[]], TL: {x: number, y: number}, direction: PlayerView["direction"], speedHere = paddle_speed): PlayerEntity{
  return {
    view: {name, score: 0, TL, width: paddle_width, height: paddle_height, direction},
    speed: speedHere,
    up: false,
    down: false,
    ready: "WAIT",
  }
}

export function generateParty(players_name: string[], players_id: Id[], max_score = 10): GameParty
{
  let ball: BallEntity = {
    view: {x: 50 - ball_size / 2, y: 50 - ball_size / 2, size: ball_size },
    speed: {x: 1, y: 0},
    last: undefined,
  }

let players = [
  generatePLayerEntity(
    [players_name[0]],
    {x: 5, y: 50 - paddle_height / 2},
    'E', 2,
  ),
  generatePLayerEntity(
    [players_name[1]],
    {x: 100 - 5 - paddle_width, y: 50 - paddle_height / 2},
    'W', 2,
  )]

  let game_party: GameParty = {
    id: "",
    max_score: max_score,
    ball: ball,
    players_id: players_id,
    players: players,
    views: {
      ball: ball.view,
      players: players.map(p => p.view),
      state: "waiting"
    },
  }
  game_party.intervalId = setInterval(tick, delay, game_party);


  return game_party;
}
