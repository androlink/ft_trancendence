FROM node:22-alpine
RUN apk update
RUN apk upgrade
RUN apk add curl bash
RUN apk add typescript;

WORKDIR /var/src/server
EXPOSE 3000

COPY tsconfig.json package.json ./

CMD ["sh", "-c", "tsc && node js/server.js"]
