# syntax=docker/dockerfile:1

# ---- 构建：只产出静态文件，所以固定在构建机的原生架构上跑，多架构镜像不用模拟 ----
FROM --platform=$BUILDPLATFORM node:22-alpine AS build
# VitePress 用 git log 读取每页的「最后更新」时间，没有 git 会构建失败
RUN apk add --no-cache git
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
# 上下文里包含 .git；它只留在构建阶段，不会进入最终镜像
COPY . .
RUN git config --global --add safe.directory /app
RUN npm run check && npm run build

# ---- 运行：nginx 托管静态站点 ----
FROM nginx:stable-alpine
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/docs/.vitepress/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q --spider http://127.0.0.1/ || exit 1
