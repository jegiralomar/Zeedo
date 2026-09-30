# Minimal Production Image for Zeedo WebSocket Gateway
FROM node:20-alpine AS runner

WORKDIR /app

COPY package.json ./
RUN npm install --omit=dev --silent

COPY server.js ./

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "server.js"]
