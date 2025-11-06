import fastify from "./server";
import { FastifyInstance } from "fastify";
import db from "./database"
import { send } from "process";

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
class wsClient{
  _socket: any;
  _username: string | null;
  _id: number | null;
  
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

  set setUsername(username: any)
  {
    this._username = username;
  }
}
/**
 * List of Clients
 * @class wsClient
 */
const connectedClients = new Map();


const listOfMsg = new Set();


function Message(msg: WSmessage, connection: any)
{
  let newMsg : WSmessage | null;
  let  client : wsClient | null;


  if (msg.content != null)
  {
    // get id of the sender
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

    // check if the sender is on the list
    for ( let cl of  connectedClients) {
      console.log(cl[1]._id , " and ", sender);
      if (cl[1]._id === sender)
      {
        client = cl[1];
        break;
      }
    }
    if (!client){
      connection.send(JSON.stringify({id: 'server', type: "message", content: "sac a merde t'existe po"}));
      return;
    }
    

    newMsg = { id: client._username, type: "message", content: msg.content};

    if (!msg.target || msg.target === "all")
    {
      connectedClients.forEach((cl:wsClient) =>{
        cl._socket.send(JSON.stringify(newMsg));
      });
    }
    else
    {
      for ( let clients of  connectedClients) {
        if (clients[1].getUsername === msg.target)
        {
          // do a fontion who stock the msg to listOfMsg and 
          // send a 'ping' to the target and wait for the respond
          // when it repond send the msg to the target
          // else if he doesn't repond in 1 minute delete the msg and send a error to the author
          break;
        }
      }  
    }
  }
  else
    console.error("error : no message content");
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
      let client: wsClient;

      // check the wich client is with the websocket 
      client = connectedClients.get(socket);
      if (!client === null){
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
          if (sock != socket &&  cl.id != null && cl.id === sender)
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

  fastify.websocketServer.on("connection", (client) => {
    let testClient : wsClient | null = connectedClients.get(client);
    if (!testClient)
    {
      const newClient = new wsClient(client, null, null);
      connectedClients.set(client, newClient);
    }
  });
  fastify.websocketServer.on("close", (client) => {
      let deleteClient: wsClient | null = connectedClients.get(client);
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