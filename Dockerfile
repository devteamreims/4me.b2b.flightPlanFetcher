FROM registry.gitlab.com/devteamreims/node-yarn:7.2.0

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY yarn.lock package.json /usr/src/app/
RUN yarn install --production

COPY . /usr/src/app/

ENV PORT 3102
EXPOSE ${PORT}

CMD ["npm", "start"]
