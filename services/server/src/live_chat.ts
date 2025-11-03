import fastify from "./server";
import { FastifyInstance } from "fastify";
import db from "./database"

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


class wsClient{
  _socket: any;
  _username: string;
  _id: any;
  
  constructor(client, username, id)
  {
    this._socket = client;
    this._username = username;
    this._id = id;
  }

  set setId(id: any)
  {
    this._id = id;
  }

  set setUsername(username: string)
  {
    this._username = username;
  }

  get getid(){
    return this._id;
  }

  get getUsername(){
    return this._username;
  }
}
const connectedClients = new Map();


function Message(msg: WSmessage, connection: any)
{
  console.log("id : " + msg.id + "\nmsg : " + msg.content);
  if (msg.content != null)
  {
    let sender = -1;
    try {
      // @ts-ignore
      sender = fastify.jwt.decode(msg.id).id
    }
    catch (err) {
      connection.send(JSON.stringify({
        id: 'server',
        type: "message",
        content: "not connected",
      }));
      return;
    }
    const row = db.prepare("SELECT username FROM users WHERE id = ? -- chat on message").get(sender);
    if (!row) {
        connection.send(JSON.stringify({
        id: 'server',
        type: "message",
        content: "sac a merde t'existe po"
        }));
        return;
    }
    msg.id = row.username;
    console.log("id : " + msg.id + "\nmsg : " + msg.content);

    connectedClients.forEach((client: wsClient) =>{
      client._socket.send(JSON.stringify(msg));
    });
  }
  else
    console.error("error : no message content");
}

function PingUser(connection:any)
{
  const response: WSmessage = {
    id:"server",
    type:"pong"
  };
  connection.send(JSON.stringify(response))
}

function ConnectionUser(msg: WSmessage, connection: any){
  
  let sender = -1;
  try {
      const client: wsClient = connectedClients.get(connection);
      // @ts-ignore
      sender = fastify.jwt.decode(msg.id).id
      client.setId = sender;
      const row = db.prepare("SELECT username FROM users WHERE id = ? -- chat on message").get(sender);
      if (!row)
      {
        console.error("client don't exist in the database");
        return;
      }
      client._username = row.username;
  }
  catch (err){
      console.error("Error : ", err);
  }
}

export default function liveChat(fastify: FastifyInstance){

  fastify.websocketServer.on("connection", (client) => {
    const newClient = new wsClient(client, "unknown", -1);
    connectedClients.set(client, newClient);
  });

  fastify.get('/api/chat', { websocket: true }, (connection, req) => {
    connection.on("message", (event) => {
      try {
        const msg: WSmessage = JSON.parse(event.toString());
        if (msg.type === "message")
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