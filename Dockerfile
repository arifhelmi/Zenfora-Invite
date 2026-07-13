FROM node:24-alpine AS base
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm prisma:generate && pnpm build
EXPOSE 3000
ENV NODE_ENV=production
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm start"]
