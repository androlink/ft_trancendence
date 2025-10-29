
/**************************************************************************************************/
/*                                                                               Pong             */
/*                                                                                                */
/*                                                                                  PongBall      */
/*                                                                                                */
/*                                                                                                */
/**************************************************************************************************/

import {
	draw,
	Drawable,
	drawSegment
} from "./draw.js"

import {
	mean_angle,
	getNormal,
	bsp,
	getMiddle,
	IPoint,
	ISegment,
	Ray
} from "./segment.js"

import {Random} from "./random.js"

import {intersectSegments, ICollideObject, CollideEvent, getClosestObject} from "./collision.js";

class PongBall implements ICollideObject, Drawable
{
	location: IPoint;
	angle: number;
	speed: number;
	speed_increment: number;
	size: number;
	accuracy: number;

	constructor(location: IPoint, size: number, speed: number, speed_increment: number, angle: number, accuracy: number = 6)
	{
		this.location = location;
		this.angle = angle;
		this.speed = speed;
		this.size = size;
		this.accuracy = accuracy;
		this.speed_increment = speed_increment;
	}

	public getCollidePoints(): IPoint[]
	{
		const accu = this.accuracy * 2;

		const angle = (Math.PI * 2 / accu);

		let points: IPoint[] = [];
		for (let i = 0; i < accu / 2 + 1; i++)
		{
			points.push({
				x: (this.location.x + Math.cos(i * angle + (this.angle - Math.PI / 2)) * this.size),
				y: (this.location.y + Math.sin(i * angle + (this.angle - Math.PI / 2)) * this.size)
			});
		}

		return points
	}

	public isDisable(): boolean {
		return false;
	}

	public getBounds(): ISegment[] {

		const accu = this.accuracy * 2;
		const angle = (Math.PI * 2 / accu);

		let points: IPoint[] = [];
		let segments: ISegment[] = [];
		for (let i = 0; i < accu; i++)
		{
			points.push({
				x: (this.location.x + Math.cos(i * angle + (this.angle - Math.PI / 2)) * this.size),
				y: (this.location.y + Math.sin(i * angle + (this.angle - Math.PI / 2)) * this.size)
			});
		}
		for (let i = 0; i < accu; i++)
		{
			segments.push({segment: [points[(i + 1) % points.length], points[i]]});
		}
		return segments;
	}

	public collide(other: ICollideObject, dist: number = this.speed): CollideEvent | null
	{
		let collision : CollideEvent[] = [];
		let segments : ISegment[] = other.getBounds();
		let deltaPos : IPoint = {
			x: Math.cos(this.angle) * dist,
			y: Math.sin(this.angle) * dist
		};

		let collidePoints = this.getCollidePoints();
		collidePoints.forEach((point) => {
			let usableSegment = segments.filter((s) => {return bsp(s, this.location) > 0});
			let targetPoint = {x: point.x + deltaPos.x, y: point.y + deltaPos.y};
			let events = intersectSegments(usableSegment, {segment: [this.location, targetPoint]});
			collision.push(...events);
		})
		collision = collision.sort((a, b) => {return (a.dist.ray - b.dist.ray)})
		if (collision.length == 0)
			return null;
		return collision[0];
	}

	public draw(ctx: CanvasRenderingContext2D)
	{
		this.getBounds().forEach((s) => {drawSegment(ctx, s, undefined, true)});
	}

	public update(objects: ICollideObject[])
	{
		if (this.speed < 0)
		{
			this.speed = -this.speed;
			this.angle += Math.PI;
		}
		let remainder = this.speed;
		let collide = getClosestObject(this, objects, remainder);
		console.debug(collide);
		if (collide == null)
		{
			this.location.x += Math.cos(this.angle) * remainder;
			this.location.y += Math.sin(this.angle) * remainder;
		} else {
			console.debug((collide.object as Object).constructor.name);
			if ((collide.object as Object).constructor.name == "PongBoard")
				simpleBounce(this, collide.event);
			if ((collide.object as Object).constructor.name == "PongPaddle")
				paddleBounce(this, collide.event);
		}
	}

	// public update(segments: ISegment[])
	// {
	// 	console.log("---update---");
	// 	if (this.speed < 0)
	// 	{
	// 		this.speed = -this.speed;
	// 		this.angle += Math.PI;
	// 	}
		
