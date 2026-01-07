// import { BallEntity, PlayerEntity, point } from "./engine_interfaces";
// import { resetBall } from "./engine_inits";
// import { containsBetween } from "./engine_utils";
// import { pong_party_delete } from "../pong_party";
// import { GameParty } from "../local_type";

// /**
//  * will do a single iteration of the game, this function should be called many times by second
//  * @param ball the ball of the game
//  * @param players the players of the game
//  */
// export function tick(game: GameParty) {
//   if (game.views.state !== "playing") {
//     let r = true;
//     for (let p of game.players) if (p.ready === "WAIT") r = false;
//     if (r == false) return;
//     game.views.state = "playing";
//   }

//   let { ball, players } = game;

//   movePlayers(players, ball.view.size);
//   moveBall(ball);
//   collideWithPlayers(ball, players);

//   // gonna need to either :
//   //    cap the speed.x of the ball at the witdh of the paddle
//   //    set a collision detection based on the movement of the ball and not its finishing point
//   // also, need to add a detection of the colision based on the radius of the ball,
//   // unlike now where it's based on it's single coordinate
//   if (checkPoints(ball, players))
//     if (Math.max(...players.map((p) => p.view.score)) >= game.max_score) {
//       clearInterval(game.intervalId);
//       game.intervalId = undefined;
//       game.views.state = "ended";
//     }
//   let r = true;
//   for (let p of game.players) if (p.ready == "GONE") r = false;
//   if (r == false) {
//     clearInterval(game.intervalId);
//     game.intervalId = undefined;
//     game.views.state = "ended";
//   }
//   game.players.forEach((p) => {
//     if (p.ready != "GONE")
//       p.ws?.send(JSON.stringify({ type: "GAME", message: game.views }));
//   });
//   if (game.views.state === "ended") pong_party_delete(game.id);
// }

// /**
//  * will move a ball according to it's speed and between top and lower walls
//  * @param ball the said ball
//  */
// function moveBall(ball: BallEntity): void {
//   ball.view.x += ball.speed.x;
//   ball.view.y += ball.speed.y;
//   if (ball.view.y + ball.view.size > 100 || ball.view.y <= 0) {
//     ball.speed.y *= -1;
//     ball.view.y =
//       ball.view.y + ball.view.size >= 100
//         ? 200 - (ball.view.y + ball.view.size * 2)
//         : -ball.view.y;
//   }
// }

// /**
//  * will move the player accordinly to the player.(down | up).move on their y axis
//  * @param players array of all the players that wanna move
//  * @param gap the gab between the top and lower wall, traditionally size of the ball
//  */
// function movePlayers(players: PlayerEntity[], gap: number): void {
//   players.forEach((player) => {
//     player.view.TL.y = containsBetween(
//       player.view.TL.y +
//         (player.down ? player.speed : 0) -
//         (player.up ? player.speed : 0),
//       gap,
//       100 - gap - player.view.height
//     );
//   });
// }

// /**
//  * Will collide the ball to all the payers' pads
//  * @param ball the ball mentionned
//  * @param players array of players
//  */
// function collideWithPlayers(ball: BallEntity, players: PlayerEntity[]): void {
//   function overlap(p1: point, s1: point, p2: point, s2: point): boolean {
//     if (p1.x > p2.x + s2.x || p2.x > p1.x + s1.x) return false;
//     if (p1.y > p2.y + s2.y || p2.y > p1.y + s1.y) return false;
//     return true;
//   }

//   function move(player: PlayerEntity) {
//     if (
//       overlap(
//         ball.view,
//         { x: ball.view.size, y: ball.view.size },
//         player.view.TL,
//         { x: player.view.width, y: player.view.height }
//       )
//     ) {
//       ball.last = player;
//       let nspeed = Math.abs(ball.speed.x) + 0.1;
//       const angle =
//         (((ball.view.y - player.view.TL.y + ball.view.size) /
//           (player.view.height + ball.view.size) -
//           0.5) *
//           Math.PI *
//           3) /
//         6;
//       if (nspeed > ball.view.size + player.view.width)
//         nspeed = ball.view.size + player.view.width;
//       if (player.view.direction === "E") {
//         ball.speed.x = nspeed;
//         // ball.view.x = player.view.TL.x + player.view.width;
//         ball.speed.y = Math.tan(angle) * ball.speed.x;
//       } else if (player.view.direction === "W") {
//         ball.speed.x = -nspeed;
//         // ball.view.x = player.view.TL.x - ball.view.size;
//         ball.speed.y = Math.tan(-angle) * ball.speed.x;
//       }
//       if (Math.abs(ball.speed.y) < 0.001) {
//         ball.speed.y = Math.random() * 0.01 - 0.005;
//       }
//     }
//   }
//   players.forEach(move);
// }

// /**
//  * check if the ball touches one of the side walls
//  * @param ball the ball in the game
//  */
// function checkPoints(ball: BallEntity, players: PlayerEntity[]): boolean {
//   if (ball.view.x + ball.view.size < 100 && ball.view.x > 0) return false;

//   if (ball.last !== undefined) {
//     ball.last.view.score += 1;
//     resetBall(ball, ball.last.view.direction === "E" ? 1 : -1, 0, ball.last);
//   } else {
//     resetBall(ball, 1, 0, players[0]);
//   }
//   return true;
// }
