#/bin/bash

mkdir -p secrets
mkdir -p data
mkdir -p data/certificate
mkdir -p data/db
mkdir -p data/www
# it can create all the subdirectories underneath by itself
# but it needs root to be removed if we don't create them before
mkdir -p data/www/languages
mkdir -p data/www/pfp
mkdir -p data/www/pong
mkdir -p data/www/html