import { PongGameManager } from "./core.js"; 

var pong_game : PongGameManager | null = null;
var intervalId: ReturnType<typeof setInterval> | null = null;
function newGame() : void
{
	clearGame();
	pong_game = new PongGameManager();
	pong_game.generate();
	pong_game.unpause();
	pong_game.startRound();
	intervalId = setInterval(() => {pong_game.loop()}, 1000 / 30);
}

function clearGame()
{
	if (intervalId)
		clearInterval(intervalId);
}

self["newGame"] = newGame
self["clearGame"] = clearGame
