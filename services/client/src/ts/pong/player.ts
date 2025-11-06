export {CONTROL, KeyboardPlayer, IPongPlayer, RandomPlayer}

import { KeyboardInput } from "./keyboard.js";
import { Random } from "./random.js";

enum CONTROL {
	NONE,
	LEFT,
	RIGHT,
}

type playerType = "random" | "keyboard"

export function playerFactory(type: playerType, option: any):IPongPlayer
{
	console.debug("new player: ", type, "from", option)
	switch (type)
	{
		case "keyboard":
			return (new KeyboardPlayer(option));
		case "random":
			return (new RandomPlayer(option));
	}
	return undefined;
}

interface IPongPlayer
{
	getInput() : CONTROL;
}

class KeyboardPlayer implements IPongPlayer
{
	inputLeft: string;
	inputRight: string;

	public constructor({left, right})
	{
		this.inputLeft = left.toLowerCase();
		this.inputRight = right.toLowerCase();
	}

	public getInput(): CONTROL
	{
		if (KeyboardInput.input.keyIsDown(this.inputLeft)
			&& KeyboardInput.input.keyIsUp(this.inputRight))
			return CONTROL.LEFT;
		if (KeyboardInput.input.keyIsDown(this.inputRight)
			&& KeyboardInput.input.keyIsUp(this.inputLeft))
			return CONTROL.RIGHT;
		return CONTROL.NONE;
	}
}


class RandomPlayer implements IPongPlayer
{
	random: Random;

	public constructor(seed: number)
	{

		this.random = new Random(seed);
	}

	public getInput(): CONTROL
	{
		return this.random.next() * 10 > 5 ? CONTROL.LEFT : CONTROL.RIGHT
	}

}