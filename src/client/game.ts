
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
	point: Point;
	dist: {ray: number , segment: number};
	segment: CollideSegment| null;
};

function mean_angle(angles: number[])
{
	let x = angles.map((a) => {return Math.cos(a)}).reduce((t, a) => { return t + a}, 0) / angles.length;
	let y = angles.map((a) => {return Math.sin(a)}).reduce((t, a) => { return t + a}, 0) / angles.length;

	return Math.atan2(y, x);
}

class CollideSegment {
	segment: [Point, Point];

	public constructor(p1: Point, p2: Point) {
		this.segment = [p1, p2];
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

	public getMiddle(): Point
	{
		return new Point(
			(this.segment[0].x - this.segment[1].x) * 0.5 + this.segment[1].x,
			(this.segment[0].y - this.segment[1].y) * 0.5 + this.segment[1].y
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

		return {
				point: {
					x: s * (B.x - A.x) + A.x, 
					y: s * (B.y - A.y) + A.y,
				},
				dist: {
					ray: r,
					segment: s
				},
				segment: this
		};
	}

	static intersectSegments(segments: CollideSegment[], ray: Ray)
	{
		return segments.map((s) => {
			return s.intersect(ray)
		}).filter((s) => {
			return s != null
		});
	}
	static getClosestSegment(segments: CollideSegment[], ray: Ray)
	{
		return CollideSegment.intersectSegments(segments, ray).sort((a, b) => {
			return (a.dist.ray - b.dist.ray)
		}).pop();
	}
}

class CollideObject
{
	segments: CollideSegment[] = [];

	public getSegments() {return this.segments;}

}

class PongBall extends CollideObject{
	location: Point;
	angle: number;
	speed: number;
	size: number;
	accuracy: number;

	constructor(location: Point|null, angle: number|null, speed: number|null, size: number|null, accuracy: number|null)
	{
		super();
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

	public update(segments: CollideSegment[])
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
					let usableSegment = segments.filter((s) => {return s.bsp(this.location) >= 0});
					let targetPoint = new Point(point.x + deltaPos.x, point.y + deltaPos.y);
					let events = CollideSegment.intersectSegments(usableSegment, [this.location, targetPoint]);
					collision.push(...events);
				})
			}
			collision.sort((a, b) => {return (a.dist.ray - b.dist.ray)})
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

				console.log(JSON.stringify(lastCollide));
				this.location.x += Math.cos(this.angle) * remainder * lastCollide.dist.ray;
				this.location.y += Math.sin(this.angle) * remainder * lastCollide.dist.ray;
				remainder *= 1 / ( 1 + lastCollide.dist.ray);
				
				this.angle = 2 * (lastCollide.segment.getNormal() - Math.PI / 2) - this.angle;
			}
		}
	}
}

class PongBoard {
	segments: CollideSegment[];
	ball: PongBall;
}

let intervalId = 0;

let segmentList: CollideSegment[] = [];

let pongBall: PongBall = new PongBall(null, null, null, null, 3);

function initGame()
{
	const maxWall = 80;
	const size = 100;
	const angle = Math.PI * 2 / maxWall;
	const defaultAngle = -Math.PI / 2;

	segmentList = [];
	let points = [];
	for (let i = 0; i < maxWall; i++)
	{
		let mult = i % 2;
		points.push(new Point(
			(100+Math.cos(i*angle + defaultAngle)*(size - 80 * mult)),
			(100+Math.sin(i*angle + defaultAngle)*(size - 80 * mult))
		));
	}
	for (let i = 0; i < maxWall; i++)
	{
		segmentList.push(new CollideSegment(points[i],points[(i + 1 + maxWall) % maxWall]));
	}

	for (let i = 0; i < 0; i++)
	{
		segmentList.push(new CollideSegment({x: Math.random() * 200, y: Math.random() * 200}, {x: Math.random() * 200, y: Math.random() * 200}));
	}

	pongBall = new PongBall({x: 100, y: 100}, 0, 1, 5, 6);

	clearInterval(intervalId)
	intervalId = setInterval(game, 50);

}

initGame();

function game()
{
	pongBall.speed = document.getElementById("ballSpeed").value;
	pongBall.update(segmentList);
	draw(segmentList, pongBall);
}


function draw(segments: CollideSegment[], ball: PongBall)
{
	let canvas :HTMLCanvasElement = (document.getElementById("canvas") as HTMLCanvasElement);
	let ctx = canvas.getContext("2d");
	canvas.width = 200;
	canvas.height = 200;
	segments.forEach((segment) => {
		if (segment.bsp(ball.location) > 0){
			ctx.beginPath();
			ctx.moveTo(segment.segment[0].x, segment.segment[0].y);
			ctx.lineTo(segment.segment[1].x, segment.segment[1].y);
			ctx.closePath();
			ctx.stroke();
		}
		let mid = segment.getMiddle();
		ctx.beginPath();
		ctx.save();
		ctx.strokeStyle = '#ff0000'
		ctx.moveTo(mid.x, mid.y);
		ctx.lineTo(mid.x + Math.cos(segment.getNormal()) * 5, mid.y + Math.sin(segment.getNormal()) * 5);
		ctx.closePath();
		ctx.stroke();
		ctx.restore();
	});
	// CollideSegment.intersectSegments(segments,ray).forEach((se) => {
	// 	 ctx.beginPath();
	// 	ctx.arc(se.point.x, se.point.y, 3, 0, 2 * Math.PI);
	// 	ctx.closePath();
	// 	ctx.fill();
	// });
	// let s = CollideSegment.getClosestSegment(segments, ray);
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
			ctx.beginPath();
			//ctx.arc(p.x + deltaPos.x, p.y + deltaPos.y, 2, 0, 2 * Math.PI);
			ctx.moveTo(p.x, p.y);
			ctx.lineTo(p.x + deltaPos.x, p.y + deltaPos.y);
			ctx.closePath();
			ctx.stroke();
		})
	}
}