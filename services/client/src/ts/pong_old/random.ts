
export {Random}

/**
 * @description Random seeded generator
 */
class Random
{
	private _seed: number;
	private _last: number;

	constructor(seed: number)
	{
		this._seed = seed;
		this._last = 0;
	}

	/**
	 * @description the next generated random
	 * @returns a number [0-1[
	 */
	public next(): number
	{
		this._last = Random.generate(this._seed, this._last);
		return this._last / 4294967296;
	}

	/**
	 * @description the last generated random
	 * @returns a number [0-1[
	 */
	public last(): number
	{
		return this._last / 4294967296;
	}

	/**
	 * @param nums: an integer array
	 * @description generate random number form an array
	 * @returns a random number [0-1[
	 */
	static generate(...nums: number[]): number
	{
		let t = 0;

		for (let num of nums)
		{
			t = t ^ (num += 0x6D2B79F5);
			t = Math.imul(t ^ (t >>> 15), t | 1);
			t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		}
		return ((t ^ (t >>> 14)) >>> 0);
	}
	
};

//set for public use
self["Random"] = Random;
