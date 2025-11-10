import { PongGameManager} from "./core.js"; 

import { PongGameManagerDTO } from "./dto.js";

var pong_game : PongGameManager | null = null;
var intervalId: number | null = null;

function startGame()
{
	if (!pong_game)
		return
	pong_game.startRound();
	intervalId = setInterval(() => {pong_game.loop()}, 1000 / 30);
}

function clearGame()
{
	if (intervalId)
		clearInterval(intervalId);
}

console.log(JSON.stringify({balls: [],seed: 0}));

document.getElementById("runConfig")?.addEventListener("click", async (ev) => {
	let textEditor = document.getElementById("pong_editor") as HTMLTextAreaElement;
	try {
		clearGame();
		let pongGameDTO = new PongGameManagerDTO(textEditor.value);
		pongGameDTO = new PongGameManagerDTO(pongGameDTO.toJSON());
		console.debug("DTO:", pongGameDTO.toJSON());
		pong_game = new PongGameManager(pongGameDTO);
		pong_game.startRound();
		pong_game.state = "run";
		intervalId = setInterval(() => {pong_game.loop()}, 1000 / 30);
		console.debug(pong_game);
	}catch(e)
	{
		console.error("cannot generate pong game:", e);
	}
})

document.getElementById("saveConfig")?.addEventListener("click", async (ev) => {
	let textEditor = document.getElementById("pong_editor") as HTMLTextAreaElement;
	let saveName = document.getElementById("configName") as HTMLInputElement;
	try {
		if (saveName.value.length == 0)
			throw 0;
		localStorage.setItem(saveName.value, textEditor.value);

		document.getElementById("configResult").textContent = "editor saved"
	}catch(e)
	{
		document.getElementById("configResult").textContent = "cannot save editor"
		console.error("cannot save editor");
	}
})

document.getElementById("loadConfig")?.addEventListener("click", async (ev) => {
	let textEditor = document.getElementById("pong_editor") as HTMLTextAreaElement;
	let saveName = document.getElementById("configName") as HTMLInputElement;
	try {
		if (saveName.value.length == 0)
			throw 0;
		textEditor.value = localStorage.getItem(saveName.value);

		document.getElementById("configResult").textContent = "editor loaded"
	}catch(e)
	{
		document.getElementById("configResult").textContent = "cannot load editor"
		console.error("cannot load editor");
	}
})

self["clearGame"] = clearGame
