import { BallEntity, PlayerEntity } from "./engine_interfaces.js";
import { resetBall } from "./engine_inits.js";
import { containsBetween } from "./engine_utils.js";
import GameView from "./engine_variables.js"

/**
 * will do a single iteration of the game, this function should be called many times by second
 * @param ball the ball of the game
 * @param players the players of the game
 */
export function tick(ball: BallEntity, players: PlayerEntity[])
{
  moveBall(ball);
  movePlayers(players, ball.view.radius * 2);
  collideWithPlayers(ball, players); 
  // gonna need to either : 
  //    cap the speed.x of the ball at the witdh of the paddle
  //    set a collision detection based on the movement of the ball and not its finishing point
  // also, need to add a detection of the colision based on the radius of the ball, 
  // unlike now where it's based on it's single coordinate  
  checkPoints(ball, players);
  console.log(GameView.ball, GameView.players[0], GameView.players[0].TL, GameView.players[1], GameView.players[1].TL)
}

/**
 * will move a ball according to it's speed and between top and lower walls
 * @param ball the said ball
 */
function moveBall(ball: BallEntity): void {
  ball.view.x += ball.speed.x;
  ball.view.y += ball.speed.y;
  if (ball.view.y >= 100 || ball.view.y <= 0) {
    ball.speed.y *= -1;
    ball.view.y = (ball.view.y >= 100 ? 200 - ball.view.y : - ball.view.y);
  }
}

/**
 * will move the player accordinly to the player.(down | up).move on their y axis
 * @param players array of all the players that wanna move
 * @param gap the gab between the top and lower wall, traditionally size of the ball
 */
function movePlayers(players : PlayerEntity[], gap: number): void {
  players.forEach( player => {
    player.view.TL.y = containsBetween(
      player.view.TL.y +
        (player.down.pressed ? player.speed : 0) -
        (player.up.pressed ? player.speed : 0),
      gap,
      100 - gap - player.view.height
    );
  })
}

/**
 * Will collide the ball to all the payers' pads
 * @param ball the ball mentionned
 * @param players array of players
 */
function collideWithPlayers(ball: BallEntity, players: PlayerEntity[]): void {
  function move(player: PlayerEntity){
    if (
      ball.view.x >= player.view.TL.x &&
      ball.view.x <= player.view.TL.x + player.view.width &&
      ball.view.y >= player.view.TL.y &&
      ball.view.y <= player.view.TL.y + player.view.height
    ) {
      ball.last = player;
      ball.speed.x =
        (player.view.direction === "E" ? 1 : -1)
        * Math.abs(ball.speed.x * 1.03);
      const angle = ((ball.view.y - player.view.TL.y) / player.view.height - 0.5) * Math.PI * 5 / 6;
      ball.speed.y = Math.tan(angle) * ball.speed.x;
    }
  };
  players.forEach(move);
}

/**
 * check if the ball touches one of the side walls
 * @param ball the ball in the game
 */
function checkPoints(ball: BallEntity, players: PlayerEntity[]): void {
  if (ball.view.x < 100 && ball.view.x > 0)
    return;

  ball.last.view.score += 1;
  resetBall(ball, ball.last.view.direction === 'E' ? 1 : -1, 0, ball.last);
}
