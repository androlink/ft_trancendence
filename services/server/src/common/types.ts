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
export interface WSmessage {
  type: TypeMessage;
  user: string;
  target?: string;
  content?: string;
  msgId: string;
}
