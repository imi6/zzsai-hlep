---
title: AionUI
description: 在 AionUI 的模型设置里添加吱吱鼠AI，选择模型并开始对话。
---

# AionUI

AionUI 是一个桌面客户端，可以在同一个界面里使用内置 Agent、Claude Code 等工具。本文按 AionUI 的「设置 → 模型 → 添加模型」流程接入吱吱鼠AI。

平台类型有两种选法，地址写法不同：

- **New API**（推荐）：填根地址 `https://zzshu.cc`，再按模型选协议。
- **自定义 OpenAI**：填 `https://zzshu.cc/v1`，只能走 OpenAI 兼容协议。

## 1. 安装 AionUI

从 [AionUI 官方下载页](https://aionui.com/download/) 下载与系统和 CPU 架构匹配的安装包。

Windows 下载 x64 或 arm64 的 `.exe`，运行后按向导安装，完成后从开始菜单启动。macOS 和 Linux 也可以用命令安装：

::: code-group

```bash [macOS]
# 也可以直接下载 Apple Silicon 或 Intel 对应的 .dmg
brew install --cask aionui
```

```bash [Linux (deb)]
# 先下载 amd64 或 arm64 的 .deb
sudo dpkg -i AionUi-*-linux-*.deb
sudo apt-get install -f
```

:::

首次启动会让你选择内置 Agent 或已检测到的 Agent，部分版本还要求先登录 AionUI 账号。这一步和吱吱鼠AI 无关，按自己的需要完成即可。用第三方账号登录 AionUI 前，先看一下它的隐私说明。

## 2. 创建专用 API Key

1. 打开 [模型广场](https://zzshu.cc/pricing)，找到要用的模型，记下完整模型 ID 和它所在的分组。
2. 打开 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」，名称写 `aionui`。
3. 分组选上一步那个模型所在的分组，例如 `Claude Max`、`GPT Pro稳定` 或 `国模聚合`。
4. 复制 Key，不要放进公开截图。

## 3. 打开模型设置

启动 AionUI，点左侧「设置」，打开「模型」（有的版本叫「LLM 配置」），点击「添加模型」。

## 4. 选择平台并填写参数

优先选 **New API**。旧版本没有这一项时，选「自定义（Custom）」，按 OpenAI 兼容方式填写。

::: code-group

```text [New API（推荐）]
名称：     吱吱鼠AI
Base URL:  https://zzshu.cc
API Key:   YOUR_ZZSHU_API_KEY
模型：     从模型广场复制的完整模型 ID
```

```text [自定义 OpenAI]
名称：     吱吱鼠AI
Base URL:  https://zzshu.cc/v1
API Key:   YOUR_ZZSHU_API_KEY
模型：     从模型广场复制的完整模型 ID
```

:::

可用线路（New API 用根地址，自定义 OpenAI 在后面加 `/v1`）：

<RouteTable />

::: warning
New API 填根地址，自定义 OpenAI 填 `/v1`。不要写成 `/v1/v1`。
:::

<!-- TODO: 截图 AionUI 添加模型表单 -->

## 5. 添加模型并选择协议

1. 点模型输入框旁的刷新或添加按钮，选第 2 步记下的模型 ID。
2. 用 New API 平台时，按模型支持的端点选协议：

| 模型 | 协议 | 示例 |
| --- | --- | --- |
| Claude 系列 | Anthropic | `claude-sonnet-4-6` |
| Gemini 系列 | Gemini | `gemini-2.5-pro` |
| GPT、DeepSeek、GLM、Kimi 等 | OpenAI | `gpt-5.6-sol`、`deepseek-v4-pro` |

3. 函数调用、视觉输入、图片生成这些能力，只勾选模型确实支持的。
4. 点击「保存」。

模型支持哪些端点，以模型广场里的标注为准。

## 6. 发送消息

回到主界面新建对话，在输入框附近的模型选择器里选 `吱吱鼠AI` 下刚保存的模型，发一条短消息。

## 7. 验证

收到回复后，打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。模型出现在选择器里只说明配置已保存，收到回复且日志有记录才算调用成功。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 模型列表为空 | 检查 Key 所在分组里有没有这个模型，再核对 Base URL |
| 401 | Key 错误、过期或已停用，重新复制 |
| 404 | 自定义 OpenAI 漏了 `/v1`，或者 New API 多写了 `/v1` |
| Claude 或 Gemini 模型报协议错误 | 在 New API 的模型配置里把协议改成 Anthropic 或 Gemini |
| 已保存但对话里看不到模型 | 确认模型已启用，再检查能力选项 |

官方配置说明见 [AionUI LLM Configuration](https://github.com/iOfficeAI/AionUi/wiki/LLM-Configuration)。

## 恢复

在「设置 → 模型」里删除这个平台或模型，AionUI 原有的 Agent 设置不受影响。不再使用的 Key 可以在令牌页面停用。
