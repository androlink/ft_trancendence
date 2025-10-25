FROM node:current-slim AS base
WORKDIR /var/app/src
COPY conf/package.json ..
RUN mkdir ../node_modules
RUN npm install --prefix ..

FROM base AS dev
RUN apt update
RUN apt install curl bash watchman -y
RUN npm i --no-save --prefix .. concurrently
CMD ["npm", "run", "dev"]

FROM base AS prod
COPY src/.  .
CMD ["npm", "run", "prod"]

# coming too early (first few seconds) might be not functionning
# only on dev, because in prod server waits client docker to end
# before starting