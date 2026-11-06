---
title: Claude Code
description: 在终端里把 Claude Code 接到吱吱鼠AI 的 Anthropic Messages 接口。
---

# Claude Code

Claude Code 使用 Anthropic Messages 协议。它会在 Base URL 后面自动补上 `/v1/messages`，所以 **Base URL 只填根地址**，不要带 `/v1`。

::: tip 想省事？
打开 [客户端接入向导](/integrations/cli/?client=claude)，选好分组和模型后会直接生成下面所有命令和配置。
:::

## 1. 安装并检查版本

Claude Code 需要 Node.js 18 或更新版本。

```bash
node --version
npm install -g @anthropic-ai/claude-code
claude --version
```

升级后如果界面或参数变了，先运行 `claude --help` 核对当前用法。

## 2. 创建专用 API Key

1. 打开吱吱鼠AI 控制台的 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」。
2. 名称写成 `claude-code` 这样好认的名字，只给 Claude Code 用。
3. 分组选择带 Anthropic 端点的 Claude 分组，例如 `Claude Max`、`Claude KIRO正价稳定版`。
4. 到 [模型广场](https://zzshu.cc/pricing) 复制这个分组下的准确模型 ID，例如 `claude-sonnet-4-6`。

::: warning
截图或发给别人排查时，只露出 `sk-` 后面几位，不要发完整 Key。
:::

## 3. 备份并打开配置

::: code-group

```bash [macOS / Linux]
mkdir -p ~/.claude
cp ~/.claude/settings.json ~/.claude/settings.json.bak 2>/dev/null || true
nano ~/.claude/settings.json
```

```powershell [Windows PowerShell]
New-Item -ItemType Directory -Force "$HOME\.claude" | Out-Null
if (Test-Path "$HOME\.claude\settings.json") { Copy-Item "$HOME\.claude\settings.json" "$HOME\.claude\settings.json.bak" }
notepad "$HOME\.claude\settings.json"
```

:::

WSL 和 Windows 原生是两套目录，在哪个环境里运行 `claude`，就改哪个环境的配置。

## 4. 写入配置

把 `env` 字段合并进 `settings.json`。文件里已有插件、Hook 或权限设置的话，保留它们，只加这三项：

```json
{
  "env": {
    "ANTHROPIC_BASE_URL": "https://zzshu.cc",
    "ANTHROPIC_API_KEY": "YOUR_ZZSHU_API_KEY",
    "ANTHROPIC_MODEL": "claude-sonnet-4-6"
  }
}
```

| 字段 | 填什么 |
| --- | --- |
| `ANTHROPIC_BASE_URL` | 线路根地址，见下表 |
| `ANTHROPIC_API_KEY` | 第 2 步创建的专用 Key |
| `ANTHROPIC_MODEL` | 这个 Key 所在分组里支持 Anthropic 端点的模型 ID |

可用线路：

<RouteTable />

macOS / Linux 保存后收紧文件权限：

```bash
chmod 600 ~/.claude/settings.json
```

## 5. 启动 Claude Code

完全退出旧的 Claude Code 进程，重新打开终端，在一个临时目录里启动：

```bash
mkdir -p /tmp/zzshu-claude-test && cd /tmp/zzshu-claude-test
claude
```

## 6. 验证

输入一个不会改动文件的问题：

```text
只回答 2+3 的结果，不要调用工具。
```

收到回复后，打开控制台的 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。日志里有这条记录，才说明请求确实走了吱吱鼠AI。

## 使用其他兼容模型

只要模型支持 Anthropic Messages 端点，就可以替换 `ANTHROPIC_MODEL`，Base URL 不变。模型名里带 DeepSeek、GLM 并不代表它支持 Anthropic 协议，以模型广场里标注的端点为准。

只有 OpenAI 格式的模型（比如 GPT 系列）不能直接填进来，需要走 [GPT 模型接入 Claude Code](/integrations/advanced/chatgpt-claude-code) 的协议转换流程。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 启动后仍然要求登录 Anthropic 账号 | 检查是否残留官方 OAuth 登录、`ANTHROPIC_AUTH_TOKEN` 环境变量，或者 CC Switch 正在接管配置 |
| 401 | 重新复制 Key，检查前后有没有空格 |
| 403 | 检查余额、令牌分组，以及分组里有没有这个模型 |
| 404 | Base URL 多写了 `/v1` 或 `/v1/messages`，改回根地址 |
| 模型不可用 | 到模型广场重新确认模型 ID，不要用已经下线的别名 |

更多问题见 [Claude Code 常见问题](/faq/claude-code)。

## 恢复原配置

```bash
mv ~/.claude/settings.json.bak ~/.claude/settings.json
unset ANTHROPIC_API_KEY ANTHROPIC_BASE_URL ANTHROPIC_MODEL
```

没有备份文件时，只删掉刚加的三个字段。不要删除整个 `~/.claude` 目录，里面还有插件、Hook 和登录状态。
