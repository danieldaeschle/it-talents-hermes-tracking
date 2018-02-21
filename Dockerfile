FROM node:carbon
WORKDIR /app
ADD . /app
RUN npm install --production
EXPOSE 80
CMD [ "npm", "start" ]
