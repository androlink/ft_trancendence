FROM node:20-alpine
RUN apk add --no-cache curl bash
WORKDIR /var/server
RUN npm init -y
RUN npm i -D fastify
RUN npm i -D typescript @types/node
run npm i -D @fastify/static
RUN npm install -g tsx
EXPOSE 3000
CMD ["tsx", "watch", "server.ts"]
