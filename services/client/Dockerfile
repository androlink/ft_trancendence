FROM node:current-slim AS base
WORKDIR /var/app
COPY conf/package.json .
RUN npm install

FROM base AS dev
RUN apt update
RUN apt install curl bash watchman -y
RUN npm i concurrently
CMD ["npm", "run", "dev"]

FROM base AS prod
COPY src/.  src
CMD ["npm", "run", "prod"]