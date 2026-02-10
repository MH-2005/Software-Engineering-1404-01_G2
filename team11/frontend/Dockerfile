# Build Stage
FROM node:20.19.0-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm config set registry https://npm.runflare.com && npm install
COPY . .
RUN npm run build

# Production Stage
FROM nginx:stable-alpine
# Vite outputs to 'dist' by default. 
# We copy the CONTENTS of dist into the nginx html folder.
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]