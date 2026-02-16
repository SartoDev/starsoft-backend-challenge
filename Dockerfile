# =========================
# STAGE 1 - build
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci

COPY . .

# Gera o Prisma Client
RUN npx prisma generate


# Build da aplicação
RUN npm run build


# =========================
# STAGE 2 - production
# =========================
FROM node:20-alpine

# Adiciona usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copia arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/
COPY prisma.config.ts ./

# Instala dependências de produção + Prisma CLI
RUN npm ci --omit=dev && \
    npm cache clean --force

# Copia o build
COPY --from=builder /app/dist ./dist

# Copia o script de entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Define o usuário (mas o entrypoint precisa rodar como root para algumas operações)
USER nodejs

EXPOSE 3000

ENV NODE_ENV=production

# Use o entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]