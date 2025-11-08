import fastify from "./server";
import { FastifyInstance } from "fastify";
import db from "./database"
import { send } from "process";
import server from "./server";

/**
 * Interface Message
 * @param type Type of message send (message, ping, etc..).
 * @param id Id of who send the message.
 * @param target where the message is send (everyone by default) [optional]
 * @param content Content of the message if is necessary [optional]
 */
interface WSmessage {
  type: string,
  id: string,
  target?: string | null,
  content?: string | null
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

function DirectMessage( message:WSmessage, connection: any)
{
  for (let msg of listOfMsg)
  {
    console.log('==================\n', message, '\n', msg,'\n==================');
    if (message.id === msg.target && message.target === msg.id)
    {
      connection.send(JSON.stringify(msg));
      listOfMsg.delete(msg);
      return;
    }
  }
}

function getClientById(id: number): WSClient | null {
 // check if the sender is on the list
  const pair = Array
    .from(connectedClients.entries())
    .find(([ws, client]) => client._id == id);
  return pair ? pair[1] : null;
}

function Message(msg: WSmessage, connection: any)
{
  let sender_id: number | undefined;

  // get id of the sender
  try {
    sender_id = (fastify.jwt.decode(msg.id) as {id: number | undefined}).id
    if (!sender_id) {
        connection.send(JSON.stringify({
        id: 'server',
        type: "message",
        content: "not connected",
      }));
      return;
    }
  }
  catch (err) {
    connection.send(JSON.stringify({
      id: 'server',
      type: "message",
      content: "not connected",
    }));
    return;
  }
  const client: WSClient | null = getClientById(sender_id);
  if (!client) {
    connection.send(JSON.stringify({id: 'server',
      type: "message", 
      content: "user not connected"}));
    return;
  }
  if (msg.type === "message")
  {
    if (msg.content != null)
    {
      const newMsg = { id: client._username!, type: "message", content: msg.content};
  
      if (!msg.target || msg.target === "all")
      {
        connectedClients.forEach((cl:WSClient) => cl._socket.send(JSON.stringify(newMsg)));
        return;
      }
      for (let [sock, cl] of connectedClients) {
        if (cl._username === msg.target)
        {
          const newDirectMsg = {id: client._username!, type: "direct_message", target: msg.target, content: msg.content}
          listOfMsg.add(newDirectMsg);
          const query = {id: client._username, type: "readyForDirectMessage"};
          console.log("[sending]", query)
          sock.send(JSON.stringify(query));
          return;
        }
      }
      connection.send(JSON.stringify({id: 'server', type: "message", content: msg.target + " not connected or doesn't exist"}));
    }
    else
      console.error("error : no message content");
  }
  else if (msg.type === "direct_message")
  {
    msg.id = client._username!;
    DirectMessage(msg, connection);
  }
}

// PING MESSAGE
function PingUser(connection:any)
{
  const response: WSmessage = {
    id:"server",
    type:"pong"
  };
  connection.send(JSON.stringify(response))
}

function ConnectionUser(msg: WSmessage, socket: any){
  
  let sender = null;
  try {
      // check the wich client is with the websocket 
      const client = connectedClients.get(socket);
      if (!client){
        console.log("client don't exist");
        return;
      } 
      try
      {
        //update id
        // @ts-ignore
        sender = fastify.jwt.decode(msg.id).id;
        client.setId = sender;
      }
      catch {sender = null;} 

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
            console.log(cl._username, "got deleted");
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



export default function liveChat(fastify: FastifyInstance){

  fastify.websocketServer.on("connection", (ws: WebSocket) => {
    const testClient = connectedClients.get(ws);
    if (!testClient)
    {
      const newClient = new WSClient(ws, null, null);
      connectedClients.set(ws, newClient);
    }
  });
  fastify.websocketServer.on("close", (client: WebSocket) => {
      const deleteClient = connectedClients.get(client);
      if (deleteClient)
      {
        console.log("client ", deleteClient._username, "got deleted");
        connectedClients.delete(client);
      }
  });

  fastify.get('/api/chat', { websocket: true }, (connection, req) => {
    connection.on("message", (event) => {
      try {
        const msg: WSmessage = JSON.parse(event.toString());
        console.log({
            messageType: msg.type,
            origin: msg.id,
            target: msg.target,
            content: msg.content,
          });
        if (msg.type === "message" || msg.type === "direct_message")
          Message(msg, connection);
        if (msg.type === "ping")
          PingUser(connection);
        if (msg.type === "connection")
          ConnectionUser(msg, connection);
      }
      catch (err)
      {
        console.error("Error : ", err);
      }
    })
  });

}