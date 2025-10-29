import fastify, {FastifyInstance} from "fastify";

interface WSmessage {
    type: string,
    id: string,
    content?: string
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
                    console.log("msg : " + msg.content);
                    
                    connectedClients.forEach((client: WebSocket) =>{
                        client.send(JSON.stringify(msg));
                    });
                } 
                if (msg.type === "ping")
                {
                    const response: WSmessage = {
                        id:"666",
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