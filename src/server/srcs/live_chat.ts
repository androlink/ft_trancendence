import {FastifyInstance} from "fastify";
import "@fastify/websocket";


export default function liveChat(fastify: FastifyInstance){
    fastify.get('/api/chat', { websocket: true }, (socket) => {
        socket.on('message', (event) => {
            const text = typeof event === "string" ? event : event.toString("utf8");
            console.log("msg : " + text);
            socket.send(text);
        })
    });
}