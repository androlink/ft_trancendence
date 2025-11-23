import { BallEntity, keyControl, PlayerEntity, PlayerView, GameParty } from "./engine_interfaces.js";
import { paddle_width, paddle_height, paddle_speed } from "./engine_variables.js";

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
 * will reset the player to it's default place
 * @param player a player
 * @param options options to reset not entirely. Default will not reset the score
 */
export function resetPlayer(player: PlayerEntity, options?: { resetScore?: boolean }){
  player.view.TL.y = 50 - player.view.height / 2;
  if (options?.resetScore) player.view.score = 0
}

export function resetParty(game: GameParty) {
  game.players.forEach(p => resetPlayer(p, {resetScore: true}));
  resetBall(game.ball, 1, 0, game.players[0]);
  game.views.state = 'waiting';
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
export function generatePLayerEntity(TL: {x: number, y: number}, up: keyControl, down: keyControl, direction: PlayerView["direction"], bot: boolean, speedHere = paddle_speed): PlayerEntity{
  return {
    view: {score: 0, TL, width: paddle_width, height: paddle_height, direction},
    up,
    down,
    bot,
    speed: speedHere,
  }
}

export function generateParty(players: PlayerEntity[], ball: BallEntity, max_score = 10): GameParty
{
  let game_party: GameParty = {
    max_score: max_score,
    ball: ball,
    players: players,
    views: {
      ball: ball.view,
      players: players.map(p => p.view),
      state: "waiting"
    },
  }
  return game_party;
}
