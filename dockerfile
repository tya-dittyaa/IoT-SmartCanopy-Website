# Stage 1: Build React/Vite
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build for production
RUN npm run build

# Stage 2: Nginx
FROM nginx:alpine

# Copy build hasil Vite ke folder html Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy konfigurasi Nginx custom
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
