import { FastifyInstance } from "fastify";
import { WebSocket, WebsocketHandler } from "@fastify/websocket";
import Database from "better-sqlite3";

import { Id, WSmessage, TypeMessage } from "../common/types";
import db from "../common/database";
import { fastify } from "./main";
import { invite_message } from "./chat_invite";

/**
 * Class client
 * @param socket 'Websocket of client'
 * @param username username of client (null if is not connected)
 * @param id id of client (null if is not connected)
 */
class WSClient {
  sockets: WebSocket[];
  username: string;

  constructor(_socket: WebSocket, username: string) {
    this.sockets = [_socket];
    this.username = username;
  }

  send(data: string): void {
    this.sockets.forEach((sock) => sock.send(data));
  }

  removeSocket(ws: WebSocket): void {
    this.sockets.splice(this.sockets.indexOf(ws), 1);
  }
}

export const connectedClients: Map<Id, WSClient> = new Map();

const waitingConnections: WebSocket[] = [];

const socketToId: Map<WebSocket, Id> = new Map();

/**
 * List of target messages
 * @interface WSmessage
 */
const listOfMsg = new Array<WSmessage>();

/**
 * map of timout of directMessage
 */
const directMsgTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * query for database call
 * @param getUserById find in the database the user with this id
 * @param getUserByUsername find in the database the user with this username
 * @param getBlockedUserById find in the database users blocked by the client with this id
 */
let dbQuery: {
  getUserById: Database.Statement<
    [
      {
        userId: Id;
      }
    ],
    {
      username: string;
    }
  >;
  getUserIdByUsername: Database.Statement<
    [
      {
        _username: string;
      }
    ],
    {
      id: Id;
    }
  >;
  getBlockedUserById: Database.Statement<
    [
      {
        userId: Id;
      }
    ],
    {
      blocker_id: number;
    }
  >;
};

//UTILS FUNCTIONS ========================================================================================================
/**
 * send to everyone
 * @param senderId Id of sender
 * @param msg message to send
 */
function sendAll(senderId: Id, msg: WSmessage) {
  // get all blocked clients from the sender
  const dbBlockedBy = dbQuery.getBlockedUserById.all({
    userId: senderId,
  });
  const blockedBy = new Set<Id>(dbBlockedBy.map((o) => o.blocker_id));
  const data = JSON.stringify(msg);

  connectedClients.forEach((client, id) => {
    if (senderId === id) {
      msg.type = TypeMessage.yourMessage;
      client.send(JSON.stringify(msg));
    } else if (!blockedBy.has(id)) {
      client.send(data);
    }
  });
  waitingConnections.forEach((sock) => sock.send(data));
}

/**
 * disconnect a client
 * @param socket Websocket of client
 */
function disconnectedClient(socket: WebSocket) {
  const sender = getClientById(socketToId.get(socket)!);
  if (sender) {
    sender.client.removeSocket(socket);

    if (sender.client.sockets.length == 0) {
      connectedClients.delete(sender.id);
    }
    waitingConnections.push(socket);
  }
}
/**
 * Generate a random id
 */
function GenerateRandomId(): string {
  return Date.now().toString() + Math.random().toString(36).slice(2, 8);
}

/**
 * find if a client is on the connected list with this id
 * @param id the client id
 */
function getClientById(id: Id) {
  // check if the sender is on the list
  return connectedClients.get(id)
    ? { id, client: connectedClients.get(id)! }
    : null;
}

/**
 * find if a client is on the connected list with this username
 * @param username the client username
 */
function getClientByUsername(
  username: string
): { id: Id; client: WSClient } | null {
  // check if the sender is on the list
  const pair = Array.from(connectedClients.entries()).find(
    ([ws, client]) => client.username.toLowerCase() == username.toLowerCase()
  );
  return pair ? { id: pair[0], client: pair[1] } : null;
}

/**
 * store the message and call the target if is connected
 * @param Sender sender to call if the target don't respond
 * @param message message to store waiting for a respond
 */
