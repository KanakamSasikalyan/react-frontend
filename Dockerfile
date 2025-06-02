# ---- Step 1: Build the React app ----
    FROM node:20 AS builder

    # Set working directory
    WORKDIR /app
    
    # Only copy the package manifest first for better caching
    COPY package.json yarn.lock ./
    
    # Install dependencies
    RUN yarn install --frozen-lockfile
    
    # Copy the full source and build
    COPY . .
    RUN yarn build
    
    # ---- Step 2: Serve with Nginx ----
    FROM nginx:alpine
    
    # Remove default Nginx config
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Custom Nginx config for SPA
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
        # Cache static assets for 1 year\n\
        location ~* \\.(?:ico|css|js|gif|jpe?g|png|woff2?|eot|ttf|otf|svg)\$ {\n\
            expires 1y;\n\
            access_log off;\n\
            add_header Cache-Control \"public, immutable\";\n\
        }\n\
    }" > /etc/nginx/conf.d/default.conf
    
    # Copy built React app from builder
    COPY --from=builder /app/build /usr/share/nginx/html
    
    # Expose port 80
    EXPOSE 80
    
    # Run Nginx in foreground
    CMD ["nginx", "-g", "daemon off;"]
    