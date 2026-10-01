# Minimal Production Container for Zeedo Baileys WhatsApp Gateway
FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache git

COPY package.json ./
RUN npm install --omit=dev --silent

COPY server.js ./

EXPOSE 3001

ENV NODE_ENV=production
ENV PORT=3001
ENV AUTH_DIR=/app/auth_info

CMD ["node", "server.js"]
