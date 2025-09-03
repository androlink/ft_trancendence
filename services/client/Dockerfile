FROM node:20-alpine
RUN apk add --no-cache curl bash
WORKDIR /var/client
RUN npm i -g typescript @types/node
CMD ["tsc", "--watch"]
