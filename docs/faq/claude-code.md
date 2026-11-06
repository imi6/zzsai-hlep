---
title: Claude Code 常见问题
description: 吱吱鼠AI 接入 Claude Code 时的登录冲突、辅助模型、配置来源和状态码排查。
---

# Claude Code 常见问题

Claude Code 的配置项会随版本变化。遇到问题先运行 `claude --version` 和 `claude --help`，确认本机版本和当前用法。还没配置的话，先看 [Claude Code 接入教程](/integrations/cli/claude-code)。

## 连接和登录

### 启动后还是要求登录 Anthropic 账号？

在同一个终端检查环境变量有没有生效：

::: code-group

```bash [macOS / Linux]
test -n "$ANTHROPIC_API_KEY" && echo "API key 已设置"
echo "$ANTHROPIC_BASE_URL"
env | grep -E '^(ANTHROPIC|CLAUDE_CODE)_' | cut -d= -f1
```

```powershell [Windows PowerShell]
if ($env:ANTHROPIC_API_KEY) { 'API key 已设置' }
$env:ANTHROPIC_BASE_URL
Get-ChildItem Env:ANTHROPIC_*, Env:CLAUDE_CODE_* | Select-Object Name
```

:::

常见原因：

- `settings.json` 里的 `env` 字段没有写对，或者改的是另一个环境（WSL 和 Windows 原生是两套目录）。
- 本机残留官方账号的 OAuth 登录状态，优先级盖过了 API Key。
- 同时设置了 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_API_KEY`，两个值不一样。只留一个。
- CC Switch 正在接管配置，手工改的内容被覆盖了。

不要手工编辑 `~/.claude.json` 去跳过首次启动流程，那里面还有会话和项目状态。

### Base URL 该怎么填？

只填根地址 `https://zzshu.cc`。Claude Code 会自己补上 `/v1/messages`，多写 `/v1` 会变成 `/v1/v1/messages`，返回 404。

<RouteTable />

### 怎么绕过 Claude Code 单独测试接口？

先用 curl 确认 Key、分组和模型没问题，再排查 Claude Code 本身：

```bash
curl https://zzshu.cc/v1/models \
  -H "Authorization: Bearer $ANTHROPIC_API_KEY"

curl https://zzshu.cc/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "claude-sonnet-4-6",
    "max_tokens": 64,
    "messages": [{"role": "user", "content": "只回复 OK"}]
  }'
```

