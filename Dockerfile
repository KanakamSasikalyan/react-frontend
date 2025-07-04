# Updated Node.js version to 20 for compatibility
FROM node:20 AS builder

WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Added dependencies for React Router and additional libraries used in the project
RUN npm install react-router-dom react-webcam react-draggable react-resizable axios

COPY . .
RUN yarn build

FROM nginx:alpine

RUN apk add --no-cache bash curl

COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
