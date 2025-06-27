# Stage 1: Build Angular application
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install --force
COPY . .
ARG BUILD_ENV=production
# BỎ --output-path=dist/browser khỏi dòng này. Angular sẽ dùng cấu hình từ angular.json.
RUN npm run build -- --configuration=$BUILD_ENV

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS production-ready

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

# SỬA DÒNG NÀY ĐỂ COPY TỪ /app/dist/base-angular (đúng như angular.json)
COPY --from=build /app/dist/base-angular /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]