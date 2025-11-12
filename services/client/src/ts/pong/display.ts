import { BallView, DataFrame, PlayerView } from "./engine/engine_interfaces.js";

export interface IPongDisplay
{
	update(data_frame: DataFrame): void;
}

export class PongDisplay implements IPongDisplay
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

		this.color = {
			paddle: "blue",
			bg: "black",
			ball: "red",
			score: "green"
		};
	}

	public update(data_frame: DataFrame)
	{
		if (this.canvas == null)
			this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
		let context = this.canvas.getContext("2d");

		this.canvas.width = 100 * this.scale_factor;
		this.canvas.height = 100 * this.scale_factor;
		context.reset();
		context.scale(this.scale_factor, this.scale_factor);

		context.fillStyle = this.color.bg;
		context.fillRect(0, 0, this.canvas.width, this.canvas.height)

		this.displayScore(context, data_frame.player_1.score, 25, 25);
		this.displayScore(context, data_frame.player_2.score, 75, 25);

		// display ball
		this.displayBall(context, data_frame.ball);

		// display player 1
		this.displayPlayer(context, data_frame.player_1);

		// display player 2
		this.displayPlayer(context, data_frame.player_2);

	}

	private displayScore(context: CanvasRenderingContext2D, score: number, x: number, y: number)
	{
		displayText(context, score.toString(), x, y, this.color.score);
	}

	private displayPlayer(context: CanvasRenderingContext2D, playerView: PlayerView)
	{
		displayRect(context, playerView.TL.x, playerView.TL.y, playerView.width, playerView.height, this.color.paddle);
	}

	private displayBall(context: CanvasRenderingContext2D, ballView: BallView)
	{
		displayRect(context, ballView.x, ballView.y, ballView.radius, ballView.radius, this.color.ball);
	}

}

function displayRect(context: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string | CanvasGradient | CanvasPattern)
{
	context.save();
	context.translate(x, y);
	context.beginPath();
	context.rect(0, 0, w, h);
	context.closePath();
	context.fillStyle = color;
	context.fill()
	context.restore();
}

function displayText(context: CanvasRenderingContext2D, text: string, x: number, y: number, color: string | CanvasGradient | CanvasPattern)
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