
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
	p0: IPoint,
	p1: IPoint
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
	return Math.atan2(segment.p1.y - segment.p0.y, segment.p1.x - segment.p0.x) + Math.PI * .5;
}

function bsp(segment: ISegment, p: IPoint): number{
	const a = segment.p0;
	const b = segment.p1;
	const c = p;
	return (b.x - a.x)*(c.y - a.y) - (b.y - a.y)*(c.x - a.x);
}

function getMiddle(segment: ISegment, adv: number = .5): IPoint
{
	return {
		x: (segment.p0.x - segment.p1.x) * adv + segment.p1.x,
		y: (segment.p0.y - segment.p1.y) * adv + segment.p1.y
	}
}
