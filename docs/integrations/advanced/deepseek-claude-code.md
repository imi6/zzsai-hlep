---
title: DeepSeek 接入 Claude Code
description: 说明吱吱鼠AI 上的 DeepSeek 模型目前能否直接用于 Claude Code，以及可行的替代做法。
---

# DeepSeek 接入 Claude Code

Claude Code 只发 Anthropic Messages 请求，所以只有支持 Anthropic 端点的模型才能直接填进它的配置。

## 现状

吱吱鼠AI 上的 DeepSeek 模型（`deepseek-v4-pro`、`deepseek-v4.1-flash`、`deepseek-flash` 等，分布在 `DeepSeek`、`DeepSeek官K`、`国模聚合` 分组）**目前只提供 OpenAI 端点**，没有 Anthropic 端点。

把它们直接写进 Claude Code 的 `ANTHROPIC_MODEL`，请求会失败。

<!-- TODO: DeepSeek 分组开放 Anthropic 端点后，补充直连配置 -->

## 怎么确认

模型支持哪些端点会随时调整，以模型广场为准：

1. 打开 [模型广场](https://zzshu.cc/pricing)，搜索 `deepseek`。
2. 看模型标注的端点类型。只写了 OpenAI 的，就不能直连 Claude Code。
3. 如果以后标注了 Anthropic，就可以按 [Claude Code](/integrations/cli/claude-code) 的步骤配置，只把 `ANTHROPIC_MODEL` 换成 DeepSeek 的模型 ID，Base URL 仍然只填根地址：

<RouteTable />

## 现在能怎么用

### 方案 A：协议转换

用 CC Switch 的本地路由，把 Claude Code 的 Anthropic 请求转换成 OpenAI 请求，再发给吱吱鼠AI。步骤和 GPT 模型完全一样，只是分组选 `DeepSeek` 或 `国模聚合`，模型填 `deepseek-v4-pro` 这类 ID。

详细步骤见 [GPT 模型接入 Claude Code](/integrations/advanced/chatgpt-claude-code)。

转换后工具调用、思考过程等功能的表现不一定稳定，先在临时目录里测试。

### 方案 B：换一个原生支持 OpenAI 协议的客户端

如果不是非用 Claude Code 不可，OpenCode、OpenClaw、Hermes 都直接走 OpenAI Chat Completions，可以直接用 DeepSeek 模型，不需要路由：

- [OpenCode](/integrations/advanced/opencode)
- [OpenClaw](/integrations/advanced/openclaw)
- [Hermes Agent](/integrations/advanced/hermes)

## 验证

不管用哪种方案，发一条短消息后都要打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。日志里的模型应该是你选的 DeepSeek 模型 ID。
