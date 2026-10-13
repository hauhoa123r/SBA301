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

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY proxy_params /etc/nginx/proxy_params

# Certificates are mounted at runtime; reject an HTTP-only config at build time.
RUN grep -Eq 'listen[[:space:]]+443[[:space:]]+ssl[[:space:]]*;' /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
