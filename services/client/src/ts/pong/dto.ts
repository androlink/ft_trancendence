
import { IPoint, ISegment } from "./segment";

import { PongGameManager, PongBoard, PongBall} from "./core";
import { resetReconnectTimer } from "../utils";

interface DTO{
	toObject();
	toJSON();
}

export class PongBallDTO implements DTO
{
	start: IPoint;
	speed: number;
	size: number;
	speedIncrement: number;

	constructor({start, speed, size, speedIncrement})
	{
		this.start = start;
		this.speed = speed;
		this.size = size;
		this.speedIncrement = speedIncrement;
	}

	public toObject()
	{
		return {
			start: this.start,
			speed: this.speed,
			size: this.size,
			speedIncrement: this.speedIncrement
		}
	}

	public toJSON()
	{
		return JSON.stringify(this.toObject());
	}
}

export class PongBoardDTO implements DTO
{
	segments: ISegment[];
	constructor({segments})
	{
		this.segments = (segments as Array<ISegment>).map((t) => {
			return {p0: {x:t.p0.x, y:t.p0.y}, p1: {x:t.p1.x, y:t.p1.y}}
		});
	}

	public toObject()
	{
		return {
			segments: this.segments
		}
	}

	public toJSON()
	{
		return JSON.stringify(this.toObject());
	}
}

export class PongTeamDTO implements DTO
{
	player: PongBoardDTO;
	paddle;
	base;
	constructor({player, paddle, base})
	{
	}

	public toObject()
	{
		return {};
	}

	public toJSON()
	{
		return JSON.stringify(this.toObject());
	}
}

export class PongGameManagerDTO implements DTO
{
	balls: PongBallDTO[];
	seed: number;
	board: PongBoardDTO;
	teams: PongTeamDTO[];

	constructor(json: string)
	{
		console.debug("before:", json);
		let data = JSON.parse(json, (k, v) => {
			console.debug(k,":", v);
			return v});
		this.balls = data.balls.map(balldata => new PongBallDTO(balldata));
		this.seed = data.seed;
		this.board = new PongBoardDTO(data.board);
		this.teams = data.teams?.map(team => {new PongTeamDTO(team)});
		console.debug("after:", data);
	}

	public toObject()
	{
		return {
			balls: this.balls.map(ball => {return ball.toObject()}),
			seed: this.seed,
			board: this.board,
			teams: this.teams.map(team => {return team.toObject()})
		}
	}

	public toJSON()
	{
		return JSON.stringify(this.toObject());
	}
}
