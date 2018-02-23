FROM node:9.5.0-alpine
WORKDIR /app
ADD . /app
RUN npm install --production
EXPOSE 80
CMD [ "npm", "start" ]
