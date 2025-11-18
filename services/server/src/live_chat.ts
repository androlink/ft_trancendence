import fastify from "./server";
import { FastifyInstance } from "fastify";
import db from "./database";
import { typeErrorMessage } from "ajv/dist/vocabularies/jtd/error";

enum TypeMessage {
  message = "message",
  yourMessage = "yourMessage",
  friendMessage = "friendMessage",
  directMessage = "directMessage",
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
  _socket: any;
  _username: string | null;
  _id: number | null;

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
const listOfMsg = new Set<WSmessage>();


const directMsgTimers = new Map<string, ReturnType<typeof setTimeout>>();

//UTILS FUNCTIONS ========================================================================================================

function GenerateRandomId(): string{
    return Date.now().toString() + Math.random().toString(36).slice(2,8)
}

function getClientById(id: number): WSClient | null {
 // check if the sender is on the list
  const pair = Array
    .from(connectedClients.entries())
    .find(([ws, client]) => client._id == id);
  return pair ? pair[1] : null;
}

function getClientByUsername(username: string): WSClient | null {
 // check if the sender is on the list
  const pair = Array
    .from(connectedClients.entries())
    .find(([ws, client]) => client._username == username);
  return pair ? pair[1] : null;
}

function setTimeoutDirectMsg(Sender: WSClient, message: WSmessage)
{
  const timeout = setTimeout(() => {
            try {
                const waitMsg = Array.from(listOfMsg).entries().find(([index,msg]) => msg.msgId === message.msgId)?.[1];
                if (waitMsg) {

                    listOfMsg.delete(waitMsg);
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
        directMsgTimers.set(message.msgId as string, timeout);
}

//MAIN FUNCTIONS =========================================================================================================


function DirectMessage( message:WSmessage, connection: any)
{
  for (let msg of listOfMsg)
  {
    if (message.user === msg.target && message.target === msg.user)
    {
      const msgId = message.msgId;
      if (msgId && directMsgTimers.has(msgId)) {
        clearInterval(directMsgTimers.get(msgId)!);
        directMsgTimers.delete(msgId);
      }
      connection.send(JSON.stringify(msg));
      const Sender = getClientByUsername(msg.user);
      if (Sender)
        Sender._socket.send(JSON.stringify(msg));
      listOfMsg.delete(msg);
      return;
    }
  }
}


/**
 * process incoming message from the client
 * @param msg Message of the Sender
 * @param connection Websocket of the Sender
 * @returns
 */
function Message(msg: WSmessage, connection: any)
{
  let sender_id: number | undefined;

  // get id of the sender
  try {
    sender_id = (fastify.jwt.decode(msg.user) as {id: number | undefined}).id
    if (!sender_id) {
        connection.send(JSON.stringify({
        user: 'server',
        type: TypeMessage.serverMessage,
        content: "You are not connected",
      }));
      return;
    }
  }
  catch (err) {
    connection.send(JSON.stringify({
      user: 'server',
      type: TypeMessage.serverMessage,
      content: "You are not connected",
    }));
    return;
  }

  const senderClient: WSClient | null = getClientById(sender_id);
  if (!senderClient) {
    connection.send(JSON.stringify({user: 'server',
      type: TypeMessage.serverMessage,
      content: "You are not connected"}));
    return;
  }


  if (msg.type === "message")
  {
    if (msg.content != null && msg.content.length != 0)
    {
      const newMsg = { user: senderClient._username!, type: TypeMessage.message, content: msg.content};

      if (!msg.target || msg.target === "all") // <== Check for public message
      {
        // get all blocked clients from the sender
        const sender_blocked_list = db.prepare("SELECT blocker_id FROM user_blocks WHERE blocked_id = ? -- chat on message").all(senderClient._id);
        const senderBlocked = new Set(sender_blocked_list.map((row: any) => row.blocker_id));

        connectedClients.forEach((cl:WSClient) => {
          if (senderClient._id === cl._id)
              newMsg.type = TypeMessage.yourMessage;
          if (senderBlocked && !senderBlocked.has(cl._id)){
            cl._socket.send(JSON.stringify(newMsg));
            newMsg.type = TypeMessage.message;
          }
        });
        return;
      }
      else { // <==   Check for direct message

        // check if the client exist in the database
        const row = db.prepare("SELECT username FROM users WHERE username = ? -- chat on message").get(msg.target);
        if (!row){
          connection.send(JSON.stringify({user: 'server',
            type: TypeMessage.serverMessage,
            content: `${msg.target} doesn't exist`,
            msgId: GenerateRandomId()
        }));
          return;
        }
        // check if the client is connected
        const targetClient = getClientByUsername(msg.target)
        if (!targetClient){
          connection.send(JSON.stringify({ user: 'server', type: TypeMessage.serverMessage,
            content: `${msg.target} is not connected`,
            msgId: GenerateRandomId()
          }));
          return;
        }

        const newDirectMsg = {
            user: senderClient._username!, type: TypeMessage.directMessage,
            target: targetClient?._username,
            content: msg.content,
            msgId: msg.msgId
        };

        listOfMsg.add(newDirectMsg);
        setTimeoutDirectMsg(senderClient, newDirectMsg);
        
        const query = {
            user: senderClient._username, type: "readyForDirectMessage",
            msgId: GenerateRandomId()
        };
        console.log("[sending]", query)

        targetClient._socket.send(JSON.stringify(query));
      }
    }
    else
      console.error("error : no message content");
  }
  else if (msg.type === "directMessage")
  {
    msg.user = senderClient._username!;
    DirectMessage(msg, connection);
  }
}

// PING MESSAGE
function PingUser(connection:any)
{
  const response: WSmessage = {
    user:"server",
    type:TypeMessage.pong,
    msgId: null
  };
  connection.send(JSON.stringify(response))
}

function ConnectionStatusUser(msg: WSmessage, socket: any){

  let sender = null;
  try {
      // check the wich client is with the websocket
      const client = connectedClients.get(socket as WebSocket);
      if (!client){
        console.log("client don't exist");
        return;
      }
      try
      {
        //update id
        // @ts-ignore
        sender = fastify.jwt.decode(msg.user).id;
        client.setId = sender;
      }
      catch {sender = null; client._id = null;}
      if (client._id !== null)
      {
        const row = db.prepare("SELECT username FROM users WHERE id = ? -- chat on message").get(sender);
        if (!row)
        {
          console.error("client don't exist in the database");
          return;
        }

        // delete old connections
        for (let [sock, cl] of connectedClients)
        {
          if (sock != socket &&  cl._id != null && cl._id === sender)
          {
            console.log(cl._username, " got deleted");
            connectedClients.delete(sock);
          }
        }
        // update username
        client._username = row.username;
      }
      else
        client._username = null;

      console.log("Websocket info updated");
      console.log("=============================",
                "\nclient username : ", client._username,
                  "\nclient id : ", client._id,
                  "\n list size : ", connectedClients.size,
                "\n=============================");
  }
  catch (err){
      console.error("Error : ", err);
  }
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

  // remove clients from connected clients
  fastify.websocketServer.on("close", (client: WebSocket) => {
      const deleteClient = connectedClients.get(client);
      if (deleteClient)
      {
        console.log("client ", deleteClient._username, "got deleted");
        connectedClients.delete(client);
      }
  });

  // get incoming message from clients
  fastify.get('/api/chat', { websocket: true }, (connection, req) => {
    connection.on("message", (event) => {
      try {
        const msg: WSmessage = JSON.parse(event.toString());
        console.log({
            messageType: msg.type,
            origin: msg.user.substring(0, 21) + "...",
            target: msg.target,
            content: msg.content,
          });
        if (msg.type === "message" || msg.type === "directMessage")
          Message(msg, connection);
        if (msg.type === "ping")
          PingUser(connection);
        if (msg.type === "connection")
          ConnectionStatusUser(msg, connection);
      }
      catch (err)
      {
        console.error("Error : ", err);
      }
    })
  });

}