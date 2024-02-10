FROM node:20

WORKDIR /app

COPY package.json .
COPY package-lock.json .

RUN npm install

COPY . .

RUN npm run build

ENV PORT 8000

EXPOSE $PORT

CMD ["npm", "start"]