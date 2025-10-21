"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = liveChat;
require("@fastify/websocket");
function liveChat(fastify) {
    fastify.get('/api/chat', { websocket: true }, (ws) => {
        ws.addEventListener('message', () => {
            ws.send("'feur' from server");
        });
        ws.send("quoi");
        console.log("websocket created");
        // websockets.push(ws);
    });
}
