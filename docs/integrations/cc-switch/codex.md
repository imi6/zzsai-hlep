---
title: CC Switch 配置 Codex
description: 用 CC Switch 把吱吱鼠AI 的 Responses Provider 配置到 Codex CLI。
---

# CC Switch 配置 Codex

Codex 使用 OpenAI Responses API，**请求地址要带 `/v1`**。用 CC Switch 配置时不需要手改 `~/.codex/config.toml`。

想手动配置的话，看 [Codex 手动接入](/integrations/cli/codex)，两种方式不要同时用。

## 1. 准备

1. 安装 Codex CLI 和 CC Switch。
2. 完全退出正在运行的 Codex。
3. 按 [通用设置](/integrations/cc-switch/common) 备份 `~/.codex/config.toml` 和 `~/.codex/auth.json`。切换 Provider 会改写这两个文件。

## 2. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」，名称写 `cc-switch-codex`。
2. 分组选 GPT 分组，例如 `GPT Pro稳定`。
3. 到 [模型广场](https://zzshu.cc/pricing) 确认这个分组里支持 Responses API 的模型 ID，例如 `gpt-5.6-sol`。

模型 ID 区分大小写，照模型广场里的写法复制，不要按显示名称自己缩写。

## 3. 添加 Provider

1. 打开 CC Switch，在顶部应用栏选 **Codex**。
2. 点右上角 `+`，选「自定义配置」。
3. 按下表填写：

| 字段 | 填什么 |
| --- | --- |
| 供应商名称 | `吱吱鼠AI` |
| 官网链接 | `https://zzshu.cc` |
| API Key | 第 2 步创建的 Key |
| 请求地址 | `https://zzshu.cc/v1` |
| 默认模型 | `gpt-5.6-sol`，或你在模型广场查到的 ID |

可用线路：

<RouteTable suffix="/v1" />

地址末尾只保留一个 `/v1`。

4. 点击「添加」。

<!-- TODO: 截图 CC Switch Codex Provider 表单（Key 打码） -->

## 4. 启用并启动

1. 回到 Provider 列表，点 `吱吱鼠AI` 卡片的「启用」，确认显示「使用中」。
2. 完全退出并重新打开终端，运行：

```bash
codex
```

## 5. 验证

发一条短消息，收到回复后打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。

CC Switch 显示「使用中」只说明配置写进去了。Codex 收到回复、日志里有对应的成功记录，才算接入完成。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 401 | Key 无效或复制不完整，或者 Codex 还在用旧的登录信息 |
| 403 | 检查余额、令牌分组，以及分组里有没有这个模型 |
| 404 | 请求地址写成了 `/v1/v1`，或者模型不支持 Responses API |
| 仍然走官方 Provider | 完全退出 Codex，确认 `吱吱鼠AI` 卡片是「使用中」 |
| 切换后没变化 | 退出后台还在运行的 Codex 或编辑器插件，再重新启动 |

更多问题见 [Codex 常见问题](/faq/codex)。想在卡片上看额度，见 [用量查询](/integrations/cc-switch/usage-query)。

## 恢复

在 CC Switch 的 Codex 分支启用原来的 Provider，完全退出 Codex 后重开。需要恢复文件时，按 [通用设置](/integrations/cc-switch/common) 里的恢复步骤用备份覆盖 `~/.codex/config.toml` 和 `~/.codex/auth.json`。
