---
title: Codex
description: 在终端里把 Codex CLI 接到吱吱鼠AI 的 OpenAI Responses 接口。
---

# Codex

Codex CLI 使用 OpenAI Responses API。它会在 Base URL 后面补上 `/responses`，所以 **Base URL 要带 `/v1`**，和 Claude Code 正好相反。

::: tip 想省事？
打开 [客户端接入向导](/integrations/cli/?client=codex)，选好分组和模型后会直接生成下面所有命令和配置。
:::

## 1. 安装并检查版本

```bash
node --version
npm install -g @openai/codex
codex --version
```

升级后如果参数变了，先运行 `codex --help` 核对当前用法。

## 2. 创建专用 API Key

1. 打开控制台的 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」。
2. 名称写成 `codex`，只给 Codex 用。
3. 分组选择 GPT 分组，例如 `GPT Pro稳定`、`GPT Pro`。
4. 到 [模型广场](https://zzshu.cc/pricing) 复制这个分组下支持 Responses 端点的模型 ID，例如 `gpt-6-sol`。

::: warning
模型必须支持 OpenAI Responses 端点。只有 Chat Completions 端点的模型（比如目前的 DeepSeek、GLM、Kimi）不能直接用于 Codex，原因见 [DeepSeek 接入 Codex](/integrations/advanced/deepseek-codex)。
:::

## 3. 备份并打开配置

::: code-group

```bash [macOS / Linux]
mkdir -p ~/.codex
cp ~/.codex/config.toml ~/.codex/config.toml.bak 2>/dev/null || true
nano ~/.codex/config.toml
```

```powershell [Windows PowerShell]
New-Item -ItemType Directory -Force "$HOME\.codex" | Out-Null
if (Test-Path "$HOME\.codex\config.toml") { Copy-Item "$HOME\.codex\config.toml" "$HOME\.codex\config.toml.bak" }
notepad "$HOME\.codex\config.toml"
```

:::

文件里已有 MCP、沙箱或项目信任设置的话，保留它们。

## 4. 写入配置

把下面的内容合并进 `config.toml`。`model_provider` 和 `model` 是顶层字段，要放在所有 `[...]` 节的前面：

```toml
model_provider = "zzshu"
model = "gpt-6-sol"

[model_providers.zzshu]
name = "吱吱鼠AI"
base_url = "https://zzshu.cc/v1"
env_key = "ZZSHU_API_KEY"
wire_api = "responses"
```

| 字段 | 填什么 |
| --- | --- |
| `model_provider` | 下面节名里的 ID，这里是 `zzshu` |
| `model` | 支持 Responses 端点的模型 ID |
| `base_url` | 线路地址加 `/v1`，见下表 |
| `env_key` | 存放 Key 的环境变量名，不是 Key 本身 |
| `wire_api` | 固定写 `"responses"` |

可用线路：

<RouteTable suffix="/v1" />

## 5. 设置 Key 并启动

在同一个终端里设置环境变量，再启动 Codex：

::: code-group

```bash [macOS / Linux]
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'
mkdir -p /tmp/zzshu-codex-test && cd /tmp/zzshu-codex-test
codex
```

```powershell [Windows PowerShell]
$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'
New-Item -ItemType Directory -Force "$env:TEMP\zzshu-codex-test" | Out-Null
Set-Location "$env:TEMP\zzshu-codex-test"
codex
```

:::

这样设置的变量只在当前终端有效，Key 不会写进配置文件。想长期生效，macOS / Linux 可以把 `export` 那行加到 `~/.zshrc` 或 `~/.bashrc`；Windows 可以运行 `setx ZZSHU_API_KEY "YOUR_ZZSHU_API_KEY"`，然后重新打开终端。

## 6. 验证

在 Codex 里输入：

```text
只回答 2+3 的结果，不要运行命令。
```

收到回复后，打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。日志里有这条记录，才说明请求确实走了吱吱鼠AI。

## 使用其他兼容模型

只要模型支持 Responses 端点，就可以替换 `model`，其他字段不变。例如 Grok 分组（`Grok Heavy`、`Grok Free`）下的 `grok-4.6` 也支持 Responses。换分组后要用对应分组的 Key。

不能只凭模型名判断是否支持，以模型广场标注的端点为准。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 仍然要求登录 OpenAI 账号 | 检查顶层 `model_provider = "zzshu"` 是否写在所有 `[...]` 节之前，完全退出后重开 |
| 401 | 环境变量要在启动 Codex 的同一个终端里设置；重新复制 Key，检查空格 |
| 403 | 检查余额、令牌分组，以及分组里有没有这个模型 |
| 404 | `base_url` 漏了 `/v1` 或写成了 `/v1/v1`；也可能是模型不支持 Responses |
| 配置解析失败 | 检查 TOML 引号和节名，运行 `codex --help` 对照当前版本 |

更多问题见 [Codex 常见问题](/faq/codex)。需要在多个 Provider 之间切换时，可以用 [CC Switch 配置 Codex](/integrations/cc-switch/codex)。

## 恢复原配置

::: code-group

```bash [macOS / Linux]
mv ~/.codex/config.toml.bak ~/.codex/config.toml
unset ZZSHU_API_KEY
```

```powershell [Windows PowerShell]
Move-Item -Force "$HOME\.codex\config.toml.bak" "$HOME\.codex\config.toml"
Remove-Item Env:ZZSHU_API_KEY
```

:::

没有备份文件时，删掉顶层的 `model_provider`、`model` 和 `[model_providers.zzshu]` 整节。不要删除整个 `~/.codex` 目录，里面还有登录状态和会话记录。
