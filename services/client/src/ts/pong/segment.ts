
export {
	IPoint,
	ISegment,
	Ray
}

export {
	mean_angle,
	getNormal,
	bsp,
	getMiddle,
}


/**************************************************************************************************/
/*                                                                               segment          */
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

/**************************************************************************************************/
/*                                                                               segment          */
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
