import { BallEntity } from "./engine_interfaces.js";
import { generatePLayerEntity } from "./engine_inits.js";

/**
 * the for now default width of the players' bars
 */
export const width = 2;
/**
 * the for now default height of the players' bars
 */
export const height = 20;

export const delay = 1000/20;
export const speed = 3;

/**
 * an array of players, 
 * can theorically take as many as wanted, 
 * but needs more testing
 */
export const players =
[
  generatePLayerEntity(
    {x: 5, y: 50 - height / 2},
    {key: 's', pressed: false},
    {key: 'z', pressed: false},
    'E'
  ),
  generatePLayerEntity(
    {x: 100 - 5 - width, y: 50 - height / 2},
    {key: 'o', pressed: false},
    {key: 'l', pressed: false},
    'W'
  ),
]

/**
 * the ball from the game, only one except if we change the functions
 */
export const ball = {
  view: {x: 50, y: 50, radius: 1.5 },
  speed: {x: 1, y: 0},
  last: players[0],
} as BallEntity;

/**
 * the elements required to display the game
 */
export default {
  ball : ball.view,
  players: [
    players[0].view,
    players[1].view,
  ]
};