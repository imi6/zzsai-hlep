---
title: DeepSeek 接入 Codex
description: 说明吱吱鼠AI 上的 DeepSeek 模型目前能否用于 Codex，以及可以改用的客户端。
---

# DeepSeek 接入 Codex

Codex CLI 只走 OpenAI Responses API（配置里的 `wire_api = "responses"`），所以模型必须支持 Responses 端点才能用。

## 现状

吱吱鼠AI 上的 DeepSeek 模型（`deepseek-v4-pro`、`deepseek-v4.1-flash`、`deepseek-flash` 等，分布在 `DeepSeek`、`DeepSeek官K`、`国模聚合` 分组）**目前只提供 OpenAI Chat Completions 端点**，不支持 Responses。

把它们填进 Codex 的 `model`，请求会报错或返回 404。

<!-- TODO: DeepSeek 分组开放 Responses 端点后，补充 Codex 配置 -->

## 怎么确认

模型支持的端点会随时调整，以模型广场为准：

1. 打开 [模型广场](https://zzshu.cc/pricing)，搜索 `deepseek`。
2. 看模型标注的端点类型。没有 Responses 的，不能用于 Codex。
3. 如果以后标注了 Responses，就按 [Codex](/integrations/cli/codex) 的步骤配置，只把 `model` 换成 DeepSeek 的模型 ID，`wire_api` 和带 `/v1` 的 `base_url` 都不变。

## 现在能怎么用

### 改用 Chat Completions 客户端

OpenCode 和 Codex 一样是终端里的编程助手，它走 OpenAI Chat Completions，可以直接用 DeepSeek 模型。配置示例里用的就是 `deepseek-v4.1-flash`：

- [OpenCode](/integrations/advanced/opencode)

其他走 Chat Completions 的客户端也可以：

- [OpenClaw](/integrations/advanced/openclaw)
- [Hermes Agent](/integrations/advanced/hermes)

这些客户端的 Base URL 都要带 `/v1`：

<RouteTable suffix="/v1" />

### 继续用 Codex，换模型

如果主要是想用 Codex，可以换一个支持 Responses 的模型，例如 `GPT Pro稳定` 分组的 `gpt-6-sol`，或 `Grok Heavy` 分组的 `grok-4.6`。配置见 [Codex](/integrations/cli/codex)。

## 验证

发一条短消息后打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。日志里的模型应该和你配置的模型 ID 一致。
