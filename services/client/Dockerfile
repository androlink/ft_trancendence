# line below is when node:20-alpine
# FROM node:20-alpine
# RUN apk add --no-cache curl bash

FROM node:current-slim
RUN apt update
RUN apt install curl bash watchman -y


WORKDIR /var/client
RUN npm install -g typescript @types/node


# line below is when node:20-alpine, not working with --watch
# RUN curl -sL https://github.com/tailwindlabs/tailwindcss/releases/download/v4.1.13/tailwindcss-linux-x64-musl -o /usr/local/bin/tailwindcss
RUN curl -sL https://github.com/tailwindlabs/tailwindcss/releases/download/v4.1.13/tailwindcss-linux-x64 -o /usr/local/bin/tailwindcss
RUN chmod +x /usr/local/bin/tailwindcss

# bash, not sh, while in the dev, because wait -n is different
CMD ["bash", "script/client.sh"]
