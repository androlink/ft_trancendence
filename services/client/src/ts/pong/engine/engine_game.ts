
import { generateParty, resetBall, resetParty, resetPlayer } from './engine_inits.js';
import { GameParty } from './engine_interfaces.js';
import { tick } from './engine_tick.js';
import { ball, delay, players } from './engine_variables.js';

function eventKeyInputPong(event: KeyboardEvent)
{
  if (event.key === " " && event.type === "keydown" && !event.repeat)
  {
    game.views.state === 'playing' ? pauseLocalPong() : resumeLocalPong();
  }

  game.players.forEach(player => {
    for (let control of [player.up, player.down]) {
      if (
        control.code !== undefined ?
          control.code === event.code :
          control.key.toLowerCase() === event.key.toLowerCase()
        )
      {
        control.pressed = event.type === 'keydown';
      }
    }
  });
}

export let game: GameParty | undefined = undefined;
/**
 * will set the events to play the local game, and launch the game
 */
function createLocalPong(): void {
  if (game?.intervalId !== undefined)
    return;
  document.addEventListener("keydown", eventKeyInputPong);
  document.addEventListener("keyup", eventKeyInputPong);
  self.addEventListener('popstate', deleteLocalPong);
  document.addEventListener("visibilitychange", toggleLocalPongOnHidden);
  document.getElementById("canvas").addEventListener("click", startLocalPong, { once: true });
  game = generateParty(players, ball, 5);
  game.intervalId = setInterval(tick, delay, game)
}
self["createLocalPong"] = createLocalPong;

function startLocalPong(): void {
  game.views.state = 'playing';
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
  self.removeEventListener('popstate', deleteLocalPong);
  document.removeEventListener("visibilitychange", toggleLocalPongOnHidden);
  if (game.intervalId)
    clearInterval(game.intervalId);
  game.intervalId = undefined;
  resetParty(game);
}
