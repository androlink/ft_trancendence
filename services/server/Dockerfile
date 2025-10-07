FROM node:20-alpine
RUN apk add --no-cache curl bash
WORKDIR /var/src/server
RUN npm init -y
RUN npm i fastify 
RUN npm i @fastify/static
RUN npm i @fastify/jwt
RUN npm i @fastify/websocket
RUN npm i @fastify/formbody
RUN npm install
# when changing the installs above 
# you should consider emptying (or rm) node_modules volume
EXPOSE 3000
CMD ["node", "--watch", "server.js"]
