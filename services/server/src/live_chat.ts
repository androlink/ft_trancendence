import fastify, {FastifyInstance} from "fastify";

interface WSmessage {
    type: string,
    id: string,
    content: string
};



export default function liveChat(fastify: FastifyInstance){
    fastify.get('/api/chat', { websocket: true }, (connection, req) => {
        connection.on("message", (event) => {
            try{
                const msg: WSmessage = JSON.parse(event.toString());
                if (msg.type === "message")
                {
                    console.log("msg : " + msg.content);
                    connection.send(msg.content);
                }
                if (msg.type === "ping")
                {
                    const response: WSmessage = {
                        id:"666",
                        type:"pong",
                        content:"mega pong"
                    };
                    connection.send(JSON.stringify(response))
                }
            }
            catch (err)
            {
                console.error("Error :", err);
            }

        })
    });
}