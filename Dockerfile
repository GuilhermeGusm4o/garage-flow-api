FROM node:24.19.0-alpine

RUN apk update && apk upgrade --no-cache && npm install -g npm@latest

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npx prisma generate

ARG NODE_ENV=development

RUN if [ "$NODE_ENV" = "production" ]; then npm run build; fi

EXPOSE 3000
EXPOSE 9229