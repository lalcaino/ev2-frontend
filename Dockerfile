# frontend/Dockerfile

FROM node:20-alpine AS builder

WORKDIR /app

# Copiar dependencias primero
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copiar código fuente y construir
COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

#
#Imagen de producción con Nginx

FROM nginx:1.25-alpine AS production

# Crear usuario no-root para ejecutar Nginx
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# Copiar artefactos del build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Ajustar permisos para usuario no-root
RUN chown -R appuser:appgroup /usr/share/nginx/html \
    && chown -R appuser:appgroup /var/cache/nginx \
    && chown -R appuser:appgroup /var/log/nginx \
    && touch /var/run/nginx.pid \
    && chown appuser:appgroup /var/run/nginx.pid

USER appuser

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:80 || exit 1

CMD ["nginx", "-g", "daemon off;"]
