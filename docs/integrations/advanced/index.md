---
title: 第三方客户端接入
description: 把吱吱鼠AI 配置到桌面应用、Agent 工具和浏览器扩展。
---

# 第三方客户端接入

这里收集终端 CLI 以外的客户端接入教程。所有客户端用的都是同一个吱吱鼠AI API Key，区别只在协议和地址格式：

- Anthropic Messages 协议填根地址 `https://zzshu.cc`。
- OpenAI 兼容协议填 `https://zzshu.cc/v1`。

开始前先到 [令牌页面](https://zzshu.cc/console/token) 为每个客户端单独建一个 Key，方便在 [使用日志](https://zzshu.cc/console/log) 里区分请求来源，出问题时也能单独停用。

## 桌面应用

| 客户端 | 说明 |
| --- | --- |
| [Claude Desktop](/integrations/advanced/claude-desktop) | 通过 CC Switch 写入第三方配置，并用本地路由把 Claude 角色映射到吱吱鼠AI 的模型 |
| [WorkBuddy](/integrations/advanced/workbuddy) | 在「设置 → 模型」里添加自定义 OpenAI 兼容模型 |
| [AionUI](/integrations/advanced/aionui) | 在模型设置里添加 New API 平台，按模型选择协议 |

## Agent 工具

| 客户端 | 说明 |
| --- | --- |
| [OpenCode](/integrations/advanced/opencode) | 在 `opencode.json` 里添加 OpenAI 兼容 Provider |
| [OpenClaw](/integrations/advanced/openclaw) | 在 `openclaw.json` 里添加 Provider 并设为默认模型 |
| [Hermes](/integrations/advanced/hermes) | 在 `config.yaml` 里添加自定义 Provider |

## 浏览器扩展

| 扩展 | 说明 |
| --- | --- |
| [All API Hub](/integrations/advanced/all-api-hub) | 集中查看余额、管理 Key、查模型，并把配置导出到其他客户端 |

## 跨协议使用

| 文章 | 说明 |
| --- | --- |
| [GPT 模型接入 Claude Code](/integrations/advanced/chatgpt-claude-code) | 让 Claude Code 调用只支持 OpenAI 格式的 GPT 模型 |
| [DeepSeek 接入 Claude Code](/integrations/advanced/deepseek-claude-code) | 在 Claude Code 里使用 DeepSeek 模型 |
| [DeepSeek 接入 Codex](/integrations/advanced/deepseek-codex) | 在 Codex 里使用 DeepSeek 模型 |

## 只在向导里提供的客户端

下面这些客户端配置项少，没有单独写文章。打开向导选好分组和模型，会直接生成要填的字段：

| 客户端 | 说明 |
| --- | --- |
| [Cherry Studio](/integrations/cli/?client=cherry) | 在「设置 → 模型服务」里添加提供商，Claude 模型选 Anthropic 类型，其他选 OpenAI 类型 |
| [ZCode](/integrations/cli/?client=zcode) | 在「模型设置」里添加供应商，地址填 `/v1` |
| [TRAE SOLO](/integrations/cli/?client=trae) | 自定义模型选 Anthropic Messages 格式，Base URL 填根地址 |
| [Cursor](/integrations/cli/?client=cursor) | 打开 Override OpenAI Base URL，填 `/v1` 地址并手动添加模型 |
| [Read Frog](/integrations/cli/?client=readfrog) | 浏览器翻译扩展，Provider 选 Anthropic |
| [Kiss Translator](/integrations/cli/?client=kiss) | 浏览器翻译扩展，服务类型选 Claude，地址填完整的 `/v1/messages` |
| [沉浸式翻译](/integrations/cli/?client=immersive) | 浏览器翻译扩展，自定义 Claude 服务，地址填完整的 `/v1/messages` |

## 通用排查

不管用哪个客户端，先确认三件事：

1. 地址格式和协议对得上，没有写成 `/v1/v1`，也没有漏掉 `/v1`。
2. Key 所在分组里有这个模型。到 [模型广场](https://zzshu.cc/pricing) 核对模型 ID 和支持的端点。
3. 发送消息后，使用日志里出现了对应的请求记录。

更多问题见 [常见问题](/faq/)。
