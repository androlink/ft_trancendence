import fastify from "./server";
import { FastifyInstance } from "fastify";
import { WebSocket } from "@fastify/websocket";
import db from "./database";
import { Id } from "./types";

enum TypeMessage {
  message = "message",
  yourMessage = "yourMessage",
  directMessage = "directMessage",
  yourDirectMessage = "yourDirectMessage",
  readyForDirectMessage = "readyForDirectMessage",
  serverMessage= "serverMessage",
  connection = "connection",
  ping = "ping",
  pong = "pong"
}

/**
 * Interface Message
 * @param type Type of message send (message, ping, etc..).
 * @param user User who send the message.
 * @param origin Origin sender user
 * @param target where the message is send (everyone by default) [optional]
 * @param content Content of the message if is necessary [optional]
 * @param msgId Id of the message (for direct message) [optional]
 */
interface WSmessage {
  type: TypeMessage,
  user: string,
  target?: string | null,
  content?: string | null,
  msgId: string | null
};

/**
 * Class client
 * @param _socket 'Websocket of client'
 * @param _username username of client (null if is not connected)
 * @param _id id of client (null if is not connected)
 */
class WSClient{
  _socket: WebSocket;
  _username: string | null;
  _id: Id | null;

  constructor(client: any, username: any, id: any)
  {
    this._socket = client;
    this._username = username;
    this._id = id;
  }

  set setId(id: any)
  {
    this._id = id;
  }

  set setUsername(username: any)
  {
    this._username = username;
  }
}

/**
 * List of Clients
 * @class WSClient
 */
const connectedClients = new Map<WebSocket, WSClient>();

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
const dbQuery = {
  getUserById: db.prepare<{userId:Id}, {username:string}>("SELECT username FROM users WHERE id = :userId"),
  getUserByUsername: db.prepare<{_username :string| null | undefined}, {username:string}>("SELECT username FROM users WHERE username = :_username"),
  getBlockedUserById: db.prepare<{userId: Id | null}, {blocker_id:number}>("SELECT blocker_id FROM user_blocks WHERE blocked_id = :userId")
};

//UTILS FUNCTIONS ========================================================================================================

/**
 * Generate a random id
 */
function GenerateRandomId(): string{
  return Date.now().toString() + Math.random().toString(36).slice(2,8);
}

/**
 * find if a client is on the connected list with this id
 * @param id the client id
 */
function getClientById(id: Id): WSClient | null {
 // check if the sender is on the list
  const pair = Array
    .from(connectedClients.entries())
    .find(([ws, client]) => client._id == id);
  return pair ? pair[1] : null;
}

/**
 * find if a client is on the connected list with this username
 * @param username the client username
 */
function getClientByUsername(username: string | null | undefined): WSClient | null {

  if (username === null || username === undefined)
		return null;
  // check if the sender is on the list
  const pair = Array
    .from(connectedClients.entries())
    .find(([ws, client]) => client._username == username);
  return pair ? pair[1] : null;
}

/**
 * store the message and call the target if is connected
 * @param Sender sender to call if the target don't respond 
 * @param message message to store waiting for a respond
 */
function setTimeoutDirectMsg(Sender: WSClient, message: WSmessage) : void
{
  const timeout = setTimeout(() => {
    console.log("timeout!");
    try {
      const msgIndex = listOfMsg.indexOf(message);
      if (msgIndex !== -1) {
        listOfMsg.slice(msgIndex, 1);
        Sender._socket.send(JSON.stringify({
          user: 'server',
          type: TypeMessage.serverMessage,
          content: `${message.target} not responded`,
          msgId: GenerateRandomId()
        }));
      }
    }
    catch (err) {
      console.error(err);
    } finally {
      directMsgTimers.delete(message.msgId!);
    }
  }, 5000);
  console.log("setting timeout " + timeout);
  directMsgTimers.set(message.msgId!, timeout);
}

/**
 * send all same client connected to several place
 * @param msg message to send
 * @param username username of the client
 */
function sendAllInstancesOfClient(msg:WSmessage, username: string): void{
  for (let [ws, cl] of connectedClients){
    if (cl._username === username)
      cl._socket.send(JSON.stringify(msg));
  }
}

//MAIN FUNCTIONS =========================================================================================================

/**
 * Send direct message after receive the check from the target
 * @param message message from the target
 * @param TargetSocket Websocket from the target
 */
function DirectMessage( TargetRespondMsg:WSmessage , TargetSocket: any){
  for (let msg of listOfMsg)
  {
    if (TargetRespondMsg.msgId !== msg.msgId) {
      continue;
    }
    //clear message timout
    const msgId = msg.msgId;
    if (msgId && directMsgTimers.has(msgId)) {
      clearTimeout(directMsgTimers.get(msgId));
      directMsgTimers.delete(msgId);
    }
    
    const targetClient = getClientByUsername(TargetRespondMsg.user);
    const Sender = getClientByUsername(msg.user);
    if (!targetClient || !Sender) {
      listOfMsg.splice(listOfMsg.indexOf(msg), 1);
      return;
    }

    // get all blocked clients from the target
    const target_blocked_list = dbQuery.getBlockedUserById.all({userId: targetClient._id});
    const targetBlocked = new Set<Id | null>(target_blocked_list.map((row: any) => row.blocker_id)); 
    // send to the target if the sender is not blocked
    if (!targetBlocked.has(Sender._id)) {
      sendAllInstancesOfClient(msg, targetClient._username!);
    }
    //send to the sender
    msg.type = TypeMessage.yourDirectMessage;
    sendAllInstancesOfClient(msg, Sender._username!);
    listOfMsg.splice(listOfMsg.indexOf(msg), 1);
    return;
  }
}

