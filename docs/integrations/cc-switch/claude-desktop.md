---
title: CC Switch 配置 Claude Desktop
description: 在 CC Switch 独立的 Claude Desktop 分支里添加吱吱鼠AI，配置模型映射和本地路由。
---

# CC Switch 配置 Claude Desktop

CC Switch 给 Claude Desktop 单独做了一个分支，和 Claude Code 分支互不影响。这个分支会写入 Claude Desktop 的第三方（3P）配置，并通过本地路由把请求转发到吱吱鼠AI。

开始前完成 [通用设置](/integrations/cc-switch/common) 里的安装和备份，并装好 Claude Desktop。Claude Desktop 的安装、官方模式和第三方模式的区别，见 [Claude Desktop 接入](/integrations/advanced/claude-desktop)。

## 1. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」，名称写 `claude-desktop`。
2. 分组选带 Anthropic 端点的 Claude 分组，例如 `Claude Max`。
3. 到 [模型广场](https://zzshu.cc/pricing) 记下要映射的模型 ID，例如 `claude-sonnet-4-6`、`claude-opus-4-6`、`claude-haiku-5-5`。

## 2. 选择 Claude Desktop 分支

1. 完全退出 Claude Desktop。
2. 打开 CC Switch，在顶部应用栏选 **Claude Desktop**。看不到的话，到「设置 → 通用 → 首页显示」确认它没被隐藏。
3. 点右上角 `+`，选「自定义配置」。

已经在 Claude Code 分支配过吱吱鼠AI 的话，可以用导入入口复制过来。导入后逐项核对地址、Key 和模型映射，不要以为同名的配置会自动覆盖。

## 3. 填写 Provider

| 字段 | 填什么 |
| --- | --- |
| 供应商名称 | `吱吱鼠AI` |
| 官网链接 | `https://zzshu.cc` |
| API Key | 第 1 步创建的 Key |
| 请求地址 | `https://zzshu.cc`，不要加 `/v1/messages` |
| API 格式 | Anthropic Messages（原生） |
| 需要模型映射 | 开启 |

可用线路：

<RouteTable />

<!-- TODO: 截图 CC Switch Claude Desktop Provider 表单（Key 打码） -->

## 4. 配置模型映射

Claude Desktop 界面里选的是 Sonnet、Opus、Fable、Haiku 这些角色，CC Switch 会把角色换成吱吱鼠AI 的真实模型 ID。

1. 点「获取模型列表」。
2. 给要用的角色填模型 ID：

| 角色 | 示例模型 ID（`Claude Max` 分组） |
| --- | --- |
| Sonnet | `claude-sonnet-4-6` |
| Opus | `claude-opus-4-6` |
| Haiku | `claude-haiku-5-5` |
| Fable | 留空，或填分组里有的其他模型 |

3. 只想用一个模型的话，至少填一个角色，空着的角色会沿用第一个有效映射。
4. 只有模型确实支持 1M 上下文时才勾选 1M。
5. 保存前核对一遍模型 ID，都要在 Key 所在分组里。

模型映射只换模型名，不做协议转换。只支持 OpenAI 格式的模型映射进来也用不了。

## 5. 启用本地路由

1. 保存 Provider，回到列表启用 `吱吱鼠AI`。
2. 打开「设置 → 路由 → 本地路由」，开启「在主页显示路由开关」。
3. 回到 Claude Desktop 分支，打开本地路由，确认显示运行中。默认监听 `127.0.0.1:15721`。
4. 完全退出 Claude Desktop 后重新打开。

开启模型映射后，Claude Desktop 连接的是本地地址，再由 CC Switch 转发到吱吱鼠AI：

```text
http://127.0.0.1:15721/claude-desktop
```

CC Switch 负责角色映射和上游鉴权，用 Claude Desktop 的时候要一直开着。

<!-- TODO: 截图 CC Switch 本地路由运行中状态 -->

## 6. 验证

1. 打开 Claude Desktop，应该直接进入第三方模式，不出现 Anthropic 登录页。
2. 选一个已映射的角色，发一条短消息。
3. 打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。日志里的模型应该是你给这个角色映射的 ID。

本地路由在运行、Provider 已启用，都不能单独说明接入成功。客户端有回复、日志有记录、模型和映射对得上，才算通了。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 打开后是 Sign in 登录页 | 当前读的是官方配置。在 Claude Desktop 分支启用 `吱吱鼠AI`，完全退出客户端后重开 |
| 窗口空白 | 确认 CC Switch 在运行、本地路由已开、当前 Provider 是 `吱吱鼠AI`，重新启用一次再重启客户端 |
| 日志里没有请求 | 确认改的是 Claude Desktop 分支，不是 Claude Code 分支；确认本地路由在运行 |
| 提示模型不存在 | 重新获取模型列表，确认映射的 ID 在 Key 所在分组里 |
| 本地路由启动失败 | 检查 `15721` 端口是否被其他程序占用，关掉后重新打开本地路由 |

## 恢复

在 Claude Desktop 分支启用「Claude Desktop 官方」，关闭本地路由，完全退出 Claude Desktop 后重开。官方模式不需要吱吱鼠AI 的 Key，用自己的 Anthropic 账号登录即可。

3P 配置文件由 CC Switch 管理，位置见 [Claude Desktop 接入](/integrations/advanced/claude-desktop)。不要手改里面的 Key 或本地路由令牌。
