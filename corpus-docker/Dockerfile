FROM node:10-alpine
RUN mkdir -p /home/node/node_modules
WORKDIR /home/node
COPY package*.json .
RUN npm install
COPY . .
RUN chown -R node:node /home/node
CMD node corpus.js
