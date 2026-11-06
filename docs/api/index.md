---
title: API 总览
description: 吱吱鼠AI 的 Base URL、鉴权方式、主要端点的调用示例和错误码。
---

# API 总览

吱吱鼠AI 基于 New API，提供 OpenAI、Anthropic 和 Gemini 三种格式的标准端点。用同一个 Key 就能调用，能调哪些模型由 Key 的分组决定。

## Base URL

| 协议 | Base URL |
| --- | --- |
| OpenAI 兼容 | `https://zzshu.cc/v1` |
| Anthropic | `https://zzshu.cc`（SDK 自己补 `/v1/messages`） |
| Gemini 原生 | `https://zzshu.cc`（路径从 `/v1beta` 开始） |

可用线路：

<RouteTable />

下文示例都用主站地址，换线路时只换域名部分。

## 鉴权

Key 在 [令牌页面](https://zzshu.cc/console/token) 创建，以 `sk-` 开头。放在请求头里：

| 请求头 | 用于 |
| --- | --- |
| `Authorization: Bearer YOUR_ZZSHU_API_KEY` | 所有端点都可以用，OpenAI SDK 默认用这个 |
| `x-api-key: YOUR_ZZSHU_API_KEY` | Anthropic SDK 默认用这个 |
| `x-goog-api-key: YOUR_ZZSHU_API_KEY` | Google GenAI SDK 默认用这个 |

下面的示例假设已经把 Key 放进环境变量：

```bash
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'
```

不要把 Key 写进前端代码或提交到代码仓库。

## 端点一览

| 方法 | 路径 | 格式 | 用途 |
| --- | --- | --- | --- |
| GET | `/v1/models` | OpenAI | 列出当前 Key 能用的模型 |
| POST | `/v1/chat/completions` | OpenAI | 对话 |
| POST | `/v1/responses` | OpenAI | Responses API，Codex 用这个 |
| POST | `/v1/messages` | Anthropic | 对话，Claude Code 用这个 |
| POST | `/v1/images/generations` | OpenAI | 文生图 |
| POST | `/v1beta/models/{model}:generateContent` | Gemini | Gemini 原生对话和生图 |

模型必须支持对应的端点。在 [模型广场](https://zzshu.cc/pricing) 可以看到每个模型标注的端点。

## GET /v1/models

列出当前 Key 所在分组能用的模型。排查问题时先调这个。

```bash
curl https://zzshu.cc/v1/models \
  -H "Authorization: Bearer $ZZSHU_API_KEY"
```

返回里 `data[].id` 就是可以填进请求的模型 ID。

## POST /v1/chat/completions

OpenAI Chat Completions 格式，大部分模型都支持。

```bash
curl https://zzshu.cc/v1/chat/completions \
  -H "Authorization: Bearer $ZZSHU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-5.6-sol",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

加 `"stream": true` 改为流式返回（SSE）。

## POST /v1/responses

OpenAI Responses 格式。GPT 分组的模型用这个端点，Codex 也走这里。

```bash
curl https://zzshu.cc/v1/responses \
  -H "Authorization: Bearer $ZZSHU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-6-sol",
    "input": "你好"
  }'
```

## POST /v1/messages

Anthropic Messages 格式。Claude 分组的模型支持这个端点。`anthropic-version` 请求头必须带上。

```bash
curl https://zzshu.cc/v1/messages \
  -H "x-api-key: $ZZSHU_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 1024,
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

用 Anthropic SDK 时 `base_url` 填 `https://zzshu.cc`，不要带 `/v1`。

## POST /v1/images/generations

OpenAI Images 格式，用于 `gpt-image-1`、`gpt-image-1.5`、`gpt-image-2`（`Azure-GPT` 分组）。

```bash
curl https://zzshu.cc/v1/images/generations \
  -H "Authorization: Bearer $ZZSHU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "一只戴蓝色毛线帽的小老鼠，扁平插画风格",
    "n": 1
  }'
```

返回的 `data[0]` 里是 `url` 或 `b64_json`。完整说明见 [OpenAI Images 兼容绘图](/integrations/paint/gpt-image)。

## POST /v1beta/models/{model}:generateContent

Gemini 原生格式。模型 ID 写在路径里。Gemini CLI 和 Google GenAI SDK 走这个端点。

```bash
curl "https://zzshu.cc/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: $ZZSHU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "你好"}]}]
  }'
```

流式返回用 `:streamGenerateContent?alt=sse` 替换 `:generateContent`。Gemini 图像模型也用这个端点，见 [Gemini 图像模型绘图](/integrations/paint/banana)。

## 错误码

出错时 HTTP 状态码不是 2xx，响应正文里有错误信息，一般是这个结构：

```json
{
  "error": {
    "message": "错误说明",
    "type": "错误类型",
    "code": "错误代码"
  }
}
```

| 状态码 | 含义 | 常见原因 | 处理 |
| --- | --- | --- | --- |
| 400 | 请求格式错误 | JSON 写错、缺少必填字段、参数值不被模型支持 | 按错误信息修正请求体 |
| 401 | 鉴权失败 | Key 缺失、填错、已删除 | 检查请求头和 Key |
| 403 | 没有权限 | 余额不足、Key 额度用完或已过期、分组里没有这个模型 | 看错误信息，查余额、令牌状态和分组 |
| 404 | 找不到 | 路径错误（多了或少了 `/v1`）、模型 ID 不存在 | 核对路径和模型 ID |
| 413 | 请求太大 | 上下文或上传文件超出限制 | 缩短输入 |
| 429 | 请求太多 | 频率过高，或上游渠道繁忙 | 降低并发，退避重试 |
| 500 | 服务端错误 | 上游或服务端异常 | 稍后重试 |
| 502 / 503 / 504 | 上游不可用或超时 | 上游渠道异常、请求耗时太长 | 稍后重试；持续失败换分组 |

处理建议：

- 401、403、404 重试没有用，先改请求。
- 429 和 5xx 可以重试，每次间隔逐步拉长，比如 1 秒、2 秒、4 秒，最多重试几次。
- 每个请求都能在 [使用日志](https://zzshu.cc/console/log) 里查到，排查时对照时间和模型。

更多排查方法见 [常见问题](/faq/)。
