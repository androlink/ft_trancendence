#/bin/bash
mkdir -p ./secrets/ssl/
openssl rsa -in ./secrets/ssl/ssl.key -check -noout \
|| openssl req -x509 -nodes -days 2 -newkey rsa:4096 -sha256 -keyout \
	./secrets/ssl/ssl.key -out ./secrets/ssl/ssl.crt -subj "/CN=ft_trancendence"
