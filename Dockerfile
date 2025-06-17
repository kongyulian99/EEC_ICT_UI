# Stage 1: Build Angular application
FROM node:20-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
ARG BUILD_ENV=production
RUN npm run build -- --configuration=$BUILD_ENV --output-path=dist/browser # Sử dụng --output-path cụ thể

# Stage 2: Serve the application with Nginx
FROM nginx:alpine AS production-ready

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

# Copy the built Angular application from the 'build' stage
# Kích thước thư mục dist của Angular hiện đại thường là `dist/<project-name>/browser/`
# Bạn cần kiểm tra trong angular.json của bạn, hoặc thư mục thực tế sau khi ng build
# Ví dụ: nếu angular.json có "outputPath": "dist/my-angular-app",
# thì thư mục chứa index.html sẽ là "dist/my-angular-app/browser"
# Điều chỉnh dòng này nếu đường dẫn của bạn khác
COPY --from=build /app/dist/base-angular/browser /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]