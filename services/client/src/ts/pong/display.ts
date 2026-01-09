import { findLanguage, selectLanguage } from "../html/templates.js";
import { BallView, DataFrame, PlayerView } from "./engine/engine_interfaces.js";

export interface IPongDisplay {
  update(data_frame: DataFrame): void;
}

export class PongDisplay implements IPongDisplay {
  canvas: HTMLCanvasElement;
  color: {
    paddle: string | CanvasGradient | CanvasPattern;
    bg: string | CanvasGradient | CanvasPattern;
    ball: string | CanvasGradient | CanvasPattern;
    score: string | CanvasGradient | CanvasPattern;
  };
  scale_factor: number = 10;
  ratio: {
    height: number;
    width: number;
  };
  messages = {
    ended: "Game ended",
    paused: "Game paused",
    waiting: "Press any key to start the game...",
  };

  try_count = 0;

  constructor() {
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;

    this.color = {
      paddle: "blue",
      bg: "black",
      ball: "red",
      score: "green",
    };
    this.initMessages();
  }

  private initMessages() {
    this.messages.waiting = findLanguage("PONG_WAIT_MESSAGE");
    this.messages.paused = findLanguage("PONG_PAUSE_MESSAGE");
    this.messages.ended = findLanguage("PONG_ENDED_MESSAGE");
  }

  private getRatio() {
    return {
      height: 100,
      width:
        (this.canvas.parentElement.clientWidth /
          this.canvas.parentElement.clientHeight) *
        100,
    };
  }

  public update(data_frame: DataFrame) {
    if (!this.canvas)
      this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!this.canvas) 
    {
      return;
    }
    let context = this.canvas.getContext("2d");

    this.ratio = this.getRatio();

    this.canvas.height = this.ratio.height * this.scale_factor;
    this.canvas.width = this.ratio.width * this.scale_factor;
    context.reset();
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    context.scale(this.scale_factor, this.scale_factor);

    context.save();
    context.fillStyle = this.color.bg;
    context.beginPath();
    {
      context.moveTo(this.ratio.width / 2, 0);
      context.lineTo(this.ratio.width / 2, this.ratio.height);
      context.setLineDash([4]);
      context.strokeStyle = "white";
      context.stroke();
    }
    context.closePath();
    context.restore();
    // display scores
    if (data_frame.state !== "waiting")
    {
      this.displayScore(context, data_frame.players[0].score, 25, 40);
      this.displayScore(context, data_frame.players[1].score, 75, 40);
    }
    
    // display players
    data_frame.players.forEach((player) => this.displayPlayer(context, player));

    // display ball
    this.displayBall(context, data_frame.ball);

    if (data_frame.state === "paused")
      displayText(
        context,
        this.messages.paused,
        this.ratio.width / 2,
        this.ratio.height / 2,
        "white"
      );
    else if (data_frame.state === "ended")
      displayText(
        context,
        this.messages.ended,
        this.ratio.width / 2,
        this.ratio.height / 2 + 20,
        "white"
      );
    else if (data_frame.state === "waiting") {
      context.measureText(this.messages.waiting);
      displayText(
        context,
        this.messages.waiting,
        this.ratio.width / 2,
        this.ratio.height / 2 - 10,
        "white",
        10,
        "grey"
      );
    }
  }

  private displayScore(
    context: CanvasRenderingContext2D,
    score: number,
    x: number,
    y: number
  ) {
    displayText(
      context,
      score.toString(),
      (x / 100) * this.ratio.width,
      (y / 100) * this.ratio.height,
      this.color.score
    );
  }

  private displayPlayer(
    context: CanvasRenderingContext2D,
    playerView: PlayerView
  ) {
    displayRect(
      context,
      (playerView.TL.x / 100) * this.ratio.width,
      (playerView.TL.y / 100) * this.ratio.height,
      (playerView.width / 100) * this.ratio.width,
      (playerView.height / 100) * this.ratio.height,
      this.color.paddle
    );
  }

  private displayBall(context: CanvasRenderingContext2D, ballView: BallView) {
    displayRect(
      context,
      (ballView.x / 100) * this.ratio.width,
      (ballView.y / 100) * this.ratio.height,
      (ballView.size / 100) * this.ratio.width,
      (ballView.size / 100) * this.ratio.height,
      this.color.ball
    );
  }
}

function displayRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string | CanvasGradient | CanvasPattern
) {
  context.save();
  context.beginPath();
  {
    context.translate(x, y);
    context.rect(0, 0, w, h);
    context.fillStyle = color;
    context.fill();
  }
  context.closePath();
  context.restore();
}

function displayText(
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  color: string | CanvasGradient | CanvasPattern,
  size: number = 20,
  border: string = undefined
) {
  let message = text.split("\n");
  let globalsize = message.length;

  context.save();
  context.beginPath();
  {
    context.translate(x, y - (globalsize * size) / 2);
    context.textAlign = "center";
    context.font = size + "px monospace";
    context.textBaseline = "middle";
    for (let i = 0; i < message.length; i++) {
      context.translate(0, size);
      if (border) {
        context.strokeStyle = border;
        context.strokeText(message[i], 0, 0);
      }
      context.fillStyle = color;
      context.fillText(message[i], 0, 0);
    }
  }
  context.closePath();
  context.restore();
}
