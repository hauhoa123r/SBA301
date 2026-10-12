FROM node:22-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci \
    --fetch-retries=5 \
    --fetch-retry-mintimeout=20000 \
    --fetch-retry-maxtimeout=120000 \
    --no-audit \
    --no-fund
COPY . .
RUN npm run build

FROM nginx:1.27-alpine

COPY --from=build /app/dist /usr/share/nginx/html

COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

COPY proxy_params /etc/nginx/proxy_params

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
