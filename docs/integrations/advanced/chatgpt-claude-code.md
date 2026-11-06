---
title: GPT 模型接入 Claude Code
description: 用 CC Switch 本地路由做协议转换，让 Claude Code 调用吱吱鼠AI 上只有 OpenAI 格式的模型。
---

# GPT 模型接入 Claude Code

Claude Code 只会发 Anthropic Messages 请求。吱吱鼠AI 上的 GPT、DeepSeek、GLM、Kimi 等模型只提供 OpenAI 格式的端点，不能直接填进 Claude Code 的配置。

要用它们，需要在本机跑一个路由，把 Claude Code 发出的 Anthropic 请求转换成 OpenAI 请求，再转发给吱吱鼠AI。下面用 CC Switch 的本地路由来做。

::: tip 先确认是否需要转换
Claude 系列模型本身就支持 Anthropic 端点，直接按 [Claude Code](/integrations/cli/claude-code) 配置即可，不需要这一页。
:::

<!-- TODO: 按当前 CC Switch 版本核对「API 格式」「本地路由」等选项的实际名称 -->

## 1. 准备

- 装好 Claude Code 和 CC Switch，并确认版本：`claude --version`。
- 按 [CC Switch 通用准备](/integrations/cc-switch/common) 备份 Claude Code 配置。
- 检查有没有残留的 `ANTHROPIC_BASE_URL`、`ANTHROPIC_API_KEY` 等环境变量，方法见 [缓存与代理排查](/integrations/cli/cache-fix)。

## 2. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，创建一个只给这条路由用的 Key。
2. 分组选目标模型所在的分组，例如 `GPT Pro稳定`。
3. 到 [模型广场](https://zzshu.cc/pricing) 复制模型 ID，例如 `gpt-6-sol`。

## 3. 在 CC Switch 里添加 Provider

1. 打开 CC Switch，在顶部选择 Claude Code 分支。
2. 点击添加供应商，选择「自定义配置」。
3. 按下表填写：

| 项目 | 填什么 |
| --- | --- |
| 名称 | `吱吱鼠AI GPT` |
| API Key | 第 2 步创建的 Key |
| 请求地址 | `https://zzshu.cc` |
| API 格式 | OpenAI Chat Completions（需要本地路由转换） |
| 模型 | `gpt-6-sol` |

请求地址的写法以 CC Switch 表单提示为准。可用线路：

<RouteTable />

4. 保存，回到列表后点击「启用」。

<!-- TODO: 截图 CC Switch Claude Code 分支中的吱吱鼠AI GPT Provider -->

## 4. 打开本地路由

1. 在 CC Switch 设置里找到本地路由，打开它。
2. 路由只对 Claude Code 分支启用，避免同时改动其他客户端。
3. 确认路由状态显示为运行中。使用期间 CC Switch 要一直开着，它负责协议转换和上游鉴权。

## 5. 启动 Claude Code

完全退出旧的 Claude Code 和终端，重新打开终端后在临时目录启动：

```bash
mkdir -p /tmp/zzshu-gpt-claude-test && cd /tmp/zzshu-gpt-claude-test
claude
```

## 6. 验证

按下面的顺序检查，每一步都过了才算接通：

1. Claude Code 的 Base URL 指向本地路由地址，不是旧地址，也不是直接指向吱吱鼠AI。
2. 发一条短消息，比如「只回答 2+3 的结果，不要调用工具」，Claude Code 有回复。
3. CC Switch 的路由日志里能看到这次请求被转换并转发到目标模型。
4. 打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态，模型应该是 `gpt-6-sol`，分组是你选的那个。

::: warning
协议转换后，工具调用、思考过程、图片输入等功能不一定和原生 Claude 模型表现一致。先在临时目录测试，不要直接对重要仓库开启自动批准。
:::

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 使用日志里没有记录 | 本地路由没开，或 Claude Code 还在用旧的 Base URL；完全退出后重开 |
| 401 | CC Switch 里填的 Key 不对，重新复制 |
| 403 | 检查余额、令牌分组，以及分组里有没有这个模型 |
| 404 或模型不存在 | 模型 ID 拼错，或 API 格式没选 OpenAI |
| 能对话但工具调用失败 | 转换后的工具调用兼容性有限，换一个模型或改用 Claude 模型 |

## 恢复原配置

1. 在 CC Switch 里切回原来的 Provider。
2. 关闭本地路由。
3. 完全退出 CC Switch 和 Claude Code，再重新打开。

需要直接用 Claude 模型时，回到 [Claude Code](/integrations/cli/claude-code) 按普通方式配置。
