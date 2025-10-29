export {CONTROL, KeyboardPlayer, IPongPlayer}


enum CONTROL {
	NONE,
	LEFT,
	RIGHT,
}

interface IPongPlayer
{
	getInput() : CONTROL;
}

class KeyboardPlayer implements IPongPlayer, EventListenerObject
{
	inputLeft: string;
	inputRight: string;

	inputLeftState: boolean = false;
	inputRightState: boolean = false;

	public constructor(inputLeft: string, inputRight: string)
	{
		document.addEventListener("keydown", this);
		document.addEventListener("keyup", this);
		this.inputLeft = inputLeft.toLowerCase();
		this.inputRight = inputRight.toLowerCase();
	}

	private keyboardUp(ev: KeyboardEvent)
	{
		if (ev.key.toLowerCase() === this.inputLeft)
			this.inputLeftState = false;
		if (ev.key.toLowerCase() === this.inputRight)
			this.inputRightState = false;
	}

	private keyboardDown(ev: KeyboardEvent)
	{
		if (ev.key.toLowerCase() === this.inputLeft)
			this.inputLeftState = true;
		if (ev.key.toLowerCase() === this.inputRight)
			this.inputRightState = true;
	}

	public handleEvent(ev: KeyboardEvent)
	{
		//console.debug(ev);
		switch (ev.type)
		{
			case "keyup":
				this.keyboardUp(ev);
				break ;
			case "keydown":
				this.keyboardDown(ev);
				break ;
		}
		//console.debug(this);
	}

	public getInput(): CONTROL
	{
		if (this.inputLeftState == true && this.inputRightState == false)
			return CONTROL.LEFT;
		if (this.inputLeftState == false && this.inputRightState == true)
			return CONTROL.RIGHT;
		return CONTROL.NONE;
	}

	public destructor()
	{
		document.removeEventListener("keydown", this);
		document.removeEventListener("keyup", this);
	}
}