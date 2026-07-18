FROM node:22

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .
RUN npm run build

CMD npx next start --hostname 0.0.0.0