function setTimeoutDirectMsg(Sender: WSClient, message: WSmessage): void {
  const timeout = setTimeout(() => {
    const msgIndex = listOfMsg.indexOf(message);
    if (msgIndex !== -1) {
      listOfMsg.slice(msgIndex, 1);
      const data = JSON.stringify({
        user: "server",
        type: TypeMessage.serverMessage,
        content: `${message.target} not responded`,
        msgId: GenerateRandomId(),
      });
      Sender.sockets.forEach((ws) => {
        ws.send(data);
      });
    }
    directMsgTimers.delete(message.msgId!);
  }, 5000);
  directMsgTimers.set(message.msgId!, timeout);
}

//MAIN FUNCTIONS =========================================================================================================

/**
 * Send direct message after receive the check from the target
 * @param message message from the target
 * @param TargetSocket Websocket from the target
 */
export function DirectMessage(TargetRespondMsg: WSmessage) {
  for (let msg of listOfMsg) {
    if (TargetRespondMsg.msgId !== msg.msgId) {
      continue;
    }
    //clear message timout
    const msgId = msg.msgId;
    if (msgId && directMsgTimers.has(msgId)) {
      clearTimeout(directMsgTimers.get(msgId));
      directMsgTimers.delete(msgId);
    }

    const target = getClientByUsername(TargetRespondMsg.user);
    const sender = getClientByUsername(msg.user);
    if (!target || !sender) {
      listOfMsg.splice(listOfMsg.indexOf(msg), 1);
      return;
    }

    // get all blocked clients from the target
    const target_blocked_list = dbQuery.getBlockedUserById.all({
      userId: target.id,
    });
    const targetBlocked = new Set<Id | null>(
      target_blocked_list.map((row) => row.blocker_id)
    );
    // send to the target if the sender is not blocked
    if (!targetBlocked.has(sender.id)) {
      target.client.send(JSON.stringify(msg));
    }
    //send to the sender
    msg.type = TypeMessage.yourDirectMessage;
    sender.client.send(JSON.stringify(msg));
    listOfMsg.splice(listOfMsg.indexOf(msg), 1);
    return;
  }
}

/**
 * send a call to the target and set timout for respond
 * @param msg message of sender
 * @param senderClient Class client of sender
 */
function GetReadyDirectMessage(
  msg: WSmessage,
  senderClient: WSClient,
  senderWS: WebSocket
) {
  // check if the client exist in the database
  const row = dbQuery.getUserIdByUsername.get({ _username: msg.target! });
  if (!row) {
    return senderWS.send(
      JSON.stringify({
        user: "server",
        type: TypeMessage.serverMessage,
        content: `${msg.target} doesn't exist`,
        msgId: GenerateRandomId(),
      })
    );
  }
  // check if the client is connected
  const target = getClientByUsername(msg.target!);
  if (!target) {
    return senderWS.send(
      JSON.stringify({
        user: "server",
        type: TypeMessage.serverMessage,
        content: `${msg.target} is not connected`,
        msgId: GenerateRandomId(),
      })
    );
  }
  // don't send a direct message to yourself please
  if (target.client.username === senderClient.username) {
    return senderWS.send(
      JSON.stringify({
        user: "server",
        type: TypeMessage.serverMessage,
        content: `${msg.target} is you`,
        msgId: GenerateRandomId(),
      })
    );
  }

  const newDirectMsg = {
    user: senderClient.username!,
    type: TypeMessage.directMessage,
    target: target.client.username,
    content: msg.content,
    msgId: GenerateRandomId(),
  };

  // store and set the timeout;
  listOfMsg.push(newDirectMsg);
  setTimeoutDirectMsg(senderClient, newDirectMsg);

  const newGetReadyMsg = {
    user: senderClient.username,
    type: TypeMessage.readyForDirectMessage,
    msgId: newDirectMsg.msgId,
  };

  //send a call to the target
  target.client.sockets.forEach((ws) => {
    ws.send(JSON.stringify(newGetReadyMsg));
  });
}

/**
 * process incoming message from the client
 * @param msg Message of the Sender
 * @param connection Websocket of the Sender
 */
