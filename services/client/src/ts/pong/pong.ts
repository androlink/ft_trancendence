import { IPongDisplay, PongDisplay } from "./display.js";
import { DataFrame } from "./engine/engine_interfaces.js";
import { game } from "./engine/engine_game.js";

export let display : PongDisplay;

let interval: ReturnType<typeof requestAnimationFrame>;
let update = () => {
	display.update(game.views);
	interval = requestAnimationFrame(update);
}

function updateLocalGame() {
	function remove() {
		self.removeEventListener("popstate", remove);
		if (interval)
			cancelAnimationFrame(interval);
	}
	self.addEventListener("popstate", remove );
	display = new PongDisplay();
	interval = requestAnimationFrame(update);
}
self["updateLocalGame"] = updateLocalGame;