---
title: Kimi Code
description: 在 Kimi Code CLI 里添加吱吱鼠AI Provider，可选 Chat Completions、Responses 或 Anthropic Messages。
---

# Kimi Code

Kimi Code CLI 可以按 Provider 选择三种协议。先在模型广场确认目标模型支持哪种端点，再从下面三份配置里**选一份**，不要三份都粘进去。

<!-- TODO: Kimi Code 更新较快，包名、配置目录和字段名请对照当前官方文档复核 -->

## 1. 安装并检查版本

```bash
node --version
bun add -g @moonshot-ai/kimi-code@latest
kimi --version
kimi --help
```

安装失败或包名有变化时，回到 Kimi Code 官方文档核对安装方式。不要为了它替换系统里的 Node.js。

## 2. 准备 Key 和模型

1. 到 [模型广场](https://zzshu.cc/pricing) 找到目标模型，看它支持哪种端点，记下模型 ID 和上下文长度。
2. 在 [令牌页面](https://zzshu.cc/console/token) 创建一个只给 Kimi Code 用的 Key，分组要包含这个模型。

| 想用的模型 | 分组例子 | 选哪份配置 |
| --- | --- | --- |
| `kimi-k3`、`deepseek-v4.1-flash` | `国模聚合`、`Kimi` | OpenAI Chat Completions |
| `gpt-6-sol` | `GPT Pro稳定` | OpenAI Responses |
| `claude-sonnet-4-6` | `Claude Max` | Anthropic Messages |

## 3. 备份并打开配置

::: code-group

```bash [macOS / Linux]
mkdir -p ~/.kimi-code
cp ~/.kimi-code/config.toml ~/.kimi-code/config.toml.bak 2>/dev/null || true
nano ~/.kimi-code/config.toml
```

```powershell [Windows PowerShell]
New-Item -ItemType Directory -Force "$HOME\.kimi-code" | Out-Null
if (Test-Path "$HOME\.kimi-code\config.toml") { Copy-Item "$HOME\.kimi-code\config.toml" "$HOME\.kimi-code\config.toml.bak" }
notepad "$HOME\.kimi-code\config.toml"
```

:::

## 4. 写入配置

三份配置里，`default_model`、`[models.xxx]` 的名字和 `provider` 字段必须完全一致。`max_context_size` 按模型广场里该模型的实际上下文长度填写，下面的数字只是占位。

::: code-group

```toml [OpenAI Chat Completions]
default_model = "zzshu"

[providers.zzshu]
type = "openai"
base_url = "https://zzshu.cc/v1"
api_key = "YOUR_ZZSHU_API_KEY"

[models.zzshu]
provider = "zzshu"
model = "kimi-k3"
max_context_size = 128000
```

```toml [OpenAI Responses]
default_model = "zzshu"

[providers.zzshu]
type = "openai_responses"
base_url = "https://zzshu.cc/v1"
api_key = "YOUR_ZZSHU_API_KEY"

[models.zzshu]
provider = "zzshu"
model = "gpt-6-sol"
max_context_size = 128000
```

```toml [Anthropic Messages]
default_model = "zzshu"

[providers.zzshu]
type = "anthropic"
base_url = "https://zzshu.cc"
api_key = "YOUR_ZZSHU_API_KEY"

[models.zzshu]
provider = "zzshu"
model = "claude-sonnet-4-6"
max_context_size = 128000
```

:::

<!-- TODO: 确认 max_context_size 的单位和各模型的建议值 -->

两种 OpenAI 协议的地址以 `/v1` 结尾，Anthropic 地址只填根地址。可用线路：

<RouteTable />

这份配置里直接写了 Key。macOS / Linux 保存后收紧权限，也不要把这个文件提交到 Git：

```bash
chmod 600 ~/.kimi-code/config.toml
```

运行 `kimi doctor` 可以检查配置文件能不能被正确读取。

## 5. 启动并验证

在临时目录里启动：

```bash
mkdir -p /tmp/zzshu-kimi-test && cd /tmp/zzshu-kimi-test
kimi
```

选择刚配置的模型，发一个不会改动文件的问题，比如「只回答 2+3 的结果」。收到回复后，打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。

<!-- TODO: 截图 Kimi Code 通过吱吱鼠AI 返回回复 -->

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 启动时报找不到模型 | `default_model`、模型块名和 `provider` 三处名字不一致 |
| 401 | 重新复制 Key，检查引号里有没有空格 |
| 403 | 检查余额、令牌分组，以及分组里有没有这个模型 |
| 404 | OpenAI 协议漏了 `/v1`，或者 Anthropic 协议多写了 `/v1` |
| 请求格式错误 | `type` 和模型支持的端点不匹配，回到第 2 步的表格重新选 |

## 恢复原配置

```bash
mv ~/.kimi-code/config.toml.bak ~/.kimi-code/config.toml
```

没有备份文件时，只删掉刚加的 `[providers.zzshu]`、`[models.zzshu]` 和 `default_model`。不要删除整个 `~/.kimi-code` 目录，里面可能有 MCP、Skills 和登录信息。
