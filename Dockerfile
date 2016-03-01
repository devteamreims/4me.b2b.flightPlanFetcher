FROM node:5.7

RUN mkdir /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install --production

COPY . /usr/src/app/

ENV PORT 3102
EXPOSE ${PORT}

CMD ["npm", "start"]