	// 	let remainder = this.speed;
	// 	let count = 0;
	// 	while (remainder > 0.000001 && count < 100)
	// 	{
	// 		console.log("remainder: " + remainder);
	// 		console.log("count: " + count);
	// 		count++;
	// 		let deltaPos: IPoint = {x: Math.cos(this.angle) * remainder,
	// 		y: Math.sin(this.angle) * remainder};
	// 		let collision : CollideEvent[] = [];
	// 		{
	// 			let collidePoints = this.getCollidePoints();
	// 			collidePoints.forEach((point) => {
	// 				let usableSegment = segments.filter((s) => {return bsp(s, this.location) > 0});
	// 				let targetPoint = {x: point.x + deltaPos.x, y: point.y + deltaPos.y};
	// 				let events = intersectSegments(usableSegment, {segment: [this.location, targetPoint]});
	// 				collision.push(...events);
	// 			})
	// 		}
	// 		collision = collision.sort((a, b) => {return (a.dist.ray - b.dist.ray)})
	// 		if (collision.length == 0)
	// 		{
	// 			this.location = {x: this.location.x + deltaPos.x,
	// 					y: this.location.y + deltaPos.y};
	// 			remainder = 0;
	// 		}
	// 		else
	// 		{
	// 			console.log(collision);
	// 			let lastCollide = collision[0];
	// 			const dist = (remainder * lastCollide.dist.ray)

	// 			this.location.x += Math.cos(this.angle) * dist;
	// 			this.location.y += Math.sin(this.angle) * dist;
	// 			remainder -= dist;
	// 			this.angle = 2 * (getNormal(lastCollide.segment) - Math.PI / 2) - this.angle;
	// 		}
	// 	}
	// 	if (count == 100)
	// 		console.error("PongBall: infinite loop detected");
	// }
}

let simpleBounce = (ball: PongBall, ce: CollideEvent) =>
{
	if (ce.segment)
	{
		ball.angle = 2 * (getNormal(ce.segment) - Math.PI / 2) - ball.angle;
	}
}

let paddleBounce = (ball: PongBall, ce: CollideEvent) =>
{
	if (ce.segment)
	{
		ball.angle = getNormal(ce.segment) - (ce.dist.segment - 0.5) * 2;
		ball.speed += ball.speed_increment;
	}
}

/**************************************************************************************************/
/*                                                                               Pong             */
/*                                                                                                */
/*                                                                                  PongPlayer    */
/*                                                                                                */
/*                                                                                                */
/**************************************************************************************************/

class PongPaddle implements ICollideObject, Drawable
{
	angle : number = 0;
	movePath : ISegment;
	position: number = 0.5;
	size: number;
	speed: number;

	public constructor(movePath: ISegment, size: number, speed: number)
	{
		this.movePath = movePath;
		this.size = size;
		this.speed = speed;
	}

	public isDisable(): boolean
	{
		return false;
	}

	public collide(): CollideEvent| null
	{
		return null;
	}

	public getBounds(): ISegment[]
	{
		let p1: IPoint, p2: IPoint;
		const pos = getMiddle(this.movePath, this.position);
		const pathAngle = this.angle + getNormal(this.movePath) - Math.PI / 2;
		const real_size = Math.hypot(
			this.movePath.segment[1].x - this.movePath.segment[0].x,
			this.movePath.segment[1].y - this.movePath.segment[0].y
		) * this.size;

		p1 = {
			x: -Math.cos(pathAngle) * real_size / 2 + pos.x,
			y: -Math.sin(pathAngle) * real_size / 2 + pos.y};
		p2 = {
			x: Math.cos(pathAngle) * real_size / 2 + pos.x,
			y: Math.sin(pathAngle) * real_size / 2 + pos.y};
		return [{segment: [p1, p2]}];
	}

	public move(input: CONTROL)
	{
		if (input == CONTROL.LEFT)
			this.position -= this.speed;
		if (input == CONTROL.RIGHT)
			this.position += this.speed;
		if (this.position < 0 + this.size / 2)
			this.position = 0 + this.size / 2;
		else if (this.position > 1 - this.size / 2)
			this.position = 1 - this.size / 2;
	}

	public draw(ctx: CanvasRenderingContext2D)
	{
		this.getBounds().forEach((s) => {drawSegment(ctx, s, "#0000FF", true)});
	}
};

enum CONTROL {
	NONE,
	LEFT,
	RIGHT,
}

class PlayerBase implements ICollideObject, Drawable
{
	public isDisable(): boolean
	{
		return false
	}

