# ==========================================
# 阶段 1：构建阶段 (使用 Node.js 镜像)
# ==========================================
# 使用 LTS 版本的 Node Alpine 极简镜像
FROM node:24-alpine AS build
WORKDIR /app

# 启用 corepack，并固定 pnpm 版本
RUN corepack enable && corepack prepare pnpm@10.33.2 --activate

# 最佳实践：先拷贝 package.json 和 pnpm-lock.yaml (如果有)
# 这样只要依赖没变，Docker 就会缓存这一层，极大加快构建速度
COPY package.json pnpm-lock.yaml* ./

# 安装依赖
# 如果报错，建议先去掉 --frozen-lockfile 看看是否能跑通，以排查是否是 lock 文件不匹配
RUN pnpm install

# 拷贝所有源代码
COPY . .

# 执行打包命令，默认输出到 dist 目录
RUN pnpm run build

# ==========================================
# 阶段 2：运行阶段 (使用 Nginx 极简镜像)
# ==========================================
# nginx:alpine 体积仅有 10MB 左右，非常适合托管静态文件
FROM nginx:alpine AS final

# 将我们自定义的 Nginx 配置文件覆盖到容器内
COPY nginx.conf /etc/nginx/conf.d/sharpfort.conf

# 从构建阶段将打包好的 dist 目录拷贝到 Nginx 的默认托管目录
COPY --from=build /app/dist /usr/share/nginx/html

# 暴露 80 端口 (这是容器内部的端口)
EXPOSE 80

# 启动 Nginx，并保持前台运行
CMD ["nginx", "-g", "daemon off;"]