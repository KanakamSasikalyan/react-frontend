FROM node:20 AS builder

WORKDIR /app
COPY package.json ./
RUN yarn install

COPY . .
RUN yarn build

FROM nginx:alpine

COPY --from=builder /app/build /usr/share/nginx/html
# Use default nginx config
RUN echo "server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html; \
        try_files \$uri \$uri/ /index.html; \
    } \
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]