---
title: CC Switch CLI
description: 用 CC Switch 命令行版添加、查看和切换吱吱鼠AI Provider。
---

# CC Switch CLI

CC Switch CLI 是命令行版，适合服务器、远程开发机等不方便开图形界面的环境。它来自独立的 [CC Switch CLI 项目](https://github.com/SaladDay/cc-switch-cli)，和桌面版分开发布，版本号也不通用。

桌面版和 CLI 版可能读写同一份配置，一台机器上一次只用其中一种。

::: warning 以 --help 为准
不同版本的子命令可能有变化。下面的命令先用 `--help` 核对，不要猜 Provider ID，也不要把真实 Key 写在命令行参数里，否则它会留在 shell 历史中。
:::

## 1. 安装并检查

从 [官方发布页](https://github.com/SaladDay/cc-switch-cli/releases) 下载与系统架构匹配的版本，解压后查看帮助：

```bash
cc-switch --version
cc-switch --help
cc-switch provider --help
```

## 2. 备份

先备份客户端配置，再备份 CLI 自己的数据：

::: code-group

```bash [macOS / Linux]
mkdir -p "$HOME/cc-switch-backup"
cp -p ~/.claude/settings.json "$HOME/cc-switch-backup/claude-settings.json" 2>/dev/null || true
cp -p ~/.codex/config.toml "$HOME/cc-switch-backup/codex-config.toml" 2>/dev/null || true
cc-switch config path
cc-switch config backup
```

```powershell [Windows PowerShell]
$bak = "$HOME\cc-switch-backup"
New-Item -ItemType Directory -Force $bak | Out-Null
if (Test-Path "$HOME\.claude\settings.json") { Copy-Item "$HOME\.claude\settings.json" "$bak\claude-settings.json" }
if (Test-Path "$HOME\.codex\config.toml") { Copy-Item "$HOME\.codex\config.toml" "$bak\codex-config.toml" }
cc-switch config path
cc-switch config backup
```

:::

CLI 数据备份不能代替客户端配置的备份，两份都要留。

## 3. 创建专用 API Key

打开 [令牌页面](https://zzshu.cc/console/token) 创建 Key：

| 客户端 | 分组示例 | 模型示例 |
| --- | --- | --- |
| Claude Code | `Claude Max` | `claude-sonnet-4-6` |
| Codex | `GPT Pro稳定` | `gpt-5.6-sol` |

模型 ID 以 [模型广场](https://zzshu.cc/pricing) 为准。

## 4. 添加 Claude Code Provider

直接运行 `cc-switch` 进入交互界面，选 Providers，新增自定义 Provider，按提示填写：

```text
Name:     吱吱鼠AI
Base URL: https://zzshu.cc
API Key:  YOUR_ZZSHU_API_KEY
Model:    claude-sonnet-4-6
```

Claude Code 走 Anthropic 协议，Base URL 填根地址，不加 `/v1`。

保存后把 `吱吱鼠AI` 切换为当前 Provider，完全退出 Claude Code 再重新启动。

## 5. 添加 Codex Provider

用 `--app codex` 指定 Codex 分支，再按交互提示添加：

```bash
cc-switch --app codex provider add
```

Codex 走 Responses 协议，Base URL 填 `https://zzshu.cc/v1`，模型填支持 Responses 的 ID，例如 `gpt-5.6-sol`。

可用线路（Codex 在后面加 `/v1`）：

<RouteTable />

## 6. 查看和切换

```bash
cc-switch --app codex provider list
cc-switch --app codex provider current
```

先从 `provider list` 的输出里拿到真实的 Provider ID，再用它切换或启动。

- `provider switch` 会改全局选择，之后所有会话都用这个 Provider。
- 只想影响一次会话时，用 `start`。先看帮助确认参数：

```bash
cc-switch start codex --help
cc-switch start claude --help
```

改完后可以检查配置是否有效：

```bash
cc-switch config validate
```

## 7. 验证

启动 Claude Code 或 Codex，发一条短消息。收到回复后打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。不要为了排查把真实 Key 打印到终端。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 命令不存在或参数报错 | 当前版本的子命令可能不同，以 `--help` 输出为准 |
| 切换后客户端没变化 | 完全退出客户端进程后重开；确认 `provider current` 是 `吱吱鼠AI` |
| Claude Code 报 404 | Base URL 多写了 `/v1`，改回根地址 |
| Codex 报 404 | Base URL 写成了 `/v1/v1`，或模型不支持 Responses API |
| 桌面版改的配置被覆盖 | 桌面版和 CLI 版同时在用，只保留一种 |

## 恢复

在 CLI 里切回原来的 Provider。需要恢复文件时，先确认 Claude Code、Codex 和 CC Switch 都已退出，再用第 2 步的备份覆盖对应配置文件，步骤见 [通用设置](/integrations/cc-switch/common)。
