FROM node:20-alpine
RUN apk add --no-cache curl bash
WORKDIR /var/src/server
RUN npm init -y
RUN npm i fastify
# not doing anything for some reason 
# RUN npm i @fastify/websocket
RUN npm i @fastify/static
RUN npm install
EXPOSE 3000
CMD ["node", "--watch", "server.js"]
