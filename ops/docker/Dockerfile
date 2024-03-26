FROM node:16-buster

COPY . /app
WORKDIR /app

RUN apt-get update && apt-get install -y bash unzip git netcat

RUN curl -s -f -L -o wait-for https://raw.githubusercontent.com/eficode/wait-for/v2.2.3/wait-for && \
    chmod +x wait-for && \
    mv wait-for /usr/local/bin/wait-for

COPY ops/docker/docker-entrypoint.sh /usr/local/bin/

CMD [ "/usr/local/bin/npm", "run",  "test" ]
