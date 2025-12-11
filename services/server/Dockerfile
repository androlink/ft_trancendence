FROM node:20-alpine AS base
RUN apk add curl
WORKDIR /var/project
COPY conf/package.json .
RUN npm install
EXPOSE 3000

FROM base AS dev
ENTRYPOINT ["npm", "run"]

FROM base AS prod
COPY src/.  src
ENTRYPOINT ["npm", "run"]