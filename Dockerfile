# ---- Step 1: Build the React app ----
FROM node:20 AS builder

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npm run build

# ---- Step 2: Serve with Nginx ----
FROM nginx:alpine

RUN rm /etc/nginx/conf.d/default.conf

RUN printf "server {\n\
    listen 80;\n\
    server_name localhost;\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
\n\
    location / {\n\
        try_files \$uri \$uri/ /index.html;\n\
    }\n\
\n\
    location ~* \\.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|otf|svg)\$ {\n\
        expires 1y;\n\
        access_log off;\n\
        add_header Cache-Control \"public, immutable\";\n\
    }\n\
}" > /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]