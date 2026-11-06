# 吱吱鼠AI 文档站

基于 VitePress 的吱吱鼠AI（https://zzshu.cc）客户端接入与使用文档。

## 本地开发

```bash
npm install
npm run dev        # 本地预览 http://localhost:5173
npm run build      # 构建到 docs/.vitepress/dist
npm run check      # 检查向导能为每个客户端生成教程
```

## 目录

```
docs/
├─ .vitepress/
│  ├─ config.mts              导航、侧边栏、站点设置
│  ├─ data/
│  │  ├─ site.ts              品牌常量、线路、模型分类（最常改的文件）
│  │  ├─ clients.ts           客户端定义（协议、安装命令、文章链接）
│  │  ├─ tutorial.ts          向导生成的步骤与配置
│  │  └─ catalog.json         模型/分组快照（脚本生成，不要手改）
│  └─ theme/components/
│     ├─ ClientWizard.vue     客户端接入向导
│     └─ RouteTable.vue       文章里的线路表
├─ integrations/              客户端接入文章
├─ faq/  guides/  api/        常见问题、使用指南、API 参考
└─ public/logo.jpg
scripts/
├─ sync-catalog.mjs           从 zzshu.cc/api/pricing 同步模型
└─ check-tutorials.mjs
```

## 常见维护

**修改线路**：编辑 `docs/.vitepress/data/site.ts` 里的 `routes`。`url` 只填根域名，不带 `/v1`。真实线路上线后删掉 `placeholder: true`，向导测速和所有文章里的 `<RouteTable />` 会一起更新。

**更新模型列表**：后台加了模型或分组后运行 `npm run sync:catalog`，然后提交 `catalog.json`。不想展示的分组加到 `scripts/sync-catalog.mjs` 的 `HIDDEN_GROUPS`。

**Codex 兼容**：后台 GPT 分组的模型目前只标了 `openai` 端点。同步脚本里的 `ASSUME_GPT_RESPONSES` 会把 GPT/Codex/o 系列模型当作支持 Responses API，这样 Codex 才能在向导里选中。后台补齐端点标注后，把它改成 `false`。

**调整模型类型 Tab**：编辑 `site.ts` 里的 `categories`。分组名包含 `include` 中的关键词就归入该类，`exclude` 用来排除。

## 部署

### Docker

推送到 `main` 分支后，GitHub Actions 会自动构建镜像，推送到 `ghcr.io/imi6/zzsai-hlep`（同时支持 amd64 和 arm64）。打 `v1.2.3` 这样的标签还会额外生成 `1.2.3`、`1.2` 版本标签。

```bash
docker pull ghcr.io/imi6/zzsai-hlep:latest
docker run -d --name zzshu-docs -p 8080:80 --restart unless-stopped ghcr.io/imi6/zzsai-hlep:latest
```

然后访问 http://服务器IP:8080 。更新时重新 `pull`，再删掉旧容器、重新 `run`。

也可以用仓库里的 [compose.yaml](compose.yaml)，把它放到服务器上任意目录后执行：

```bash
docker compose up -d                              # 启动
docker compose pull && docker compose up -d       # 更新到最新镜像
docker compose logs -f                            # 查看日志
docker compose down                               # 停止并删除容器
```

端口在 `compose.yaml` 的 `ports` 里改。

镜像的可见性跟随仓库：仓库公开时，任何人都能免登录拉取。仓库改成私有后，服务器要先用有 `read:packages` 权限的 Token 执行 `docker login ghcr.io`。也可以在 GitHub 个人主页 → Packages → zzsai-hlep → Package settings 里单独调整镜像的 Visibility。

本地构建：`docker build -t zzshu-docs .`

### 静态托管

`npm run build` 之后，把 `docs/.vitepress/dist` 部署到任意静态托管（Nginx、Cloudflare Pages、Vercel 等），Nginx 配置可以参考 `docker/nginx.conf`。需要部署在子路径时，在 `config.mts` 里设置 `base`。
