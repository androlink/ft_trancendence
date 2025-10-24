import {bsp, getMiddle, IPoint, ISegment, getNormal} from "./segment.js"

export {draw, drawSegment, Drawable}

interface Drawable
{
	draw(ctx: CanvasRenderingContext2D);
}

function draw(ctx: CanvasRenderingContext2D, segments: ISegment[])
{
	for (const s of segments) {
		drawSegment(ctx, s, "#000000", true)
	}
}

function drawSegment(ctx: CanvasRenderingContext2D, segment: ISegment, color: string | CanvasGradient | CanvasPattern = "#000000", draw_normal = false)
{
	ctx.beginPath();
	ctx.moveTo(segment.segment[0].x, segment.segment[0].y);
	ctx.lineTo(segment.segment[1].x, segment.segment[1].y);
	ctx.closePath();
	ctx.strokeStyle = color;
	ctx.stroke();
	if (draw_normal)
	{
		let middle = getMiddle(segment);
		let angle = getNormal(segment);
		drawSegment(ctx, {segment: [middle, {x: middle.x + Math.cos(angle) * 5, y: middle.y  + Math.sin(angle) * 5}]}, "#FF0000");
	}
}