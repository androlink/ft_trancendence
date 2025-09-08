FROM node:20-alpine
RUN apk add --no-cache curl bash
WORKDIR /var/server
RUN npm init -y
RUN npm i -D fastify
RUN npm install
EXPOSE 3000
CMD ["node", "--watch", "server.js"]
