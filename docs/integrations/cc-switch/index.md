---
title: CC Switch
description: 用 CC Switch 管理吱吱鼠AI 在 Claude Code、Codex、Claude Desktop 里的配置，并在卡片上查看令牌用量。
---

# CC Switch

[CC Switch](https://github.com/farion1231/cc-switch) 是一个开源桌面工具，用图形界面管理 Claude Code、Codex、Claude Desktop 等客户端的 Provider 配置。添加一次吱吱鼠AI，之后点一下就能在吱吱鼠AI 和其他 Provider 之间切换，不用手改配置文件。

不想装额外工具的话，也可以手动配置，见 [Claude Code](/integrations/cli/claude-code) 和 [Codex](/integrations/cli/codex)。两种方式选一种，不要同时用，否则配置会互相覆盖。

## 建议阅读顺序

1. [通用设置](/integrations/cc-switch/common)：安装 CC Switch、备份原配置、添加 Provider 的通用步骤。**先读这篇。**
2. 按要接入的客户端选一篇：

| 文章 | 说明 |
| --- | --- |
| [Claude Code](/integrations/cc-switch/claude-code) | Anthropic 协议，请求地址填根地址 |
| [Codex](/integrations/cc-switch/codex) | Responses 协议，请求地址填 `/v1` |
| [Codex App](/integrations/cc-switch/codex-app) | 让 Codex 桌面应用沿用 Codex CLI 的配置 |
| [Claude Desktop](/integrations/cc-switch/claude-desktop) | 独立的 Claude Desktop 分支，需要模型映射和本地路由 |

3. 可选：

| 文章 | 说明 |
| --- | --- |
| [用量查询](/integrations/cc-switch/usage-query) | 在 Provider 卡片上显示当前 Key 的已用和剩余额度 |
| [CC Switch CLI](/integrations/cc-switch/cli) | 命令行版，适合服务器或不方便开图形界面的环境 |

## 地址规则

| 客户端协议 | 请求地址 |
| --- | --- |
| Anthropic Messages（Claude Code、Claude Desktop） | `https://zzshu.cc`，不加任何路径 |
| OpenAI / Responses（Codex） | `https://zzshu.cc/v1`，只保留一个 `/v1` |

可用线路：

<RouteTable />

## 验证

CC Switch 里显示「使用中」只说明配置写进去了。在客户端发一条消息，再到 [使用日志](https://zzshu.cc/console/log) 核对请求时间、模型和状态，有记录才算接入成功。
