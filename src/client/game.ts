
/**************************************************************************************************/
/*                                                                               Pong             */
/*                                                                                                */
/*                                                                                  PongBall      */
/*                                                                                                */
/*                                                                                                */
/**************************************************************************************************/


class PongBall implements ICollideObject
{
	location: IPoint;
	angle: number;
	speed: number;
	size: number;
	accuracy: number;

	constructor(location: IPoint|null, angle: number|null, speed: number|null, size: number|null, accuracy: number|null)
	{
		this.location = location ??= {x: 0, y: 0};
		this.angle = angle ??= 0;
		this.speed = speed ??= 0;
		this.size = size ??= 10;
		this.accuracy = accuracy ??= 6;
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
		return;
	}

	public collide(other: ICollideObject, dist: number = this.speed): CollideEvent | null
	{
		let collision : CollideEvent[] = [];
		let segments : ISegment[] = other.getBounds();
		let deltaPos: IPoint = {
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
			return null
		return collision[0];
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
		ball.angle = 2 * (getNormal(ce.segment) - Math.PI / 2) - ball.angle;
}

let paddleBounce = (ball: PongBall, ce: CollideEvent, player: PongPlayer) =>
{
	if (ce.segment)
		ball.angle = getNormal(ce.segment) - (ce.dist.segment - 0.5) * 2;
}

/**************************************************************************************************/
/*                                                                               Pong             */
/*                                                                                                */
/*                                                                                  PongPlayer    */
/*                                                                                                */
/*                                                                                                */
/**************************************************************************************************/

class PongPlayer
{
	constructor(path: ISegment, size: number)
	{
		this.movePath = path;
		this.size = size;
	}

	angle : number = 0;
	movePath : ISegment;
	position: number = 0.5;
	size: number;
	speed: number;

	public getPaddle() : ISegment
	{
		let p1: IPoint, p2: IPoint;
		const pos = getMiddle(this.movePath, this.position);
		const pathAngle = this.angle + getNormal(this.movePath) - Math.PI / 2;

		p1 = {
			x: -Math.cos(pathAngle) * this.size / 2 + pos.x,
			y: -Math.sin(pathAngle) * this.size / 2 + pos.y};
		p2 = {
			x: Math.cos(pathAngle) * this.size / 2 + pos.x,
			y: Math.sin(pathAngle) * this.size / 2 + pos.y};
		return {segment: [p1, p2]};
	};
}

class PongBoard {
	segmentsList: ISegment[] = [];
	ball: PongBall;
	player: PongPlayer[] = [];
	count: number = 0;

	public getSegments(): ISegment[]
	{
		let testingSegment = [];

		testingSegment.push(...this.segmentsList);
		this.player.forEach((p) => {testingSegment.push(p.getPaddle());})
		return testingSegment;
	}

	public update()
	{
		let testingSegment = this.getSegments();
		this.count++;
		this.player.forEach((p) => {
			//p.position = (Math.cos(this.count /100) + 1) * .5;
			p.position = 0.4;
			if (p.position > 1)
				p.position -= 1;
		});
		this.ball.speed = document.getElementById("ballSpeed").value;
		//this.ball.update(testingSegment);
	}
	public init()
	{
		const maxWall = 8;
		const size = 250;
		const angle = Math.PI * 2 / maxWall;
		const defaultAngle = -Math.PI / 2;

		this.segmentsList = [];
		let points = [];
		for (let i = 0; i < maxWall; i++)
		{
			let mult = i % 2;
			points.push({
				x: 250+Math.cos(i*angle + defaultAngle)*(size),
				y: 250+Math.sin(i*angle + defaultAngle)*(size)
			});
		}
		for (let i = 0; i < maxWall; i++)
		{
			this.segmentsList.push({segment: [points[i], points[(i + 1 + maxWall) % maxWall]]});
		}

		this.ball = new PongBall({x: 100, y: 100}, 0, 1, 5, 6);

		this.player = [];
		this.player.push(new PongPlayer({segment: [{x: 250,y: 100}, {x: 250,y: 250}]}, 50));
		this.player.push(new PongPlayer({segment: [{x: 100,y: 250}, {x: 100,y: 100}]}, 50));
		this.count = 0;
	}
}


/**************************************************************************************************/
/*                                                                               Pong             */
/*                                                                                                */
/*                                                                                PongGameManager */
/*                                                                                                */
/*                                                                                                */
/**************************************************************************************************/

class PongGameManager
{
	board: PongBoard;
}

let intervalId = 0;

let board: PongBoard = new PongBoard();

function initGame()
{
	board.init();
	stop()
	intervalId = setInterval(game, 1000/30);

}

function stop()
{
	clearInterval(intervalId);
}

initGame();

function game()
{
	for (let i = 0; i < 1; i++)
		board.update();
	draw(board.getSegments(), board.ball);
}


function draw(segments: ISegment[], ball: PongBall)
{
	let canvas :HTMLCanvasElement = (document.getElementById("canvas") as HTMLCanvasElement);
	let ctx = canvas.getContext("2d");
	canvas.width = 500;
	canvas.height = 500;
	segments.forEach((segment) => {
		if (bsp(segment, ball.location) > 0){
			drawSegment(ctx, segment, "#000000");
		}
		let mid = getMiddle(segment);

		drawSegment(ctx, {segment: [mid, {x: mid.x + Math.cos(getNormal(segment)) * 5, y: mid.y + Math.sin(getNormal(segment)) * 5}]}, "#ff0000");
	});
	if (ball != null)
	{
		ctx.beginPath();
		ctx.fillStyle = "#00FF00";
		ctx.arc(ball.location.x, ball.location.y, ball.size, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();
		let deltaPos: IPoint = {x: Math.cos(ball.angle) * ball.speed,
			y: Math.sin(ball.angle) * ball.speed};
		ball.getCollidePoints().forEach((p) => {
			drawSegment(ctx, {segment: [p, {x: p.x + deltaPos.x, y: p.y + deltaPos.y}]}, "#0000ff");
		})
	}
}

function drawSegment(ctx: CanvasRenderingContext2D, segment: ISegment, color: string | CanvasGradient | CanvasPattern)
{
	ctx.beginPath();
	ctx.moveTo(segment.segment[0].x, segment.segment[0].y);
	ctx.lineTo(segment.segment[1].x, segment.segment[1].y);
	ctx.closePath();
	ctx.strokeStyle = color;
	ctx.stroke();
}

/**************************************************************************************************/
/*                                                                               collision        */
/*                                                                                                */
/*                                                                                  type          */
/*                                                                                                */
/*                                                                                                */
/**************************************************************************************************/

interface IPoint
{
	x: number;
	y: number;
};

interface ISegment
{
	segment: [IPoint, IPoint];
}

type Ray = ISegment

interface ICollideObject
{
	isDisable(): boolean;
	getBounds(): ISegment[];
	collide(other: ICollideObject): CollideEvent | CollideEvent[] | null;
}

class CollideEvent {

	constructor(point: IPoint, dist: {ray: number , segment: number}, segment: ISegment| null)
	{
		this.point = point;
		this.dist = dist;
		this.segment = segment;
	}
	point: IPoint;
	dist: {ray: number , segment: number};
	segment: ISegment | null;
};

/**************************************************************************************************/
/*                                                                               collision        */
/*                                                                                                */
/*                                                                                  function      */
/*                                                                                                */
/*                                                                                                */
/**************************************************************************************************/

function mean_angle(angles: number[])
{
	let x = angles.map((a) => {return Math.cos(a)}).reduce((t, a) => { return t + a}, 0) / angles.length;
	let y = angles.map((a) => {return Math.sin(a)}).reduce((t, a) => { return t + a}, 0) / angles.length;

	return Math.atan2(y, x);
}

function getNormal(segment: ISegment): number
{
	return Math.atan2(segment.segment[1].y - segment.segment[0].y, segment.segment[1].x - segment.segment[0].x) + Math.PI * .5;
}

function intersectSegments(segments: ISegment[], ray: Ray)
{
	return segments.map((s) => {
		return intersect(s, ray)
	}).filter((s) => {
		return s != null
	});
}

function bsp(segment: ISegment, p: IPoint): number{
	const a = segment.segment[0];
	const b = segment.segment[1];
	const c = p;
	return (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x);
}

function getMiddle(segment: ISegment, adv: number = .5): IPoint
{
	return {
		x: (segment.segment[0].x - segment.segment[1].x) * adv + segment.segment[1].x,
		y: (segment.segment[0].y - segment.segment[1].y) * adv + segment.segment[1].y
	}
}

function getClosestSegment(segments: ISegment[], ray: Ray)
{
	return intersectSegments(segments, ray).sort((a, b) => {
		return (a.dist.ray - b.dist.ray)
	}).pop();
}

function intersect(segment: ISegment, ray : ISegment) : CollideEvent | null{
	const [A, B] = segment.segment;
	const [C, D] = ray.segment;

	const denominator = (D.x - C.x) * (B.y - A.y) - (B.x - A.x) * (D.y - C.y);

	if (denominator == 0)
		return null;

	const r = ((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y)) / denominator;
	
	if (r < 0 || r > 1) return null;
	
	const s = ((A.x - C.x) * (D.y - C.y) - (D.x - C.x) * (A.y - C.y)) / denominator;

	if (s < (0 - 0.001) || s > (1 + 0.001)) return null;

	return new CollideEvent(
		{
			x: s * (B.x - A.x) + A.x,
			y: s * (B.y - A.y) + A.y
		},
		{
			ray: r,
			segment: s
		},
		segment);
}
