
import { generateParty, resetBall, resetParty, resetPlayer } from './engine_inits.js';
import { GameParty, PlayerEntity } from './engine_interfaces.js';
import { tick } from './engine_tick.js';
import { ball, ball_size, delay, players } from './engine_variables.js';

function eventKeyInputPong(event: KeyboardEvent)
{
  if (event.key === " " && event.type === "keydown" && !event.repeat)
  {
    game.views.state === 'playing' ? pauseLocalPong() : resumeLocalPong();
  }

  game.players.forEach(player => {
    if (player.up.key === undefined || player.down.key === undefined)
      return ;
    for (let control of [player.up, player.down]) {
      if (
        control.code !== undefined ?
          control.code === event.code :
          control.key.toLowerCase() === event.key.toLowerCase()
        )
      {
        control.pressed = event.type === "keydown";
      }
    }
  });
}

let last_ball: {x: number, y: number} = {...ball.view};
function botKeyPressingPong(){
  if (last_ball.x === ball.view.x) {
    return;
  }
  const dx = ball.view.x - last_ball.x;
  const dy = ball.view.y - last_ball.y;
  for (const player of players) {
    if (player.up.key !== undefined && player.up.key !== undefined)
      continue;
    if ((dx > 0 && ball.view.x >= player.view.TL.x + player.view.width)
      || (dx < 0 && ball.view.x <= player.view.TL.x)) {
      player.down.pressed = (player.view.TL.y < 50);
      player.up.pressed = (player.view.TL.y + player.view.height > 50);
      continue;
    }
    if ((player.view.direction === "E" && (player.bot_difficulty + 1) ** 3 * 0.8 < ball.view.x - (player.view.TL.x + player.view.width)) ||
        (player.view.direction === "W" && (player.bot_difficulty + 1) ** 3 * 0.8 < player.view.TL.x - ball.view.x)
    ) {
      player.down.pressed = false;
      player.up.pressed = false;
      continue;
    }
    let estmated_nb_call = (player.view.TL.x - ball.view.x) / dx;
    let estimated_collision = ((ball.view.y + ball_size / 2 + estmated_nb_call * dy) % 200 + 200) % 200;
    if (estimated_collision > 100) 
      estimated_collision = 200 - estimated_collision;
    if (estimated_collision === player.view.TL.y + player.view.height / 2 ||
      estimated_collision < player.view.TL.y){
      player.up.pressed = true;
      player.down.pressed = false;
    }
    else if (estimated_collision > player.view.TL.y + player.view.height){
      player.up.pressed = false;
      player.down.pressed = true;
    }
    else {
      player.down.pressed = false;
      player.up.pressed = false;
    }
  }
  last_ball = {...ball.view};
}

export let game: GameParty | undefined = undefined;
/**
 * will set the events to play the local game, and launch the game
 */
export function createLocalPong(): void {
  if (game?.intervalId !== undefined)
    return;
  game = generateParty(players, ball, 5);
  document.addEventListener("keydown", eventKeyInputPong);
  document.addEventListener("keyup", eventKeyInputPong);
  self.addEventListener("popstate", deleteLocalPong, {once: true});
  document.addEventListener("visibilitychange", toggleLocalPongOnHidden);
  document.getElementById("canvas")?.addEventListener("click", startLocalPong);
  game.intervalId = setInterval(tick, delay, game);
  game.botIntervalId = setInterval(botKeyPressingPong, delay);
}
self["createLocalPong"] = createLocalPong;

function startLocalPong(): void {
  if (game.views.state === 'waiting')
    game.views.state = 'playing';
  else if (game.views.state === 'ended')
  {
    resetParty(game);
    game.intervalId = setInterval(tick, delay, game);
    game.botIntervalId = setInterval(botKeyPressingPong, delay);
  }
}

/**
 * will stop the tick function from be called 
 */
function pauseLocalPong() {
  if (game.views.state !== 'playing')
    return
  if (!game.intervalId)
    return
  clearInterval(game.intervalId);
  game.intervalId = undefined;
  game.views.state = 'paused';
  clearInterval(game.botIntervalId);
  game.botIntervalId = undefined;
}

/**
 * will provoque the tick function from be called 
 */
function resumeLocalPong() {
  if (game.views.state !== 'paused')
    return
  if (game.intervalId !== undefined)
    return;
  game.intervalId = setInterval(tick, delay, game);
  game.views.state = 'playing';
  game.botIntervalId = setInterval(botKeyPressingPong, delay);
}

/**
 * will toggle the calling of the tick function based on document visibility
 */
function toggleLocalPongOnHidden() {
  document.hidden ? pauseLocalPong() : resumeLocalPong();
}

/**
 * will remove the events of the local game,
 * stop the game
 * and reset the variables
 */
function deleteLocalPong(): void {
  document.removeEventListener("keydown", eventKeyInputPong);
  document.removeEventListener("keyup", eventKeyInputPong);
  document.removeEventListener("visibilitychange", toggleLocalPongOnHidden);
  if (game.intervalId)
    clearInterval(game.intervalId);
  game.intervalId = undefined;
  clearInterval(game.botIntervalId);
  game.botIntervalId = undefined;
  resetParty(game);
}
