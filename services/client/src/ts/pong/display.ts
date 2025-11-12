import { DataFrame } from "./data_frame";
export { PongDisplay }


export interface IPongDisplay
{
	update(data_frame: DataFrame): void;
}



class PongDisplay implements IPongDisplay
{
	canvas: HTMLCanvasElement
	color:{
		paddle: string | CanvasGradient | CanvasPattern;
		bg: string | CanvasGradient | CanvasPattern;
		ball: string | CanvasGradient | CanvasPattern;
		score: string | CanvasGradient | CanvasPattern;
	}
	scale_factor: number = 50

	constructor()
	{
		this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
		let ctx = this.canvas.getContext("2d");

		this.color = {
			paddle: "blue",
			bg: "black",
			ball: "red",
			score: "green"
		};
	}

	public update(data_frame: DataFrame)
	{
		let context = this.canvas.getContext("2d");

		this.canvas.width = 100 * this.scale_factor;
		this.canvas.height = 50 * this.scale_factor;
		context.reset();
		context.scale(this.scale_factor, this.scale_factor);

		context.fillStyle = this.color.bg;
		context.fillRect(0, 0, this.canvas.width, this.canvas.height)
		// display score 1
		this.displayText(context, data_frame.score_1.toString(), 25, 25, this.color.score);

		// display score 2
		this.displayText(context, data_frame.score_2.toString(), 75, 25, this.color.score);

		// display ball
		this.displayRect(context, data_frame.ball.x, data_frame.ball.y, 5, 5, this.color.ball);

		// display player 1
		this.displayRect(context, 5, data_frame.player_1, 2, 10, this.color.paddle);

		// display player 2
		this.displayRect(context, 95, data_frame.player_2, 2, 10, this.color.paddle);

	}

	private displayRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string | CanvasGradient | CanvasPattern)
	{
		context.save();
		context.translate(x, y);
		context.beginPath();
		context.rect(-w/2, -h/2, w, h);
		context.closePath();
		context.fillStyle = color;
		context.fill()
		context.restore();
	}

	private displayText(context: CanvasRenderingContext2D, text: string, x: number, y: number, color: string | CanvasGradient | CanvasPattern)
	{
		context.save();
		context.translate(x, y);
		context.fillStyle = color;
		context.textAlign = "center";
		context.font = "monospace";
		context.textBaseline = "middle";
		context.fillText(text, 0, 0);
		context.restore();
	}
}