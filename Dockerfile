FROM node:14.20.0-alpine
RUN apk add g++ make py3-pip

WORKDIR /usr/app

COPY . .

RUN HUSKY_SKIP_INSTALL=true npm ci --prod
RUN npm i @angular/cli

RUN npm run build:prod

CMD ["node_modules/.bin/ng", "serve", "--host", "0.0.0.0", "--configuration", "production"]
