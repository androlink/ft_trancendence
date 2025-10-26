FROM node:20-alpine AS base
RUN apk add curl bash
WORKDIR /var/project
COPY conf/package.json .
RUN npm install
EXPOSE 3000

FROM base AS dev
CMD ["npm", "run", "dev"]

FROM base AS prod
COPY src/.  src
CMD ["npm", "run", "prod"]