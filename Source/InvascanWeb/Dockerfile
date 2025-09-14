FROM node:20-bullseye-slim

# Install curl for healthcheck
RUN apt-get update && apt-get install -y netcat-openbsd --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY .output ./
COPY package*.json ./
RUN npm install --omit=dev
EXPOSE 3000
CMD ["node", "server/index.mjs"]
