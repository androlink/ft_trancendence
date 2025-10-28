import { PongGameManager } from "./core.js"; 

var pong_game : PongGameManager | null = null;

function newGame() : void
{
	if (pong_game)
		pong_game.stop();
	pong_game = new PongGameManager();
	pong_game.generate();
	pong_game.start();
	console.debug(pong_game);
}

self["newGame"] = newGame
