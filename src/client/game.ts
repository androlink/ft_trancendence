
class Point {
	constructor(x: number, y:number)
	{
		this.x = x;
		this.y = y;
	}

	x: number;
	y: number;
}

type Ray = [Point, Point];

class CollideEvent {

	constructor(point: Point, dist: {ray: number , segment: number}, segment: Segment| null)
	{
		this.point = point;
		this.dist = dist;
		this.segment = segment;
	}
	point: Point;
	dist: {ray: number , segment: number};
	segment: Segment | null;
};

function mean_angle(angles: number[])
{
	let x = angles.map((a) => {return Math.cos(a)}).reduce((t, a) => { return t + a}, 0) / angles.length;
	let y = angles.map((a) => {return Math.sin(a)}).reduce((t, a) => { return t + a}, 0) / angles.length;

	return Math.atan2(y, x);
}

type CollideEffect = {f: Function, args: any[]}

function createEffect(f: Function, ...args: any[]): CollideEffect
{
	return {f, args};
}

class Segment {
	segment: [Point, Point];
	effect: CollideEffect | null;
	public applyEffect(ball: PongBall, event: CollideEvent)
	{
		if (this.effect != null)
			this.effect.f(ball, event, ...this.effect.args);
	}

	public constructor(p1: Point, p2: Point, effect: CollideEffect | null = null) {
		this.segment = [p1, p2];
		this.effect = effect
	}

	public bsp(p: Point): number{
		const a = this.segment[0];
		const b = this.segment[1];
		const c = p;
		return (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x);
	}
	public getNormal(): number
	{
		return Math.atan2(this.segment[1].y - this.segment[0].y, this.segment[1].x - this.segment[0].x) + Math.PI * .5;
	}

	public getMiddle(adv: number = .5): Point
	{
		return new Point(
			(this.segment[0].x - this.segment[1].x) * adv + this.segment[1].x,
			(this.segment[0].y - this.segment[1].y) * adv + this.segment[1].y
		)
	}

	public intersect(ray : Ray) : CollideEvent | null{
		const [A, B] = this.segment;
		const [C, D] = ray;

		const denominator = (D.x - C.x) * (B.y - A.y) - (B.x - A.x) * (D.y - C.y);

		if (denominator == 0)
			return null;

		const r = ((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y)) / denominator;
		
		if (r < 0 || r > 1) return null;
		
		const s = ((A.x - C.x) * (D.y - C.y) - (D.x - C.x) * (A.y - C.y)) / denominator;

		if (s < (0 - 0.001) || s > (1 + 0.001)) return null;

		return new CollideEvent(
			new Point(s * (B.x - A.x) + A.x, s * (B.y - A.y) + A.y), 
			{
				ray: r,
				segment: s
			},
			this);
	}

	static intersectSegments(segments: Segment[], ray: Ray)
	{
		return segments.map((s) => {
			return s.intersect(ray)
		}).filter((s) => {
			return s != null
		});
	}
	static getClosestSegment(segments: Segment[], ray: Ray)
	{
		return Segment.intersectSegments(segments, ray).sort((a, b) => {
			return (a.dist.ray - b.dist.ray)
		}).pop();
	}
}

class PongBall
{
	location: Point;
	angle: number;
	speed: number;
	size: number;
	accuracy: number;

	constructor(location: Point|null, angle: number|null, speed: number|null, size: number|null, accuracy: number|null)
	{
		this.location = location ??= new Point(0, 0);
		this.angle = angle ??= 0;
		this.speed = speed ??= 0;
		this.size = size ??= 10;
		this.accuracy = accuracy ??= 6;
	}
	public getCollidePoints(): Point[]
	{
		const accu = this.accuracy * 2;

		const angle = (Math.PI * 2 / accu);

		let points: Point[] = [];
		for (let i = 0; i < accu / 2 + 1; i++)
		{
			points.push(new Point(
				(this.location.x + Math.cos(i * angle + (this.angle - Math.PI / 2)) * this.size),
				(this.location.y + Math.sin(i * angle + (this.angle - Math.PI / 2)) * this.size)
			));
		}

		return points
	}

	public update(segments: Segment[])
	{
		console.log("---update---");
		if (this.speed < 0)
		{
			this.speed = -this.speed;
			this.angle += Math.PI;
		}
		
		let remainder = this.speed;
		let count = 0;
		while (remainder > 0.000001 && count < 100)
		{
			console.log("remainder: " + remainder);
			console.log("count: " + count);
			count++;
			let deltaPos: Point = {x: Math.cos(this.angle) * remainder,
			y: Math.sin(this.angle) * remainder};
			let collision : CollideEvent[] = [];
			{
				let collidePoints = this.getCollidePoints();
				collidePoints.forEach((point) => {
					let usableSegment = segments.filter((s) => {return s.bsp(this.location) > 0});
					let targetPoint = new Point(point.x + deltaPos.x, point.y + deltaPos.y);
					let events = Segment.intersectSegments(usableSegment, [this.location, targetPoint]);
					collision.push(...events);
				})
			}
			collision = collision.filter((s)=>{return s.segment.effect != null}).sort((a, b) => {return (a.dist.ray - b.dist.ray)})
			if (collision.length == 0)
			{
				this.location = {x: this.location.x + deltaPos.x,
						y: this.location.y + deltaPos.y};
				remainder = 0;
			}
			else
			{
				console.log(JSON.stringify(collision));
				let lastCollide = collision[0];
				this.location.x += Math.cos(this.angle) * remainder * lastCollide.dist.ray;
				this.location.y += Math.sin(this.angle) * remainder * lastCollide.dist.ray;
				remainder *= 1 / ( 1 + lastCollide.dist.ray);
				lastCollide.segment.applyEffect(this, lastCollide);
				// this.angle = 2 * (lastCollide.segment.getNormal() - Math.PI / 2) - this.angle;
			}
		}
		if (count == 100)
			console.error("PongBall: infinite loop detected");
	}
}

