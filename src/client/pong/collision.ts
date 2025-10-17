
export {ICollideObject, CollideEvent}

export {intersectSegments, getClosestSegment};

import { IPoint, ISegment, Ray, bsp} from "./segment";

interface ICollideObject
{
	isDisable(): boolean;
	getBounds(): ISegment[];
	collide(other: ICollideObject, maxDist: number | void): CollideEvent | CollideEvent[] | null;
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


/**
 * 
 * @param segment the segment to test
 * @param ray 
 * @returns CollideEvent if collide else null
 */
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

function getClosestObject(object: ICollideObject, targets: ICollideObject[],
	dist: number | void = undefined)
	: null | {event: CollideEvent, object: ICollideObject}
{
	let closest = null;

	for (let t of targets)
	{
		object.collide(t, dist);
	}

	return null;
}

function intersectSegments(segments: ISegment[], ray: Ray)
{
	return segments.map((s) => {
		return intersect(s, ray)
	}).filter((s) => {
		return s != null
	});
}

function getClosestSegment(segments: ISegment[], ray: Ray)
{
	return intersectSegments(segments, ray).sort((a, b) => {
		return (a.dist.ray - b.dist.ray)
	}).pop();
}
