# ---- Step 1: Build the React app ----
    FROM node:20 AS builder

    # Set working directory
    WORKDIR /app
    
    # Copy only package.json to leverage Docker cache
    COPY package.json ./
    
    # Install dependencies
    RUN npm install
    
    # Copy the full source code
    COPY . .
    
    # Build the React app
    RUN npm run build
    
    # ---- Step 2: Serve with Nginx ----
    FROM nginx:alpine
    
    # Remove the default Nginx config
    RUN rm /etc/nginx/conf.d/default.conf
    
    # Add custom Nginx config for React SPA + caching
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
    
    # Copy the built React app from the builder stage
    COPY --from=builder /app/build /usr/share/nginx/html
    
    # Expose port 80
    EXPOSE 80
    
    # Start Nginx server
    CMD ["nginx", "-g", "daemon off;"]