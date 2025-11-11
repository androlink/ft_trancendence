import { IPongDisplay, PongDisplay } from "./display.js";

let pong_display = new PongDisplay() as IPongDisplay


let draw = async () => {

	
	pong_display.update({
	ball: {x: 50, y: 25},
	player_1: 25,
	player_2: 25,
	score_1: 0,
	score_2: 0,
	})
	requestAnimationFrame(draw);
}

requestAnimationFrame(draw);