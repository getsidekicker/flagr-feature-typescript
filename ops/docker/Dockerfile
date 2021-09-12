FROM node:16-buster

COPY . /app
WORKDIR /app

RUN apt-get update && apt-get install -y bash unzip git

RUN curl -s -f -L -o await https://github.com/betalo-sweden/await/releases/download/v1.2.0/await-linux-amd64 && \
    chmod +x await && \
    mv await /usr/local/bin/await

COPY ops/docker/docker-entrypoint.sh /usr/local/bin/
