FROM node:14-alpine
WORKDIR /app/chaincode/
COPY . .
RUN npm install  && printf "npm run start\n" > entrypoint.sh
EXPOSE 9999
CMD ["/bin/sh","entrypoint.sh"]
