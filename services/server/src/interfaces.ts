export interface UserRow {
  id?: number;
  username?: string;
  admin?: number;
  password?: string;
  bio?: string;
  pfp?: string;
  wins?: number;
  loses?: number;
};

export interface GameRow {
  winner?: string;
  loser?: string;
  time?: string;
};

export interface JwtUserPayload {
  id: number | bigint;
  username?: string;
  admin?: number;
  password?: string;
  bio?: string;
  pfp?: string;
}