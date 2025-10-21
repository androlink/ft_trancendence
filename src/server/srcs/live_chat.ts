import {FastifyInstance} from "fastify";
import "@fastify/websocket";

export default function liveChat(fastify: FastifyInstance){
    fastify.get('/api/chat', { websocket: true }, (ws: WebSocket) => {
        ws.addEventListener('message', () => {
            ws.send("'feur' from server");
        })
        ws.send("quoi");
        console.log("websocket created");
        // websockets.push(ws);
    });
}