function Message(msg: WSmessage, SenderSocket: WebSocket) {
  let sender_id: Id | undefined;
  // get id of the sender
  try {
    sender_id = (fastify.jwt.decode(msg.user) as { id: Id }).id;
  } catch (err) {
    return SenderSocket.send(
      JSON.stringify({
        user: "server",
        type: TypeMessage.serverMessage,
        content: "You are not connected",
      })
    );
  }

  const sender = getClientById(sender_id);
  if (!sender) {
    return SenderSocket.send(
      JSON.stringify({
        user: "server",
        type: TypeMessage.serverMessage,
        content: "You are not connected",
      })
    );
  }

  if (msg.content && msg.content?.length > 280) {
    return SenderSocket.send(
      JSON.stringify({
        user: "server",
        type: TypeMessage.serverMessage,
        content: "message size is fixed at 280 characters",
        msgId: GenerateRandomId(),
      })
    );
  }

  if (msg.type === TypeMessage.readyForDirectMessage) {
    msg.user = sender.client.username;
    DirectMessage(msg);
    return;
  }

  if (msg.target !== undefined) {
    GetReadyDirectMessage(msg, sender.client, SenderSocket);
    return;
  }
  const newMsg: WSmessage = {
    user: sender.client.username!,
    type: TypeMessage.message,
    content: msg.content,
    msgId: GenerateRandomId(),
  };

  sendAll(sender.id, newMsg);
}

/**
 * Ping user
 * @param connection the connection websocket to ping
 */
function PingUser(connection: any): void {
  const response: WSmessage = {
    user: "server",
    type: TypeMessage.pong,
    msgId: GenerateRandomId(),
  };
  connection.send(JSON.stringify(response));
}

/**
 * Change the status of the connection (username, id)
 * @param msg message from sender
 * @param socket Websocket from sender
 */
function connectUser(msg: WSmessage, socket: WebSocket): void {
  let senderId: { id: number } | null;

  // decode token of sender
  try {
    senderId = fastify.jwt.decode(msg.user);
  } catch {
    if (socketToId.get(socket)) {
      disconnectedClient(socket);
    }
    return;
  }

  if (!senderId) {
    socket.send(
      JSON.stringify({
        user: "server",
        type: TypeMessage.serverMessage,
        content: "connection failed",
      })
    );
    return;
  }

  const user = dbQuery.getUserById.get({ userId: senderId.id });
  if (!user) {
    socket.send(
      JSON.stringify({
        user: "server",
        type: TypeMessage.serverMessage,
        content: "invalid user",
      })
    );
    return;
  }

  socketToId.set(socket, senderId.id);
  waitingConnections.splice(waitingConnections.indexOf(socket), 1);
  socket.onclose = () => {
    const client = connectedClients.get(senderId.id);
    if (client === undefined) return;
    client.sockets.splice(client.sockets.indexOf(socket), 1);
  };

  if (connectedClients.get(senderId.id)) {
    connectedClients.get(senderId.id)!.sockets.push(socket);
    return;
  }
  connectedClients.set(senderId.id, new WSClient(socket, user.username));
}

// "main" live chat
export default async function apiChat(fastify: FastifyInstance) {
  dbQuery = {
    getUserById: db.prepare<{ userId: Id }, { username: string }>(
      "SELECT username FROM users WHERE id = :userId"
    ),
    getUserIdByUsername: db.prepare<{ _username: string }, { id: Id }>(
      "SELECT id FROM users WHERE lower(username) = lower(:_username)"
    ),
    getBlockedUserById: db.prepare<{ userId: Id }, { blocker_id: number }>(
      "SELECT blocker_id FROM user_blocks WHERE blocked_id = :userId"
    ),
  };
  // add client from connected clients
  fastify.websocketServer.on("connection", (ws: WebSocket) => {
    waitingConnections.push(ws);
  });

  fastify.get("/chat", { websocket: true }, (connection: WebSocket) => {
    connection.on("close", (client: WebSocket) => {
      waitingConnections.splice(waitingConnections.indexOf(client), 1);
    });

    connection.addEventListener("message", invite_message);
    connection.on("message", (event) => {
      try {
        const msg: WSmessage = JSON.parse(event.toString());
        if (
          msg.type === TypeMessage.message ||
          msg.type === TypeMessage.readyForDirectMessage
        )
          Message(msg, connection);
        if (msg.type === TypeMessage.ping) PingUser(connection);
        if (msg.type === TypeMessage.connection) connectUser(msg, connection);
      } catch (err) {
        console.error("Error : ", err);
      }
    });
  });
}
