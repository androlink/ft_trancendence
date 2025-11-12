
/**
 * for a player, what is needed to be displayed
 */
export interface PlayerView {
  score: number;
  TL: {x: number, y: number};
  width: number;
  height: number;
  direction: 'E' | 'W';
}

/**
 * correspond to a key.
 * key -> to display to the player their controls
 * code -> to know the exact touch, meaning ù and % are the same on azerty 
 * pressed -> says if currently pressed
 */
export interface keyControl {
  key: string;
  code?: string;
  pressed: boolean;
}

/**
 * all the infos needed about a player for the game
 */
export interface PlayerEntity {
  view: PlayerView;
  up: keyControl;
  down: keyControl;
  speed: number;
}

/**
 * for a ball, what is needed to be displayed
 */
export interface BallView {
  x: number;
  y: number;
  radius: number;
}

/**
 * all the infos needed about a ball for the game
 */
export interface BallEntity {
  view: BallView;
  last?: PlayerEntity;
  speed: {x: number, y: number};
}

export interface DataFrame
{
	ball: BallView,
	player_1: PlayerView,
	player_2: PlayerView
}
