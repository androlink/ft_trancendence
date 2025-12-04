import { IPongDisplay, PongDisplay } from "./display.js";
import { DataFrame } from "./engine/engine_interfaces.js";
import { game } from "./engine/engine_game.js";

export let display: PongDisplay;

let interval: ReturnType<typeof requestAnimationFrame>;
let update = () => {
  display.update(game.views);
  interval = requestAnimationFrame(update);
};

export function removeGameAnimation() {
  if (interval) {
    cancelAnimationFrame(interval);
    interval = 0;
  }
}

export function updateGameAnimation() {
  self.addEventListener("popstate", removeGameAnimation, { once: true });
  if (interval) return;
  display = new PongDisplay();
  interval = requestAnimationFrame(update);
}
self["updateGameAnimation"] = updateGameAnimation;
