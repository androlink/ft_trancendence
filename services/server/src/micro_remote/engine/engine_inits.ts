import { BallEntity, PlayerEntity, PlayerView } from "./engine_interfaces.js";
import {
  paddle_width,
  paddle_height,
  paddle_speed,
  ball_size,
  delay,
} from "./engine_variables.js";
// import { tick } from "./engine_tick.js";

/**
 * will reset the ball to it's default place
 * @param ball the ball to be reset
 * @param speedX the offset of each ticks for the X coordinate
 * @param speedY the offset of each ticks for the Y coordinate
 * @param last the player that will win the point if nobody touches it
 */
export function resetBall(
  ball: BallEntity,
  speedX: number,
  speedY: number,
  last: PlayerEntity
) {
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
export function generatePLayerEntity(
  name: string | [string, ...string[]],
  TL: { x: number; y: number },
  direction: PlayerView["direction"],
  speedHere = paddle_speed
): PlayerEntity {
  return {
    view: {
      name,
      score: 0,
      TL,
      width: paddle_width,
      height: paddle_height,
      direction,
    },
    speed: speedHere,
    up: false,
    down: false,
    ready: "WAIT",
  };
}
