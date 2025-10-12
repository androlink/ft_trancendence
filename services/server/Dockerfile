FROM node:22-alpine
RUN apk add --no-cache curl bash
WORKDIR /var/src/server

EXPOSE 3000
CMD ["node", "--watch", "server.js"]
