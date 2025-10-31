export {CONTROL, KeyboardPlayer, IPongPlayer, RandomPlayer}

import { KeyboardInput } from "./keyboard.js";
import { Random } from "./random.js";

enum CONTROL {
	NONE,
	LEFT,
	RIGHT,
}

interface IPongPlayer
{
	getInput() : CONTROL;
}

class KeyboardPlayer implements IPongPlayer
{
	inputLeft: string;
	inputRight: string;

	public constructor(inputLeft: string, inputRight: string)
	{
		this.inputLeft = inputLeft.toLowerCase();
		this.inputRight = inputRight.toLowerCase();
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

	public constructor(random: Random)
	{
		this.random = random;
	}

	public getInput(): CONTROL
	{
		return this.random.next() * 10 > 5 ? CONTROL.LEFT : CONTROL.RIGHT
	}

}