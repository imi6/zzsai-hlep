---
title: 缓存与代理排查
description: 换了 Provider 却还在请求旧地址时，按顺序检查进程、环境变量和本地代理。
---

# 缓存与代理排查

改完配置后，客户端还在用旧地址、旧 Key，或者使用日志里看不到请求，多半是旧进程、环境变量或本地代理在起作用。按下面的顺序检查，**不要一上来就删整个配置目录**。

## 1. 完全退出客户端

退出 Claude Code、Codex、CC Switch 等所有相关程序，关掉旧终端窗口，再打开一个新的。

客户端只在启动时读取环境变量。旧进程不退出，改了什么都不会生效。

## 2. 检查当前变量

::: code-group

```bash [macOS / Linux]
env | grep -E '^(ANTHROPIC|OPENAI|ZZSHU|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY|NO_PROXY)='
type -a claude codex
```

```powershell [Windows PowerShell]
Get-ChildItem Env: | Where-Object { $_.Name -match '^(ANTHROPIC|OPENAI|ZZSHU|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY|NO_PROXY)' }
[Environment]::GetEnvironmentVariable('ANTHROPIC_BASE_URL', 'User')
[Environment]::GetEnvironmentVariable('OPENAI_BASE_URL', 'User')
Get-Command claude,codex -All -ErrorAction SilentlyContinue
```

:::

重点看这几种情况：

- `ANTHROPIC_BASE_URL`、`OPENAI_BASE_URL` 指向旧地址。环境变量的优先级通常高于配置文件。
- 同时存在 `ANTHROPIC_API_KEY` 和 `ANTHROPIC_AUTH_TOKEN`，客户端可能用了你没想到的那个。
- `type -a` 或 `Get-Command -All` 列出多个同名命令，说明装了多份，实际运行的不一定是你刚升级的那份。
- Windows 上用 `setx` 设过的变量会一直留在用户环境变量里，关掉终端也不会消失。

手动设置的变量和 CC Switch 写入的配置只保留一种来源。确认某个变量没用后，在当前终端临时取消：

::: code-group

```bash [macOS / Linux]
unset ANTHROPIC_BASE_URL ANTHROPIC_AUTH_TOKEN OPENAI_BASE_URL
```

```powershell [Windows PowerShell]
Remove-Item Env:ANTHROPIC_BASE_URL, Env:ANTHROPIC_AUTH_TOKEN, Env:OPENAI_BASE_URL -ErrorAction SilentlyContinue
```

:::

测试通过后，再去 Shell 配置文件或系统环境变量里删掉对应的行。

## 3. 检查本地路由和代理

CC Switch 的本地路由、Clash 等代理软件都会接管请求。

::: code-group

```bash [macOS / Linux]
lsof -nP -iTCP -sTCP:LISTEN | grep -iE 'cc-switch|claude|clash' || true
```

```powershell [Windows PowerShell]
Get-NetTCPConnection -State Listen | Where-Object { $_.LocalAddress -eq '127.0.0.1' } | Select-Object LocalPort, OwningProcess
```

:::

- 用 CC Switch 本地路由时，确认路由开关还开着，当前 Provider 是吱吱鼠AI。
- 改回直连吱吱鼠AI 时，先在 CC Switch 里关掉路由，再重启客户端。
- 系统代理拦截了请求时，可以把 `zzshu.cc` 加到代理的直连规则或 `NO_PROXY` 里。

## 4. 可以清理什么

可以清理：

- 客户端明确标注为 cache、logs 或临时下载的目录。
- 已确认不再使用的当前终端环境变量。
- CC Switch 里不再使用的测试 Provider。

不要删除：

- `~/.claude/settings.json`、`~/.codex/config.toml` 等主配置文件。
- 插件、Hook、MCP、Skills 和登录状态。
- 整个客户端目录（`~/.claude`、`~/.codex` 等）。

需要回到原来的状态时，用配置前做的 `.bak` 备份恢复。

## 5. 重新验证

清理完后，在新终端里启动客户端，发一条短消息，再打开 [使用日志](https://zzshu.cc/console/log) 核对请求时间、模型和状态。日志里还是没有记录，说明请求没有到达吱吱鼠AI，回到第 2 步继续查变量和代理。

环境本身的检查方法见 [CLI 环境检查](/integrations/cli/environment)。
