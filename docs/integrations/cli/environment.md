---
title: CLI 环境检查
description: 配置命令行客户端之前，先检查终端、运行时、网络、令牌和环境变量。
---

# CLI 环境检查

配置任何命令行客户端之前，先花几分钟确认本机环境。大部分「配置好了却连不上」的问题，都出在这一页列出的几个地方。

## 1. 检查终端和运行时

Claude Code、Codex、OpenCode、OpenClaw 都通过 npm 安装，需要 Node.js。各客户端对版本的要求不同，以它们官方文档为准，一般建议 Node.js 20 或更新。

::: code-group

```bash [macOS / Linux]
uname -a
node --version
npm --version
command -v claude codex opencode openclaw kimi grok hermes
```

```powershell [Windows PowerShell]
$PSVersionTable.PSVersion
node --version
npm --version
Get-Command claude,codex,opencode,openclaw,kimi,grok,hermes -ErrorAction SilentlyContinue
```

:::

没有输出的命令表示还没安装，按对应客户端页面先安装。某个客户端要求更高的 Node.js 版本时，用 nvm、fnm 这类版本管理器单独切换，不要直接替换系统里其他项目在用的 Node.js。

WSL 和 Windows 原生是两套独立环境。在 WSL 里装的客户端，配置和环境变量也要在 WSL 里设置。

## 2. 检查网络

::: code-group

```bash [macOS / Linux]
curl -I https://zzshu.cc
```

```powershell [Windows PowerShell]
curl.exe -I https://zzshu.cc
```

:::

能返回 HTTP 状态行就说明网络可达。主站访问慢或不通时，可以换下面的线路，后面所有配置里的地址要跟着一起换：

<RouteTable />

## 3. 检查令牌和模型

到控制台 [令牌页面](https://zzshu.cc/console/token) 创建一个专用 Key，然后用它请求模型列表。下面的命令只在当前终端里保存 Key，不会写进文件。

::: code-group

```bash [macOS / Linux]
read -s ZZSHU_API_KEY
export ZZSHU_API_KEY
curl https://zzshu.cc/v1/models \
  -H "Authorization: Bearer $ZZSHU_API_KEY"
```

```powershell [Windows PowerShell]
$env:ZZSHU_API_KEY = Read-Host -MaskInput "API Key"
curl.exe https://zzshu.cc/v1/models -H "Authorization: Bearer $env:ZZSHU_API_KEY"
```

:::

`Read-Host -MaskInput` 需要 PowerShell 7。Windows PowerShell 5.1 可以直接写成 `$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'`。

返回的列表就是这个 Key 能用的模型。从里面复制准确的模型 ID，再到 [模型广场](https://zzshu.cc/pricing) 确认它支持客户端需要的协议：

| 客户端 | 需要的端点 | 例子 |
| --- | --- | --- |
| Claude Code | Anthropic Messages | `claude-sonnet-4-6` |
| Codex | OpenAI Responses | `gpt-6-sol`、`grok-4.6` |
| OpenCode、OpenClaw、Hermes | OpenAI Chat Completions | `deepseek-v4.1-flash`、`kimi-k3` |
| Kimi Code | 三种任选一种 | 按所选 Provider 类型决定 |

返回 401 说明 Key 不对；列表里没有想要的模型，说明令牌分组不包含它，换一个分组重新建 Key。

## 4. 检查环境变量冲突

旧的 Base URL、Key 或代理变量会覆盖配置文件，导致请求发到别处。

::: code-group

```bash [macOS / Linux]
env | grep -E '^(ANTHROPIC|OPENAI|ZZSHU|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY)='
```

```powershell [Windows PowerShell]
Get-ChildItem Env: | Where-Object { $_.Name -match '^(ANTHROPIC|OPENAI|ZZSHU|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY)' }
```

:::

看到不认识的值时，先找到它从哪来（Shell 配置文件、系统环境变量、CC Switch），确认后再在当前终端临时取消，测试通过后再决定要不要改配置文件。更多排查步骤见 [缓存与代理排查](/integrations/cli/cache-fix)。

## 下一步

环境没问题后，打开 [客户端接入向导](/integrations/cli/) 生成配置，或者直接看对应客户端的页面：[Claude Code](/integrations/cli/claude-code)、[Codex](/integrations/cli/codex)、[Kimi Code](/integrations/cli/kimi-code)、[Grok Build](/integrations/cli/grok-build)。
