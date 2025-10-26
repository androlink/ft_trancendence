FROM alpine

RUN apk update -v
RUN apk add openssl

WORKDIR /

COPY ./script/ssl_setup.sh /bin/ssl_setup.sh
RUN chmod +x /bin/ssl_setup.sh

CMD ["sh", "/bin/ssl_setup.sh"]