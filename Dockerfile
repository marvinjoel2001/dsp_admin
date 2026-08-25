# Multi-stage Dockerfile for React Admin Portal
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Pass build variables for Vite
ARG VITE_API_BASE_URL=http://localhost:3000/v1
ARG VITE_WS_URL=http://localhost:3000/tracking
ARG VITE_MAPBOX_TOKEN=""

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_WS_URL=$VITE_WS_URL
ENV VITE_MAPBOX_TOKEN=$VITE_MAPBOX_TOKEN

RUN npm run build

# Nginx Production Server
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