	public getBounds(): ISegment[]
	{
		return []
	}

	public collide(other: ICollideObject, maxDist?: number | void): CollideEvent | null
	{
		return null
	}

	public draw()
	{

	}

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

class PongBoard implements ICollideObject, Drawable
{
	segmentsList: ISegment[] = [];

	constructor(sides: ISegment[])
	{
		this.segmentsList = sides;
	}

	public getBounds(): ISegment[]
	{
		return this.segmentsList;
	}

	public isDisable(): boolean {
		return false;
	}

	public collide(other: ICollideObject): CollideEvent | null {
		return null;
	}

	public draw(ctx: CanvasRenderingContext2D)
	{
		this.getBounds().forEach((s) => {drawSegment(ctx, s, void 0, true)});
	}
}

type PongSettingInfo = {
	board: {
		sides: ISegment[]
	}
}

/**************************************************************************************************/
/*                                                                               Pong             */
/*                                                                                                */
/*                                                                                PongGameManager */
/*                                                                                                */
/*                                                                                                */
/**************************************************************************************************/

export class PongGameManager
{
	board: PongBoard | null = null;
	balls: PongBall[] | null = null;
	teams: {
		player: IPongPlayer;
		paddle: PongPaddle;
	}[] | null = null;
	randSeed: number | null = null;
	random: Random | null = null;
	canvas :HTMLCanvasElement | null = null;
	setting: PongSettingInfo | null = null;

	private _intervalID: number | null = null;

	constructor()
	{
		this.canvas = (document.getElementById("canvas") as HTMLCanvasElement);
		this.canvas.width = 100;
		this.canvas.height = 100;
	}

	// static CreateGameManager(setting: PongSettingInfo): PongGameManager
	// {
	// 	let manager = new PongGameManager();
	// 	if (Object.hasOwn(manager, "board"))
	// 	{
	// 		manager.board = new PongBoard(manager.board);
	// 	}
	// 	return manager;
	// }

	// 100:50
	public generate()
	{
		this.randSeed = Math.random() * (2 ** 31);
		this.random = new Random(this.randSeed);
		this.balls = [];
		this.balls.push(new PongBall({x: 50, y: 25}, 2, 1, 0.1 , this.random.next() * Math.PI * 2));
		this.board = new PongBoard([
			{segment: [{x: 0, y: 0}, {x: 100, y: 0}]},
			{segment: [{x: 100, y: 50}, {x: 0, y: 50}],}
		]);
		this.teams = [];
		var paddle = new PongPaddle({segment: [{x: 10, y: 45}, {x: 10, y: 5}]}, 0.2, 0.05);
		var player = new KeyboardPlayer("w", "s");
		this.teams.push({player: player, paddle: paddle})
		var paddle = new PongPaddle({segment: [{x: 90, y: 5}, {x: 90, y: 45}]}, 0.2, 0.05);
		var player = new KeyboardPlayer("l", "o");
		this.teams.push({player: player, paddle: paddle})

		//this.teams[1].paddle = new PongPaddle({segment: [{x: 90, y: 45}, {x: 90, y: 5}]}, 10, 0.1);
	
	}

	public start()
	{
		this.stop();
		this._intervalID = setInterval((manager: PongGameManager) => {
			manager.update()
		}, 1000 / 30, this);
	}

	public update()
	{
		if (this.teams == null || this.board == null || this.balls == null)
			return ;	
		for (const team of this.teams)
		{
			team.paddle.move(team.player.getInput());
		}
		let objects: ICollideObject[] = [];
		this.teams.forEach(team => {
			objects.push(team.paddle);
		});
		objects.push(this.board);
		this.balls.forEach(b => {b.update(objects)});
		this.draw();
	}

	public draw()
	{
		if (this.canvas == null
			|| this.teams == null
			|| this.board == null
			|| this.balls == null)
			return ;
		const context = this.canvas.getContext("2d");
		if (context == null)
			return ;
		context?.reset();
		this.board.draw(context);
		this.balls.forEach((b) => {b.draw(context)})
		for (const team of this.teams)
		{
			team.paddle.draw(context);
			//draw(this.canvas.getContext("2d"), team.paddle.getBounds());
			//draw(this.canvas.getContext("2d"), [team.paddle.movePath]);
		}
	}

	public stop()
	{
		if (this._intervalID != null)
		{
			clearInterval(this._intervalID);
			this._intervalID = null
		}
	}
}
