FROM node:current-slim AS base
WORKDIR /var/project
ARG NPM_I_ARGS=
COPY conf/package.json .
RUN npm install $NPM_I_ARGS

FROM base AS dev
RUN apt update
RUN apt install watchman -y
CMD ["npm", "run", "dev"]

FROM base AS prod
COPY src/.  src
CMD ["npm", "run", "prod"]