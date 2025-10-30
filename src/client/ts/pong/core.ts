
/**************************************************************************************************/
/*                                                                               Pong             */
/*                                                                                                */
/*                                                                                  PongBall      */
/*                                                                                                */
/*                                                                                                */
/**************************************************************************************************/

import {
	IPongPlayer,
	CONTROL,
	KeyboardPlayer,
	RandomPlayer
} from "./player.js";

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

import {intersectSegments, ICollideObject, CollideEvent, getClosestObject, intersect} from "./collision.js";

class PongBall implements ICollideObject, Drawable
{
	location: IPoint;
	angle: number;
	speed: number;
	speed_increment: number;
	size: number;
	accuracy: number;
	last_player: number;

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

	public update(objects: ICollideObject[], effect: Map<string, Function>): void
	{
		if (this.speed < 0)
		{
			this.speed = -this.speed;
			this.angle += Math.PI;
		}
		let remainder = this.speed;
		let collide = getClosestObject(this, objects, remainder);
		if (collide == null)
		{
			this.location.x += Math.cos(this.angle) * remainder;
			this.location.y += Math.sin(this.angle) * remainder;
		} else {
			this.location.x += Math.cos(this.angle) * collide.event.dist.ray;
			this.location.y += Math.sin(this.angle) * collide.event.dist.ray;
			let call = effect.get((collide.object as Object).constructor.name)
			if (call)
				call(this, collide)
			// if ((collide.object as Object).constructor.name == "PongBoard")
			// 	simpleBounce(this, collide.event);
			// if ((collide.object as Object).constructor.name == "PongPaddle")
			// 	paddleBounce(this, collide.event);
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

let simpleBounce = (ball: PongBall, ce: {event: CollideEvent;object: ICollideObject;}) =>
{
	if (ce.event.segment)
	{
		ball.angle = 2 * (getNormal(ce.event.segment) - Math.PI / 2) - ball.angle;
	}
}

let paddleBounce = (ball: PongBall, ce: {event: CollideEvent;object: ICollideObject;}) =>
{
	if (ce.event.segment)
	{
		ball.angle = getNormal(ce.event.segment) - (ce.event.dist.segment - 0.5) * 2;
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

class PlayerBase implements ICollideObject, Drawable
{
	segmentsList: ISegment[] = [];

	constructor(sides: ISegment[])
	{
		this.segmentsList = sides;
	}

	public isDisable(): boolean
	{
		return false
	}

	public getBounds(): ISegment[]
	{
		return this.segmentsList;
	}

	public collide(other: ICollideObject, maxDist?: number | void): CollideEvent | null
	{
		return null
	}

	public draw(ctx: CanvasRenderingContext2D)
	{
		this.getBounds().forEach((s) => {drawSegment(ctx, s, "#0000FF", true)});
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
		score: number;
		base: PlayerBase;
	}[] | null = null;
	randSeed: number | null = null;
	random: Random | null = null;
	canvas :HTMLCanvasElement | null = null;
	setting: PongSettingInfo | null = null;

	effect: Map<string, Function> = null;

	paused: boolean = true;

	constructor()
	{
		this.canvas = (document.getElementById("canvas") as HTMLCanvasElement);
		this.canvas.width = 100;
		this.canvas.height = 50;
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

		this.board = new PongBoard([
			{segment: [{x: 0, y: 0}, {x: 100, y: 0}]},
			{segment: [{x: 100, y: 50}, {x: 0, y: 50}],}
		]);
		this.teams = [];
		var paddle = new PongPaddle({segment: [{x: 10, y: 45}, {x: 10, y: 5}]}, 0.2, 0.05);
		// var player = new KeyboardPlayer("w", "s") as IPongPlayer;
		var player = new RandomPlayer(new Random(1001)) as IPongPlayer;
		var base = new PlayerBase([
			{segment: [{x: 100, y: 0}, {x: 100, y: 50}]}
		]);
		this.teams.push({player: player, paddle: paddle, base: base, score: 0})
		var paddle = new PongPaddle({segment: [{x: 90, y: 5}, {x: 90, y: 45}]}, 0.2, 0.05);
		// var player = new KeyboardPlayer("l", "o");
		var player = new RandomPlayer(new Random(1000)) as IPongPlayer;
		var base = new PlayerBase([
			{segment: [{x: 0, y: 50}, {x: 0, y: 0}]}
		]);
		this.teams.push({player: player, paddle: paddle, base: base, score: 0})

		this.effect = new Map<string, Function>();
		this.effect.set("PongBoard", simpleBounce);
		this.effect.set("PongPaddle", this.pongPaddle_callBack);
		this.effect.set("PlayerBase", this.playerBase_callBack);
		//this.teams[1].paddle = new PongPaddle({segment: [{x: 90, y: 45}, {x: 90, y: 5}]}, 10, 0.1);
	
	}

	private pongPaddle_callBack = (ball: PongBall, ce: {
    		event: CollideEvent;
    		object: ICollideObject;
		}
	) => {
		console.log("collide with a paddle");
		ball.last_player = this.teams.findIndex((t) => {return t.paddle == ce.object});
		paddleBounce(ball, ce);
	}

	private playerBase_callBack = (ball: PongBall, ce: {
    		event: CollideEvent;
    		object: ICollideObject;
		}
	) => {
		console.log("collide with a base");
		if (ball.last_player != undefined && ball.last_player != null)
			this.teams[ball.last_player].score++;
		this.startRound();
	}

	public startRound()
	{
		let angle = 0;
		const start = {x: 50, y: 25};

		this.balls = [];

		do
		{
			angle = this.random.next() * Math.PI * 2;
			let base_check = false
			for (const t of this.teams)
			{
				if (intersect(t.paddle.movePath,
					{segment: [start, {x: start.x + Math.cos(angle), y: start.y + Math.sin(angle)}]}, Infinity) != null)
					base_check = true;
			}
			if (base_check)
				break ;
			console.debug("nop");
		} while (1);
		this.balls.push(new PongBall(start, 2.5, 1, 0.1 , angle));
	}

	public pause()
	{
		this.paused = true;
	}

	public unpause()
	{
		this.paused = false;
	}

	public togglePause()
	{
		this.paused = !this.paused;
	}

	public loop()
	{
		if (this.paused)
		{
		}
		else
		{
			this.update();
		}
		this.draw();
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
			objects.push(team.base);
		});
		objects.push(this.board);
		this.balls.forEach(b => {
			b.update(objects, this.effect)
		});
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
		context.reset();
		context.fillStyle = "#FFFFFF";
		context.rect(0, 0, 100, 50);
		context.fill();
		let score_text = "|";
		for(const t of this.teams)
		{
			score_text += t.score + "|";
		}
		context.textAlign = "center";
		context.font = "14px monospace";
		context.fillStyle = "black";
		context.fillText(score_text, this.canvas.width / 2, this.canvas.height / 2);
		this.board.draw(context);
		this.balls.forEach((b) => {b.draw(context)})
		for (const team of this.teams)
		{
			team.paddle.draw(context);
			team.base.draw(context);
			//draw(this.canvas.getContext("2d"), team.paddle.getBounds());
			//draw(this.canvas.getContext("2d"), [team.paddle.movePath]);
		}

	}
}
