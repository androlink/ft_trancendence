#/bin/sh

mkdir -p /var/ssl_cert/

openssl rsa -in /var/ssl_cert/ssl.key -check -noout \
|| openssl req -x509 -nodes -days 1 -newkey rsa:4096 -sha256 -keyout \
	/var/ssl_cert/ssl.key -out /var/ssl_cert/ssl.crt -subj "/CN=ft_trancendence"
