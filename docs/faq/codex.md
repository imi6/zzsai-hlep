---
title: Codex 常见问题
description: 吱吱鼠AI 接入 Codex CLI 和 VS Code 扩展时的配置、环境变量、Responses 协议和状态码排查。
---

# Codex 常见问题

Codex 的配置项会随版本变化。遇到问题先运行 `codex --version`，再对照 [Codex 接入教程](/integrations/cli/codex) 检查配置。

## 配置

### 最小配置是什么？

`~/.codex/config.toml` 里有这几项就够了：

```toml
model_provider = "zzshu"
model = "gpt-6-sol"

[model_providers.zzshu]
name = "吱吱鼠AI"
base_url = "https://zzshu.cc/v1"
env_key = "ZZSHU_API_KEY"
wire_api = "responses"
```

| 字段 | 说明 |
| --- | --- |
| `model_provider` | 指向下面 `[model_providers.zzshu]` 这一段 |
| `model` | Key 所在分组里的模型 ID，从模型广场复制 |
| `base_url` | 要带 `/v1`，Codex 会在后面补 `/responses` |
| `env_key` | Codex 从这个环境变量读 Key，配置文件里不出现真实 Key |
| `wire_api` | 必须是 `"responses"` |

可用线路：

<RouteTable suffix="/v1" />

修改前先备份 `config.toml` 和 `auth.json`，不要覆盖已有的官方登录。

### 配置文件在哪？

| 系统 | 路径 |
| --- | --- |
| macOS / Linux | `~/.codex/config.toml`、`~/.codex/auth.json` |
| Windows | `$HOME\.codex\config.toml`、`$HOME\.codex\auth.json` |

### 每次开终端都要重新设置 Key？

`export` 和 `$env:` 只对当前终端有效。想长期生效：

::: code-group

```bash [macOS / Linux]
echo "export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'" >> ~/.zshrc   # bash 用户改成 ~/.bashrc
source ~/.zshrc
```

```powershell [Windows PowerShell]
[Environment]::SetEnvironmentVariable('ZZSHU_API_KEY', 'YOUR_ZZSHU_API_KEY', 'User')
# 设置后重新打开终端和 VS Code
```

:::

更多环境变量的写法见 [环境变量配置](/integrations/cli/environment)。

### 提示找不到 ZZSHU_API_KEY？

Codex 是在启动时读取环境变量的。检查：

1. 设置变量和启动 `codex` 是不是同一个终端。
2. 写进 Profile 之后有没有重新打开终端。
3. 变量名和 `env_key` 是不是完全一致，包括大小写。

## 模型

### 哪些模型能在 Codex 里用？

Codex 只走 Responses 协议（`/v1/responses`），模型必须支持这个端点。吱吱鼠AI 的 GPT 分组，比如 `GPT Pro稳定`、`GPT Pro`、`GPT Plus`，里面有 `gpt-6-sol`、`gpt-6.1-sol`、`gpt-5.6-sol`、`gpt-6-astra` 等模型。`Grok Heavy` 分组的 `grok-4.7` 也标注了 Responses 端点。

模型广场的端点标注可能还没补全，最终以实际请求为准。先用 curl 测一下：

```bash
curl https://zzshu.cc/v1/responses \
  -H "Authorization: Bearer $ZZSHU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model": "gpt-6-sol", "input": "只回复 OK"}'
```

能返回内容，这个模型就能在 Codex 里用。

### 能用 Claude 或 DeepSeek 吗？

Claude 模型不支持 Responses 协议，不能直接填进 Codex。DeepSeek 需要额外配置，见 [DeepSeek 接入 Codex](/integrations/advanced/deepseek-codex)。

### 使用日志里一次对话有很多条记录？

Codex 一次任务会发多条请求：读文件、执行命令、工具调用、上下文压缩都会产生新的请求。紧挨着的多条记录一般属于同一个任务。判断扣费是否异常，要看模型、token 数和分组倍率，不能只看条数。出现大量不认识的请求时，先删掉 Key 再排查。

## 环境变量冲突

### Codex 还在用官方账号或旧地址？

检查有没有残留的 `OPENAI_*` 变量：

::: code-group

```bash [macOS / Linux]
env | grep -E '^(OPENAI|ZZSHU)_' | cut -d= -f1
```

```powershell [Windows PowerShell]
Get-ChildItem Env:OPENAI_*, Env:ZZSHU_* | Select-Object Name
```

:::

然后：

1. 完全退出 Codex 和 VS Code。
2. 如果在用 CC Switch，关闭它对 Codex 的接管，或者只用 CC Switch 管理，见 [CC Switch 配置 Codex](/integrations/cc-switch/codex)。
3. 检查 shell Profile、系统环境变量、IDE 启动环境里有没有重复设置。
4. 只保留一种配置来源，重新打开。

### VS Code 扩展和 CLI 表现不一样？

扩展可能有自己的配置、登录状态和启动环境。在 VS Code 的集成终端里运行 `codex --version` 和上面的 curl 命令，结果和外部终端一致再继续排查。不要去改扩展打包好的 JavaScript 文件来解锁模型，这不会增加服务端权限，还会在升级时出问题。Codex 桌面应用的配置见 [CC Switch 配置 Codex App](/integrations/cc-switch/codex-app)。

## 任务

### 任务卡住或一直重试？

1. 按 `Ctrl+C` 或界面上的停止按钮中断。
2. 记下最后一条错误信息和已经改过的文件。
3. 查余额、Key 额度和分组。
4. 把任务拆小，再试一次。
5. 连续失败就停下来，不要让它反复自动重试，带上错误信息联系客服。

### 怎么让任务更稳？

- 开始前写清目标、可以改哪些文件、怎么算完成。
- 拆成能单独验证的小步骤，每一步跑测试、看 diff。
- 上下文快满时，保存进度，另开一个新任务继续，不要靠反复压缩硬撑。

## 状态码怎么排查

| 状态码 | 原因 | 处理 |
| --- | --- | --- |
| 401 | Key 没读到、填错，或者 `OPENAI_API_KEY` 等变量在干扰 | 检查 `ZZSHU_API_KEY` 是否在当前终端生效 |
| 403 | 余额不足、Key 额度用完，或者分组里没有这个模型 | 看完整错误信息，查余额和分组 |
| 404 | `base_url` 漏了 `/v1`，或者模型不支持 Responses 协议 | 改成 `https://zzshu.cc/v1`，用上面的 curl 测模型 |
| 429 | 请求太快 | 降低并发，隔几秒再试 |
| 5xx | 上游渠道异常 | 稍后重试一次；持续失败换分组 |
| Connection failed | 网络、代理或证书问题 | 先用 curl 测同一个地址，再查代理和 DNS |

通用问题见 [常见问题](/faq/)。
