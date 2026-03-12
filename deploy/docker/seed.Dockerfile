# Lightweight seed runner
FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY seeds/ seeds/
COPY data.json data.json

CMD ["node", "seeds/index.js"]
