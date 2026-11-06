---
title: Codex App 接入
description: 让 Codex 桌面应用沿用已经配置好的吱吱鼠AI Codex Provider。
---

# Codex App 接入

Codex 桌面应用（Codex App）可以读取 Codex CLI 的 Provider 配置。先把 CLI 配通，再打开桌面应用。

开始前完成 [Codex 手动接入](/integrations/cli/codex) 或 [CC Switch 配置 Codex](/integrations/cc-switch/codex)，并确认在终端里运行 `codex` 能正常回复。CC Switch 只是管理配置的一种方式，不是必需的。

## 1. 确认 CLI 可用

1. 确认 Codex CLI 当前用的是 `吱吱鼠AI` Provider。用 CC Switch 的话，在 Codex 分支确认卡片显示「使用中」。
2. 在终端运行 `codex`，发一条消息，确认有回复。

## 2. 重启 Codex App

1. 完全退出 Codex App。只关窗口时后台进程可能还在，旧配置不会被重新读取。
2. 重新打开 Codex App，新建对话，发一条短消息。

## 3. 首次启动出现登录页

如果应用提供「使用 API Key」或其他登录方式：

1. 选 API Key 登录。
2. 填为 Codex 单独创建的吱吱鼠AI Key。
3. 进入应用后发一条测试消息。

如果当前版本只能用 OpenAI 账号登录，或者不读取自定义 Provider，就先继续用 Codex CLI，等客户端正式支持。不要改 OAuth 文件、系统代理或应用资源来绕过登录。

## 4. 验证

收到回复后打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。

::: warning
Codex App 和 Codex CLI 的版本可能读取不同的配置或登录状态。CLI 能用，不代表桌面应用一定支持自定义 Provider，以应用里的实际回复和使用日志为准。
:::

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 切换 Provider 后没生效 | 完全退出 Codex App，确认 CC Switch 卡片或 `config.toml` 里是 `吱吱鼠AI`，确认 CLI 还能用，再打开应用 |
| 应用里有回复但使用日志里没有记录 | 应用可能还在用官方账号，检查登录状态 |
| 只有 OpenAI 账号登录入口 | 当前版本不支持自定义 Provider，继续用 Codex CLI |
| 404 或模型不存在 | 回到 CLI 排查地址和模型，见 [Codex 常见问题](/faq/codex) |

## 恢复

在 CC Switch 的 Codex 分支启用原来的 Provider，或者用备份恢复 `~/.codex/config.toml` 和 `~/.codex/auth.json`，然后完全退出并重开 Codex App。步骤见 [通用设置](/integrations/cc-switch/common)。
