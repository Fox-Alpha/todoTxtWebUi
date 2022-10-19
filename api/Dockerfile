FROM node:16.13.1-alpine
RUN apk add g++ make py3-pip

WORKDIR /usr/app

COPY . .

RUN HUSKY_SKIP_INSTALL=true npm ci --prod
RUN npm i @nestjs/cli

RUN npm run build

CMD ["node", "-r", "/usr/app/dist/main"]
