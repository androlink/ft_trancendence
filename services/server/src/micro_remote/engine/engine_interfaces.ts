
import WebSocket from "ws";
import {Id} from "../../types"

/**
 * for a player, what is needed to be displayed
 */
export interface PlayerView {
  name: string | [string, ...string[]];
  score: number;
  TL: {x: number, y: number};
  width: number;
  height: number;
  direction: 'E' | 'W';
}

/**
 * all the infos needed about a player for the game
 */
export interface PlayerEntity {
  view: PlayerView;
  up: boolean;
  down: boolean;
  speed: number;
  ready: "WAIT" | "HERE" | "GONE";
  ws?: WebSocket;
}

/**
 * for a ball, what is needed to be displayed
 */
export interface BallView {
  x: number;
  y: number;
  size: number;
}

/**
 * all the infos needed about a ball for the game
 */
export interface BallEntity {
  view: BallView;
  last: PlayerEntity;
  speed: {x: number, y: number};
}

export interface DataFrame
{
	ball: BallView,
	players: PlayerView[],
  state: 'ended' | 'playing' | 'paused' | 'waiting',
}

export type point = {x: number, y: number};

export interface GameParty
{
  id: string;
  intervalId?: ReturnType<typeof setInterval>
  ball: BallEntity,
  players_id: Id[],
  players: PlayerEntity[],
  views: DataFrame,
  max_score: number,
}

export type RequestType = "JOIN" | "PING" | "GAME";

export interface IMessage
{
  type: RequestType;
  message?: any;
  token?: string;
  input?: "pressUp" | "releaseUp" | "pressDown" | "releaseDown"
}

export class GameWebsocket extends WebSocket
{
  id: Id;
  oninput?: (event: WebSocket.MessageEvent,message: IMessage) => void;
};
