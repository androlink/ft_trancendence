import Fastify from 'fastify';
import websocket from '@fastify/websocket';
import fastify from 'fastify';

const server = Fastify();
server.register(websocket, {
    options: { maxPayload: 1048576}
})
server.register(async function (server) {
    server.get('/', {websocket: true}, (socket, req) =>{
        socket.on('message', message =>{
            socket.send("'feur' from server")
        })
    })
})

const feur = async () => {
    return;
};

feur();

await server.listen({ port: 3000})