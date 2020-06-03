FROM node:14.2.0-alpine

LABEL version="1.0.0"
LABEL repository="https://github.com/github-actions-x/commit"

RUN apk --update --no-cache add git git-lfs

COPY package.json package.json

RUN npm install

COPY . .

RUN ls -la

ENTRYPOINT [ "node", "." ]
