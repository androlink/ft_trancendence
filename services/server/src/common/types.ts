export type LanguageObject = [string, ...(string | LanguageObject)[]] | string;

export type Id = number | bigint;

export interface JwtUserPayload {
  id: Id;
  username?: string;
  admin?: number;
  password?: string;
  bio?: string;
  pfp?: string;
}

export type UserRow = {
  id: Id;
  username: string;
  admin: number;
  password: string;
  bio: string;
  pfp: string;
};

export enum TypeMessage {
  message = "message",
  yourMessage = "yourMessage",
  directMessage = "directMessage",
  yourDirectMessage = "yourDirectMessage",
  readyForDirectMessage = "readyForDirectMessage",
  serverMessage = "serverMessage",
  connection = "connection",
  invite = "invite",
  replyInvite = "replyInvite",
  ping = "ping",
  pong = "pong",
}

/**
 * Interface Message
 * @param type Type of message send (message, ping, etc..).
 * @param user User who send the message.
 * @param target where the message is send (everyone by default) [optional]
 * @param content Content of the message if is necessary [optional]
 * @param msgId Id of the message (for direct message)
 */
export type WSmessage =
  | {
      type: TypeMessage;
      user: string;
      target?: string;
      content?: string;
      msgId: string;
    }
  | {
      type: TypeMessage.replyInvite;
      status: true;
      room_id: string;
      sender: string;
      target: string;
    }
  | {
      type: TypeMessage.replyInvite;
      status: false;
      reason: string;
    };

export type InternalCreateRequestBody = {
  player1: Id;
  player2: Id;
};
export type InternalCreateResponse =
  | { status: false; reason: string }
  | { status: true; room_id: string; player1: string; player2: string };

export enum RemotePongReasonCode {
  NOT_CONNECTED = "R_NOT_CONNECTED",
  USER_NOT_FOUND = "USER_NOT_FOUND",
  GAME_NOT_FOUND = "GAME_NOT_FOUND",
  CANNOT_JOIN_GAME = "CANNOT_JOIN_GAME",
  GAME_ALREADY_STARTED = "GAME_ALREADY_STARTED",
  CANNOT_PLAY_WITH_YOURSELF = "CANNOT_PLAY_WITH_YOURSELF",
  INVALID_REQUEST = "INVALID_REQUEST",
  INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}
