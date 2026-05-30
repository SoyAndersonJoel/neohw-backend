# ==========================================
# Etapa 1: Builder (Compilación)
# ==========================================
FROM node:24-alpine AS builder

# Directorio de trabajo en el contenedor
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
COPY prisma ./prisma/

# Instalar TODAS las dependencias (incluyendo devDependencies para compilar)
RUN npm ci

# Copiar el resto del código fuente
COPY . .

# Generar el cliente de Prisma y compilar NestJS
RUN npm run build

# ==========================================
# Etapa 2: Producción
# ==========================================
FROM node:24-alpine AS production

# Variables de entorno para producción
ENV NODE_ENV=production

WORKDIR /app

# Copiar dependencias y schema
COPY package*.json ./
COPY prisma ./prisma/

# Instalar SOLO las dependencias de producción (más rápido y ligero)
RUN npm ci --omit=dev

# Copiar el código compilado (dist) desde la etapa de Builder
COPY --from=builder /app/dist ./dist

# Copiar la carpeta generada por Prisma (ya que tienes output custom)
COPY --from=builder /app/src/generated/prisma ./src/generated/prisma

# Exponer el puerto
EXPOSE 4000

# Comando para iniciar la aplicación en producción
CMD ["npm", "run", "start:prod"]
