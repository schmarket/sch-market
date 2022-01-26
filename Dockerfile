FROM node:16-alpine

WORKDIR /app

ENV ASSET_PATH=${ASSET_PATH}
ENV PATH /app/node_modules/.bin:$PATH

RUN apk update && apk add --no-cache openssh git

RUN mkdir /root/.ssh \
    && ln -s /run/secrets/host_ssh_key /root/.ssh/id_rsa \
    && ssh-keyscan github.com >> /root/.ssh/known_hosts
    