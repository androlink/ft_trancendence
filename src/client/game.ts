const collideGap = .001

type Point = {
	x: number;
	y: number;
}

type Ray = [Point, Point];

class CollideEvent {
	point: Point;
	dist: number;
	segment: CollideSegment| null;
};

class CollideSegment {
	segment: [Point, Point];

	public constructor(p1: Point, p2: Point) {
		this.segment = [p1, p2];
	}

	public getNormal(): number
	{
		return Math.atan2(this.segment[1].y - this.segment[0].y, this.segment[1].x - this.segment[0].x) + Math.PI / 2;
	}

	public intersect(ray : Ray) : CollideEvent | null{
		const [A, B] = this.segment;
		const [C, D] = ray;

		const denominator = (D.x - C.x) * (B.y - A.y) - (B.x - A.x) * (D.y - C.y);

		if (denominator == 0)
			return null;

		const r = ((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y)) / denominator;

		if ((r) < 0 || (r) > 1) return null;
		
		const s = ((A.x - C.x) * (D.y - C.y) - (D.x - C.x) * (A.y - C.y)) / denominator;

		if ((s + collideGap) < 0 || (s - collideGap) > 1) return null;

		return {
				point: {
					x: s * (B.x - A.x) + A.x, 
					y: s * (B.y - A.y) + A.y
				},
			dist: r
		};
	}

	static intersectSegments(segments: CollideSegment[], ray: Ray)
	{
		return segments.map((s) => {let ce = s.intersect(ray);
			ce != null? ce.segment = s: {}; 
			return ce
		}).filter((s) => {return s != null});
	}
	static getClosestSegment(segments: CollideSegment[], ray: Ray)
	{
		return CollideSegment.intersectSegments(segments, ray).sort((a, b) => {return (b.dist - a.dist)}).pop();
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

	constructor(location: Point|null, angle: number|null, speed: number|null, size: number|null)
	{
		super();
		this.location = location ??= {x:0, y:0};
		this.angle = angle ??= 0;
		this.speed = speed ??= 0;
		this.size = size ??= 0;

	}
	public update(segments: CollideSegment[])
	{
		let remainder = this.speed;
		while (remainder != 0)
		{
			let npos: Point = {x: this.location.x + Math.cos(this.angle) * remainder,
			y:this.location.y + Math.sin(this.angle) * remainder};
			let collide = CollideSegment.getClosestSegment(segments, [this.location, npos]);
			if (collide == null)
			{
				this.location = npos;
				remainder = 0;
			}
			else
			{
				console.log(JSON.stringify(collide));
				this.location = collide.point;
				remainder *= collide.dist;
				this.angle = collide.segment.getNormal();
				this.speed = Math.abs( this.speed + Math.random() * 2 - 1);
				this.speed == 0? this.speed += 1: {};
			}
		}
	}
}

class PongBoard {
	segments: CollideSegment[];
	ball: PongBall;
}

addEventListener("mousedown", (ev) => {
	initGame();
})

setInterval(game, 50);

let segmentList: CollideSegment[] = [];

let pongBall: PongBall = new PongBall(null, null, null, null);

function initGame()
{
	segmentList = [];

	segmentList.push(new CollideSegment({x: 50, y: 50}, {x: 50, y: 150}));
	segmentList.push(new CollideSegment({x: 50, y: 150}, {x: 150, y: 150}));
	segmentList.push(new CollideSegment({x: 150, y: 150}, {x: 150, y: 50}));
	segmentList.push(new CollideSegment({x: 150, y: 50}, {x: 50, y: 50}));
	for (let i = 0;i < 10; i++)
	{
		segmentList.push(new CollideSegment({x: Math.random() * 200, y: Math.random() * 200}, {x: Math.random() * 200, y: Math.random() * 200}));
	}

	pongBall = new PongBall({x: 100, y: 100}, 4, 1, 10);
}

initGame();

function game()
{
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
		ctx.beginPath();
		ctx.moveTo(segment.segment[0].x, segment.segment[0].y);
		ctx.lineTo(segment.segment[1].x, segment.segment[1].y);
		ctx.closePath();
		ctx.stroke();
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
	}
}