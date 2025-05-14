# Stage 1: Build React App
FROM node:18 AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile # Ensures exact versions
COPY . .
RUN yarn build

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Install additional dependencies for WebSocket support
RUN apk add --no-cache bash curl

# Copy build files
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx config (critical for React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
