import { BallEntity, keyControl, PlayerEntity } from "./engine_interfaces.js";
import { generatePLayerEntity, resetBall } from "./engine_inits.js";
import { get_key_config } from "../local_settings.js"

/**
 * the for now default width of the players' bars
 */
export const paddle_width = 2;
/**
 * the for now default height of the players' bars
 */
export const paddle_height = 15;

export const paddle_speed = 3;
export const delay = 1000/30;


export const ball_size = 2;

/**
 * an array of players, 
 * can theorically take as many as wanted, 
 * but needs more testing
 */
export const players =
[
  generatePLayerEntity(
    {x: 5, y: 50 - paddle_height / 2},
    ...get_key_config("player_one"),
    'E', 0,
  ),
  generatePLayerEntity(
    {x: 100 - 5 - paddle_width, y: 50 - paddle_height / 2},
    {}, {},
    'W', 10,
  ),
] as PlayerEntity[];

/**
 * the ball from the game, only one except if we change the functions
 */
export const ball = {
  view: {x: 50 - ball_size / 2, y: 50 - ball_size / 2, size: ball_size },
  speed: {x: 1, y: 0},
  last: players[0],
} as BallEntity;
