export {KeyboardInput}

class KeyboardInput implements EventListenerObject
{
	private input: Set<string> = new Set()

	private constructor()
	{
		document.addEventListener("keydown", this);
		document.addEventListener("keyup", this);
	}

	private keyboardUp(ev: KeyboardEvent)
	{
		this.input.delete(ev.key.toLowerCase());
	}

	private keyboardDown(ev: KeyboardEvent)
	{
		this.input.add(ev.key.toLowerCase());
	}

	public keyIsDown(key: string): boolean
	{
		return this.input.has(key);
	}

	public keyIsUp(key: string): boolean
	{
		return !this.keyIsDown(key);
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


	static input = new KeyboardInput();
}

self["Keyboard"] = KeyboardInput;