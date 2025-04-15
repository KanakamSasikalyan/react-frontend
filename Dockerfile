# Step 1: Build React App
FROM node:18 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package.json yarn.lock ./
RUN yarn install

# Copy rest of the app and build
COPY . .
RUN yarn build

# Step 2: Serve the app with Nginx
FROM nginx:alpine

# Copy the build output to Nginx's web directory
COPY --from=builder /app/build /usr/share/nginx/html

# Copy custom Nginx config if needed
# COPY nginx.conf /etc/nginx/nginx.conf

# Expose the port
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