let simpleBounce : Function = (ball: PongBall, ce: CollideEvent) =>
{
	ball.angle = 2 * (ce.segment.getNormal() - Math.PI / 2) - ball.angle;
}

let paddleBounce : Function = (ball: PongBall, ce: CollideEvent, player: PongPlayer) =>
{
	ball.angle = ce.segment.getNormal() - (ce.dist.segment - 0.5) * 2;
}

class PongPlayer
{
	constructor(path: Segment, size: number)
	{
		this.movePath = path;
		this.size = size;
	}

	angle : number = 0;
	movePath : Segment;
	position: number = 0.5;
	size: number;
	speed: number;

	public getPaddle() : Segment
	{
		let p1: Point, p2: Point;
		const pos = this.movePath.getMiddle(this.position);
		const pathAngle = this.angle + this.movePath.getNormal() - Math.PI / 2;

		p1 = new Point(
			-Math.cos(pathAngle) * this.size / 2 + pos.x,
			-Math.sin(pathAngle) * this.size / 2 + pos.y);
		p2 = new Point(
			Math.cos(pathAngle) * this.size / 2 + pos.x,
			Math.sin(pathAngle) * this.size / 2 + pos.y);
		return new Segment(p1, p2, createEffect(paddleBounce, this));
	};
}

class PongBoard {
	segmentsList: Segment[] = [];
	ball: PongBall;
	player: PongPlayer[] = [];
	count: number = 0;

	public getSegments(): Segment[]
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
		this.ball.update(testingSegment);
	}
	public init()
	{
		const maxWall = 8;
		const size = 100;
		const angle = Math.PI * 2 / maxWall;
		const defaultAngle = -Math.PI / 2;

		this.segmentsList = [];
		let points = [];
		for (let i = 0; i < maxWall; i++)
		{
			let mult = i % 2;
			points.push(new Point(
				(100+Math.cos(i*angle + defaultAngle)*(size)),
				(100+Math.sin(i*angle + defaultAngle)*(size))
			));
		}
		for (let i = 0; i < maxWall; i++)
		{
			this.segmentsList.push(new Segment(points[i],points[(i + 1 + maxWall) % maxWall], createEffect(simpleBounce)));
		}

		this.ball = new PongBall({x: 100, y: 100}, 0, 1, 5, 6);

		this.player = [];
		this.player.push(new PongPlayer(new Segment(new Point(150, 50), new Point(150,150)), 50));
		this.player.push(new PongPlayer(new Segment(new Point(50, 150), new Point(50,50)), 50));

		this.count = 0;
	}
}

let intervalId = 0;

let board: PongBoard = new PongBoard();

function initGame()
{
	board.init();
	clearInterval(intervalId)
	intervalId = setInterval(game, 1000/30);

}

initGame();

function game()
{
	for (let i = 0; i < 1; i++)
		board.update();
	draw(board.getSegments(), board.ball);
}


function draw(segments: Segment[], ball: PongBall)
{
	let canvas :HTMLCanvasElement = (document.getElementById("canvas") as HTMLCanvasElement);
	let ctx = canvas.getContext("2d");
	canvas.width = 200;
	canvas.height = 200;
	segments.forEach((segment) => {
		if (segment.bsp(ball.location) > 0){
			drawSegment(ctx, segment, "#000000");
		}
		let mid = segment.getMiddle();

		drawSegment(ctx, new Segment(mid, new Point(mid.x + Math.cos(segment.getNormal()) * 5, mid.y + Math.sin(segment.getNormal()) * 5)), "#ff0000");
	});
	// Segment.intersectSegments(segments,ray).forEach((se) => {
	// 	 ctx.beginPath();
	// 	ctx.arc(se.point.x, se.point.y, 3, 0, 2 * Math.PI);
	// 	ctx.closePath();
	// 	ctx.fill();
	// });
	// let s = Segment.getClosestSegment(segments, ray);
	// if (s != null)
	// {
	// 	ctx.beginPath();
	// 	ctx.fillStyle = "#FF00FF";
	// 	ctx.arc(s.point.x, s.point.y, 3, 0, 2 * Math.PI);
	// 	ctx.fill();
	// 	ctx.closePath();
	// }
	if (ball != null)
	{
		ctx.beginPath();
		ctx.fillStyle = "#00FF00";
		ctx.arc(ball.location.x, ball.location.y, ball.size, 0, 2 * Math.PI);
		ctx.fill();
		ctx.closePath();
		let deltaPos: Point = {x: Math.cos(ball.angle) * ball.speed,
			y: Math.sin(ball.angle) * ball.speed};
		ball.getCollidePoints().forEach((p) => {
			drawSegment(ctx, new Segment(p, new Point(p.x + deltaPos.x, p.y + deltaPos.y)), "#0000ff");
		})
	}
}

function drawSegment(ctx: CanvasRenderingContext2D,segment: Segment, color: string | CanvasGradient | CanvasPattern)
{
	ctx.beginPath();
	ctx.moveTo(segment.segment[0].x, segment.segment[0].y);
	ctx.lineTo(segment.segment[1].x, segment.segment[1].y);
	ctx.closePath();
	ctx.strokeStyle = color;
	ctx.stroke();
}