---
title: 快速开始
description: 从注册到发出第一个请求：充值、创建令牌、选分组、找模型、接入客户端、查日志。
---

# 快速开始

吱吱鼠AI 提供兼容 OpenAI、Anthropic 和 Gemini 格式的模型接口。从注册到发出第一个请求，走完下面六步就行。

## 1. 注册并登录

打开 [吱吱鼠AI 控制台](https://zzshu.cc)，注册账号并登录。<!-- TODO: 运营方补充支持的注册方式 -->

<!-- TODO: 截图 注册登录页 -->

## 2. 充值

到 [充值页面](https://zzshu.cc/console/topup) 充值。余额属于账户，名下所有 Key 共用。支付方式和到账规则以页面显示为准。

第一次用可以先充少量，确认客户端跑通、扣费符合预期再加。

## 3. 创建令牌并选分组

1. 打开 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」。
2. 名称写清用途，比如 `claude-code`、`codex`、`cherry-studio`。
3. 选择分组。分组决定这个 Key 能调用哪些模型，怎么选见下面的 [怎么选分组](#怎么选分组)。
4. 按需设置额度上限和过期时间。
5. 保存后复制 Key（以 `sk-` 开头）。

<!-- TODO: 截图 添加令牌表单 -->

::: warning
一个 Key 只属于一个分组。不同客户端分开建 Key，泄露时只删一个，日志里也好区分。不要把 Key 写进代码仓库或发到群里。
:::

## 4. 在模型广场找模型

打开 [模型广场](https://zzshu.cc/pricing)，搜索要用的模型，记下三样东西：

| 要记的 | 用途 | 例子 |
| --- | --- | --- |
| 模型 ID | 填进客户端配置 | `claude-sonnet-4-6`、`gpt-6-sol`、`gemini-2.5-flash` |
| 所在分组 | 第 3 步创建 Key 时选 | `Claude Max`、`GPT Pro稳定`、`Gemini` |
| 支持的端点 | 决定能用哪些客户端 | anthropic、openai、gemini |

模型 ID 要原样复制。比如 `claude-sonnet-4-6` 和 `claude-sonnet-4.6` 在吱吱鼠AI 是两个不同的模型，分布在不同分组。

也可以用 Key 直接查当前能用的模型：

```bash
curl https://zzshu.cc/v1/models \
  -H "Authorization: Bearer YOUR_ZZSHU_API_KEY"
```

## 5. 选客户端并接入

打开 [客户端接入向导](/integrations/cli/)，依次选模型类型、分组、客户端和线路，向导会生成对应的安装命令和配置。

常用客户端的完整教程：

| 客户端 | 教程 |
| --- | --- |
| Claude Code | [Claude Code](/integrations/cli/claude-code) |
| Codex | [Codex](/integrations/cli/codex) |
| Gemini CLI | [Gemini CLI](/faq/gemini) |
| OpenCode、OpenClaw、Hermes 等 | [进阶客户端](/integrations/advanced/) |
| 用 CC Switch 统一管理 | [CC Switch](/integrations/cc-switch/) |
| 绘图 | [图像生成](/integrations/paint/) |
| 自己写代码调用 | [API 总览](/api/) |

各客户端填的地址不一样，最容易出错的是 `/v1`：

| 客户端类型 | Base URL |
| --- | --- |
| OpenAI SDK、Codex、OpenCode | `https://zzshu.cc/v1` |
| Claude Code、Gemini CLI | `https://zzshu.cc` |

可用线路：

<RouteTable />

## 6. 看使用日志

发出第一条消息后，打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型、分组和状态。日志里有这条记录，才说明请求确实走了吱吱鼠AI。

之后遇到报错或扣费疑问，也先来这里看。出问题时的排查方法见 [常见问题](/faq/)。

<!-- TODO: 截图 使用日志页 -->

## 怎么选分组

分组名决定了两件事：

- **渠道**：请求从哪个上游渠道出去。同一个模型在不同分组走的是不同渠道，稳定性和响应速度会有差别。
- **倍率**：同一个模型在不同分组的扣费倍率不同。

吱吱鼠AI 的分组大致按模型系列划分：

| 系列 | 分组举例 | 适合 |
| --- | --- | --- |
| Claude | `Claude Max`、`Claude Max-2`、`Claude KIRO正价稳定版` | Claude Code、TRAE SOLO 等 Anthropic 协议客户端 |
| GPT | `GPT Pro稳定`、`GPT Pro`、`GPT Plus`、`Azure-GPT` | Codex、OpenAI SDK |
| Gemini | `Gemini`、`Gemini-Vertex`、`Gemini-Ultra` | Gemini CLI、OpenAI 兼容客户端 |
| Grok | `Grok Heavy`、`Grok Free` | OpenAI 兼容客户端 |
| 国产模型 | `国模聚合`、`DeepSeek`、`GLM`、`Kimi` | 通用对话和编程 |
| 图像 | `Azure-GPT`（gpt-image 系列）、`Gemini`（Gemini 图像模型） | 绘图 |

选分组的步骤：

1. 先定模型，在模型广场看它在哪些分组里。
2. 模型出现在多个分组时，对比控制台上的倍率和分组说明。
3. 新分组先用一个小任务试，确认稳定再跑大任务。
4. 不想手动选的话可以用 `auto` 分组，它会在多个分组间自动挑选，默认低价优先，也可以在控制台设置主用和备用顺序。

各分组的倍率会调整，以控制台显示为准。
