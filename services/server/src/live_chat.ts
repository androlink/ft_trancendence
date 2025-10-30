import fastify, {FastifyInstance} from "fastify";
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

const connectedClients = new Set();

export default function liveChat(fastify: FastifyInstance){

  fastify.websocketServer.on("connection", (client) => {
    connectedClients.add(client);
  });

  fastify.get('/api/chat', { websocket: true }, (connection, req) => {
    connection.on("message", (event) => {
      try{
        const msg: WSmessage = JSON.parse(event.toString());
        if (msg.type === "message")
        {
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
                content: "sac a merde t'es pas co"
              }));
              return;
            }

            const row = db.prepare("SELECT username FROM users WHERE id = ? -- chat on message").get(sender);
            if (!row) {
              connection.send(JSON.stringify({
                id: 'server',
                type: "message",
                content: "sac a merde t'existe pas"
              }));
              return;
            }
            msg.id = row.username;
            console.log("id : " + msg.id + "\nmsg : " + msg.content);
            connectedClients.forEach((client: WebSocket) =>{
              client.send(JSON.stringify(msg));
            });
        }
          else
            console.error("error : no message content");
        }
        if (msg.type === "ping")
        {
          const response: WSmessage = {
            id:"server",
            type:"pong"
          };
          connection.send(JSON.stringify(response))
        }
      }
      catch (err)
      {
        console.error("Error : ", err);
      }

    })
  });

}