/**
 * send a call to the target and set timout for respond
 * @param msg message of sender
 * @param senderClient Class client of sender
 */
function GetReadyDirectMessage(msg: WSmessage, senderClient: WSClient){
  // check if the client exist in the database
  const row = dbQuery.getUserByUsername.get({_username : msg.target});
  if (!row){
    return senderClient._socket.send(JSON.stringify({
      user: 'server',
      type: TypeMessage.serverMessage,
      content: `${msg.target} doesn't exist`,
      msgId: GenerateRandomId()
    }));
  }
  // check if the client is connected
  const targetClient = getClientByUsername(msg.target)
  if (!targetClient){
    return senderClient._socket.send(JSON.stringify({
      user: 'server',
      type: TypeMessage.serverMessage,
      content: `${msg.target} is not connected`,
      msgId: GenerateRandomId()
    }));
  }
  // don't send a direct message to yourself please
  if (targetClient._username === senderClient._username) {
    return senderClient._socket.send(JSON.stringify({
      user: 'server',
      type: TypeMessage.serverMessage,
      content: `${msg.target} is you`,
      msgId: GenerateRandomId()
    }));
  }

  const newDirectMsg = {
    user: senderClient._username!,
    type: TypeMessage.directMessage,
    target: targetClient._username,
    content: msg.content,
    msgId: GenerateRandomId()
  };

  // store and set the timeout;
  listOfMsg.push(newDirectMsg);
  setTimeoutDirectMsg(senderClient, newDirectMsg);

  const newGetReadyMsg = {
    user: senderClient._username,
    type: TypeMessage.readyForDirectMessage,
    msgId: newDirectMsg.msgId
  };

  //send a call to the target
  targetClient._socket.send(JSON.stringify(newGetReadyMsg));
  console.log("[sending]", newGetReadyMsg)
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
    sender_id = (fastify.jwt.decode(msg.user) as {id: Id}).id;
  }
  catch (err) {
    return SenderSocket.send(JSON.stringify({
      user: 'server',
      type: TypeMessage.serverMessage,
      content: "You are not connected",
    }));
  }

  const senderClient: WSClient | null = getClientById(sender_id);
  if (!senderClient) {
    return SenderSocket.send(JSON.stringify({
      user: 'server',
      type: TypeMessage.serverMessage,
      content: "You are not connected",
    }));
  }

  if (msg.type === TypeMessage.readyForDirectMessage) {
    msg.user = senderClient._username!;
    DirectMessage(msg, SenderSocket);
    return;
  }
  if (!msg.content) {
    console.error("error : no message content");
    return;
  }
  // get all blocked clients from the sender
  const sender_blocked_list = dbQuery.getBlockedUserById.all({userId: senderClient._id});
  const senderBlocked = new Set<Id | null>(sender_blocked_list.map((row: any) => row.blocker_id));
  
  const newMsg = { user: senderClient._username!, type: TypeMessage.message, content: msg.content};

  if (msg.target !== undefined && msg.target !== "all") {
    GetReadyDirectMessage(msg, senderClient);
    return;
  }
  connectedClients.forEach((cl:WSClient) => {
    if (senderClient._id === cl._id) {
      newMsg.type = TypeMessage.yourMessage;
      cl._socket.send(JSON.stringify(newMsg));
    }
    else if (senderBlocked && !senderBlocked.has(cl._id)) {
      newMsg.type = TypeMessage.message;
      cl._socket.send(JSON.stringify(newMsg));
    }
  });
}

/**
 * Ping user
 * @param connection the connection websocket to ping
 */
function PingUser(connection: any): void
{
  const response: WSmessage = {
    user:"server",
    type:TypeMessage.pong,
    msgId: null
  };
  connection.send(JSON.stringify(response))
}

/**
 * Change the status of the connection (username, id)
 * @param msg message from sender
 * @param socket Websocket from sender
 */
function ConnectionStatusUser(msg: WSmessage, socket: any): void {
  let sender: { id: number } | null;
  // check the wich client is with the websocket
  const client = connectedClients.get(socket as WebSocket);
  if (!client){
    console.log("client doesn't exist");
    return;
  }
  try {
    //update id
    sender = fastify.jwt.decode(msg.user);
    if (!sender)
      throw new Error("Invalid JsonWebToken");
    client._id = sender.id;
  }
  catch {
    client._id = null;
    client._username = null;
    return;
  }
  const row = dbQuery.getUserById.get({userId: sender.id});
  if (!row) {
    client._id = null;
    client._username = null;
    return ;
  }
  client._username = row.username;
}

// "main" live chat
export default function liveChat(fastify: FastifyInstance){

  // add client from connected clients
  fastify.websocketServer.on("connection", (ws: WebSocket) => {
    const testClient = connectedClients.get(ws);
    if (!testClient)
    {
      const newClient = new WSClient(ws, null, null);
      connectedClients.set(ws, newClient);
    }
  });

  fastify.get('/api/chat', { websocket: true }, (connection: WebSocket) => {
    connection.on("close", (client: WebSocket) => {
      const deleteClient = connectedClients.get(connection);
      if (deleteClient) {
        connectedClients.delete(connection);
      }
    }); 
    connection.on("message", (event) => {
      try {
        const msg: WSmessage = JSON.parse(event.toString());
        if (msg.type === TypeMessage.message || msg.type === TypeMessage.readyForDirectMessage)
          Message(msg, connection);
        if (msg.type === TypeMessage.ping)
          PingUser(connection);
        if (msg.type === TypeMessage.connection)
          ConnectionStatusUser(msg, connection);
      } catch (err) {
        console.error("Error : ", err);
      }
    });
  });
}