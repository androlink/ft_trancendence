import {bsp, getMiddle, IPoint, ISegment, getNormal} from "./segment.js"

export {draw}

function draw(ctx: CanvasRenderingContext2D, segments: ISegment[])
{
	for (const s of segments) {
		drawSegment(ctx, s, "#000000")
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