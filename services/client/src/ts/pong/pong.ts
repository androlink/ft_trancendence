import { IPongDisplay, PongDisplay } from "./display.js";
import game_view from './engine/engine_variables.js'

export let display : PongDisplay;

let interval: ReturnType<typeof requestAnimationFrame>;
let update = () => {
	display.update({player_1: game_view.players[0], player_2: game_view.players[1], ball: game_view.ball});
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