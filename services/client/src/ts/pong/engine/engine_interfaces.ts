/**
 * for a player, what is needed to be displayed
 */
export interface PlayerView {
  name: string | [string, ...string[]];
  score: number;
  TL: { x: number; y: number };
  width: number;
  height: number;
  direction: "E" | "W";
}

/**
 * the handler of the input of the PLayerEntity.
 *
 * To know what does what, refer to the JSDoc of each property
 */
export interface keyControl {
  /**
   * to display to the player their controls,
   * If either up.key or down.key are undefined, it will be a bot.
   * To disable a paddle, set the code to a non-key value, like "" or "disabled"
   */
  key?: string;
  /**
   * to keep in memory the physical key, meaning ù and % are the same on azerty
   * When code is undefined, it will use the key.toLowerCase() to know what the key is.
   * So please set a default key to be the same when shift or all caps is pressed
   */
  code?: string;
  /**
   * to know if the paddle will move at next tick
   * When keyControl.pressed is undefined, will act as false
   */
  pressed?: boolean;
}

/**
 * all the infos needed about a player for the game
 */
export interface PlayerEntity {
  view: PlayerView;
  up: keyControl;
  down: keyControl;
  bot_difficulty: number;
  speed: number;
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
  last?: PlayerEntity;
  speed: { x: number; y: number };
}

export interface DataFrame {
  ball: BallView;
  players: PlayerView[];
  state: "ended" | "playing" | "paused" | "waiting";
}

export type point = { x: number; y: number };

export interface GameParty {
  intervalId?: ReturnType<typeof setInterval>;
  ball: BallEntity;
  players: PlayerEntity[];
  views: DataFrame;
  max_score: number;
  botIntervalId?: ReturnType<typeof setInterval>;
}
