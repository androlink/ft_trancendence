"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const static_1 = __importDefault(require("@fastify/static"));
const jwt_1 = __importDefault(require("@fastify/jwt"));
const websocket_1 = __importDefault(require("@fastify/websocket"));
const formbody_1 = __importDefault(require("@fastify/formbody"));
const api_routes_1 = require("./api_routes");
const login_routes_1 = require("./login_routes");
const live_chat_1 = __importDefault(require("./live_chat"));
const fastify = (0, fastify_1.default)({
    logger: true,
    routerOptions: {
        ignoreTrailingSlash: true,
        ignoreDuplicateSlashes: true
    }
});
fastify.register(formbody_1.default);
fastify.register(static_1.default, {
    root: '/var/www'
});
fastify.register(jwt_1.default, {
    secret: 'KEY'
});
fastify.register(websocket_1.default, {
    options: {
        clientTracking: true,
        maxPayload: 1048576
    }
});
fastify.setNotFoundHandler((_req, reply) => {
    return reply.code(418).sendFile('/page.html');
});
fastify.register(api_routes_1.apiRoutes, { prefix: '/api' });
fastify.register(login_routes_1.loginRoutes);
fastify.register(live_chat_1.default);
fastify.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
    if (err)
        throw err;
});
