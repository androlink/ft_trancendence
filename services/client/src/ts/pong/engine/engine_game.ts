
import { resetBall, resetPlayer } from './engine_inits.js';
import { tick } from './engine_tick.js';
import { ball, players } from './engine_variables.js';

function eventKeyInputPong(event: KeyboardEvent)
{
  players.forEach(player => {
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

let game: ReturnType<typeof setInterval>;
/**
 * will set the events to play the local game, and launch the game
 */
function createLocalPong(): void {
  if (game !== undefined)
    return;
  document.addEventListener("keydown", eventKeyInputPong);
  document.addEventListener("keyup", eventKeyInputPong);
  self.addEventListener('popstate', deleteLocalPong);
  document.addEventListener("visibilitychange", toggleLocalPongOnHidden);
  game = setInterval(tick, 200, ball, players)
}
self["createLocalPong"] = createLocalPong;

/**
 * will stop the tick function from be called 
 */
function pauseLocalPong() {
  if (!game)
    return
  clearInterval(game);
  game = undefined;
}

/**
 * will provoque the tick function from be called 
 */
function resumeLocalPong() {
    if (game !== undefined)
      return;
    game = setInterval(tick, 200, ball, players);
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
  clearInterval(game);
  game = undefined;
  resetPlayer(players[0], {resetScore: true});
  resetPlayer(players[1], {resetScore: true});
  resetBall(ball, 1, 1, players[0]);
}