`/v1/messages` 能正常返回，问题就在客户端配置；返回错误，按 [状态码](#状态码怎么排查) 处理。

## 模型和计费

### 使用日志里出现了我没选的模型？

Claude Code 除了主会话，还会用模型做标题生成、上下文压缩、子 Agent 等辅助任务，这些任务可能用另一个更小的模型，比如 haiku 系列。紧挨着主请求的少量调用一般是这种情况。

如果你的分组里没有这个辅助模型，辅助任务会报错。可以在 `env` 里把它指定为分组里有的模型：

```json
{
  "env": {
    "ANTHROPIC_MODEL": "claude-sonnet-4-6",
    "ANTHROPIC_DEFAULT_HAIKU_MODEL": "claude-haiku-4-5-20251001"
  }
}
```

上面两个模型都在 `Claude Max` 分组。换了分组的话，到模型广场找该分组里的 haiku 模型 ID。变量名以你本机 Claude Code 版本的文档为准。持续出现大量你不认识的调用时，立即删掉这个 Key，检查是不是泄露了。

### 哪些模型能在 Claude Code 里用？

模型广场里端点标注了 `anthropic` 的模型都可以，例如 `Claude Max` 分组的 `claude-sonnet-4-6`、`claude-opus-4-7`，`Claude KIRO正价稳定版` 分组的 `claude-sonnet-4.6`。注意 `claude-sonnet-4-6` 和 `claude-sonnet-4.6` 是不同的模型 ID，不同分组用的写法不一样，以模型广场为准。

GPT 模型不支持 Anthropic 协议，要接进来见 [GPT 模型接入 Claude Code](/integrations/advanced/chatgpt-claude-code)。DeepSeek 见 [DeepSeek 接入 Claude Code](/integrations/advanced/deepseek-claude-code)。

### 怎么换模型？

改 `ANTHROPIC_MODEL` 后重启，或者在会话里用 `/model` 切换，也可以启动时加参数：

```bash
claude --model claude-opus-4-7
```

模型必须在当前 Key 的分组里。

### 缓存命中率低、费用偏高？

见 [缓存修复](/integrations/cli/cache-fix)。

## 配置来源

### 配置文件在哪？

| 系统 | 路径 |
| --- | --- |
| macOS / Linux | `~/.claude/settings.json` |
| Windows | `$HOME\.claude\settings.json` |
| WSL | WSL 里的 `~/.claude/settings.json`，和 Windows 那份互不影响 |

修改前先备份，改完完全退出 Claude Code（包括 VS Code 里的）再重开。

### CC Switch 和手工配置冲突了？

1. 完全退出 Claude Code。
2. 在 CC Switch 里关闭对 Claude Code 的接管，或者决定只用 CC Switch。
3. 新开终端，用上面的命令检查 `ANTHROPIC_*` 环境变量。
4. 检查 `~/.bashrc`、`~/.zshrc` 或 PowerShell Profile 里有没有重复的 `export`。
5. 只保留一种配置来源，再启动。

CC Switch 接管期间不要手工改同一个文件。CC Switch 的用法见 [CC Switch 配置 Claude Code](/integrations/cc-switch/claude-code)。

### VS Code 里的 Claude Code 扩展怎么接？

1. 在 VS Code 的集成终端里运行 `claude --version`，确认能找到命令。
2. 在同一个终端检查 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_API_KEY`。
3. 在终端里跑一次 `claude`，确认 CLI 本身能用。
4. 完全退出 VS Code 再打开，让扩展重新读取环境。

扩展弹出官方账号登录框时，不要把吱吱鼠AI 的 Key 填进去，那是 OAuth 登录入口。

## 使用

### 常用命令

```bash
claude                               # 在当前目录启动交互会话
claude "解释这个项目的目录结构"       # 带首条消息启动
claude -p "解释这个函数"             # 输出一次结果后退出
cat build.log | claude -p "找出报错原因"  # 从标准输入读取内容
claude -c                            # 继续当前目录最近一次会话
claude -r <session-id>               # 恢复指定会话
claude --model <model-id>            # 本次会话使用指定模型
claude doctor                        # 检查安装和配置
claude update                        # 更新客户端
```

`--dangerously-skip-permissions` 会跳过所有工具权限确认，只适合在没有重要文件、没有真实凭据的临时沙箱里用。

### 怎么减少非必要请求？

在 `env` 里加这一项，可以关掉遥测、自动更新检查等非必要流量：

```json
{
  "env": {
    "CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC": "1"
  }
}
```

合并进已有的 `env`，不要覆盖 `ANTHROPIC_BASE_URL` 和 `ANTHROPIC_API_KEY`。其他开关按需逐项加，不要整段复制不熟悉的配置。

## 状态码怎么排查

| 状态码 | 原因 | 处理 |
| --- | --- | --- |
| 401 | Key 无效，或者 `ANTHROPIC_AUTH_TOKEN` 和 `ANTHROPIC_API_KEY` 冲突 | 重新复制 Key，删掉多余的凭据变量 |
| 403 | 余额不足、Key 额度用完，或者分组里没有这个模型 | 看完整错误信息，查余额和分组 |
| 404 | Base URL 多写了 `/v1`，或者模型 ID 不对、不支持 Anthropic 协议 | Base URL 改回根地址，到模型广场核对模型 |
| 429 | 请求太快 | 降低并发，不要同时开多个会话跑同一个任务 |
| 5xx | 上游渠道异常 | 稍后重试一次；持续失败换分组 |

通用问题见 [常见问题](/faq/)。

## 还是解决不了

整理这些信息再找客服：`claude --version` 输出、HTTP 状态码、完整错误信息、模型 ID、分组和发生时间。环境变量只写「已设置 / 未设置」，Key 只露末尾几位。
