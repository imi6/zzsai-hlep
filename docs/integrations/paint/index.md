---
title: 图像生成
description: 吱吱鼠AI 能用的图像模型、对应分组和调用端点。
---

# 图像生成

吱吱鼠AI 的图像模型分两类，调用方式不一样。按你要用的模型选对应教程。

| 类型 | 模型 ID | 分组 | 调用端点 | 教程 |
| --- | --- | --- | --- | --- |
| OpenAI Images | `gpt-image-1`、`gpt-image-1.5`、`gpt-image-2` | `Azure-GPT` | `POST /v1/images/generations` | [OpenAI Images 兼容绘图](/integrations/paint/gpt-image) |
| Gemini 图像模型 | `gemini-3.1-flash-image` | `Gemini` | `POST /v1beta/models/{model}:generateContent`，也支持 `/v1/chat/completions` | [Gemini 图像模型绘图](/integrations/paint/banana) |

上表来自模型广场的快照。模型和分组会调整，动手前先到 [模型广场](https://zzshu.cc/pricing) 搜一下，确认模型还在、分组没变。

## 先分清两种协议

- **OpenAI Images**：专门的出图接口，请求里只有 `model`、`prompt`、`n`、`size` 这类参数，返回图片的 URL 或 base64。`gpt-image-*` 系列走这条路。
- **Gemini 原生**：和 Gemini 文本对话共用 `generateContent` 接口，图片以 base64 的形式夹在回复内容里。`gemini-3.1-flash-image` 走这条路。

两种协议不能混用。把 `gpt-image-1` 发到 `generateContent`，或者把 Gemini 图像模型发到 `/v1/images/generations`，都会报错。

::: info 关于 gpt-4o-image 这类模型
模型广场里还有 `gpt-4o-image`、`gpt-4o-image-vip`、`gpt-4-dalle`，它们只标注了 `/v1/chat/completions` 端点，没有标注 Images 端点。这类模型按普通对话调用，图片一般以链接或 Markdown 的形式出现在回复文本里。具体返回格式以实际请求为准。
:::

## 通用准备

1. 到 [令牌页面](https://zzshu.cc/console/token) 新建一个绘图专用 Key。用 `gpt-image-*` 就选 `Azure-GPT` 分组，用 Gemini 图像模型就选 `Gemini` 分组。
2. 一个 Key 只能属于一个分组。两类模型都要用的话，建两个 Key。
3. 计费方式（按次还是按量）在模型广场的模型详情里能看到，以控制台显示为准。
4. 生成完成后到 [使用日志](https://zzshu.cc/console/log) 核对模型、状态和扣费。

## 客户端

- **代码调用**：两篇教程都给了 curl 和 Python 示例，也可以打开 [客户端接入向导](/integrations/cli/?client=code)，在「图像生成」分类下选模型，生成调用代码。
- **Cherry Studio**：有现成的绘画界面，两篇教程都写了配置步骤。

## 出图慢或中途断开

图片生成比普通对话慢，单次请求几十秒很常见。如果请求在一分钟左右被切断，先检查本机代理或网关有没有限制长连接，把 `zzshu.cc` 设为直连再试。首次测试把数量设为 1，尺寸和质量用默认值。
