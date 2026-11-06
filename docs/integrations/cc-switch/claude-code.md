---
title: CC Switch 配置 Claude Code
description: 用 CC Switch 把 Claude Code 切换到吱吱鼠AI 的 Anthropic Messages 接口。
---

# CC Switch 配置 Claude Code

Claude Code 走 Anthropic Messages 协议，会在请求地址后面自动补上 `/v1/messages`，所以 **请求地址只填根地址**。

开始前先完成 [通用设置](/integrations/cc-switch/common) 里的安装和备份。想手动改配置文件的话，看 [Claude Code 手动接入](/integrations/cli/claude-code)，两种方式不要同时用。

## 1. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」，名称写 `cc-switch-claude`。
2. 分组选带 Anthropic 端点的 Claude 分组，例如 `Claude Max`、`Claude KIRO正价稳定版`。
3. 到 [模型广场](https://zzshu.cc/pricing) 复制这个分组里的模型 ID，例如 `claude-sonnet-4-6`。

这里要的是 `sk-` 开头的模型 API Key，不是账号访问令牌。

## 2. 添加 Provider

1. 打开 CC Switch，在顶部应用栏选 **Claude Code**，不要选成 Claude Desktop。
2. 点右上角 `+`，选「自定义配置」。
3. 按下表填写：

| 字段 | 填什么 |
| --- | --- |
| 供应商名称 | `吱吱鼠AI` |
| 官网链接 | `https://zzshu.cc` |
| API Key | 第 1 步创建的 Key |
| 请求地址 | `https://zzshu.cc`，不要加 `/v1` 或 `/v1/messages` |

可用线路：

<RouteTable />

4. 表单里有主模型、快速模型之类的模型字段时，填第 1 步查到的模型 ID。不填的话 Claude Code 会用自己内置的默认模型名，这个名字不一定在你的分组里。
5. 没有合并需求就关闭「应用通用配置」，点击「添加」。

API Key 输入框显示为圆点。截图或录屏前确认没有点开明文。

<!-- TODO: 截图 CC Switch Claude Code Provider 表单（Key 打码） -->

## 3. 启用 Provider

1. 回到 Provider 列表，点 `吱吱鼠AI` 卡片右侧的「启用」，确认显示「使用中」。
2. 打开「设置 → 通用」，开启「跳过 Claude Code 初次安装确认」。不开的话，Claude Code 首次启动可能还会跳到官方登录页。

## 4. 启动 Claude Code

完全退出旧的 Claude Code 进程，重新打开终端：

```bash
claude --version
claude
```

启动后界面顶部会显示版本、当前模型和工作目录，不应该再出现官方登录页。

## 5. 验证

在 Claude Code 里发一条不会改文件的消息：

```text
只回答 2+3 的结果，不要调用工具。
```

收到回复后打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。

如果 Claude Code 里调不通，可以绕开客户端，直接用同一个 Key 测接口：

::: code-group

```bash [macOS / Linux]
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'
curl https://zzshu.cc/v1/messages \
  -H "x-api-key: $ZZSHU_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "Content-Type: application/json" \
  -d '{"model":"claude-sonnet-4-6","max_tokens":16,"messages":[{"role":"user","content":"ping"}]}'
```

```powershell [Windows PowerShell]
$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'
$body = '{"model":"claude-sonnet-4-6","max_tokens":16,"messages":[{"role":"user","content":"ping"}]}'
Invoke-RestMethod https://zzshu.cc/v1/messages -Method Post `
  -Headers @{ "x-api-key" = $env:ZZSHU_API_KEY; "anthropic-version" = "2023-06-01" } `
  -ContentType "application/json" -Body $body
```

:::

接口能通、Claude Code 不通，问题在 CC Switch 或 Claude Code 的配置；接口也不通，问题在 Key、分组或模型。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 仍然出现官方登录 | 检查「跳过初次安装确认」是否开启、卡片是否「使用中」，以及有没有其他地方设置了 `ANTHROPIC_BASE_URL` 或 `ANTHROPIC_AUTH_TOKEN` 环境变量 |
| CC Switch 自带的连通性测试失败 | 有的分组可能限制这类探测请求，以 Claude Code 实际对话和使用日志为准 |
| 用的不是想要的模型 | 核对 CC Switch 里填的主模型和快速模型，以及分组里有没有这些模型 |
| 切换后没变化 | 完全退出 Claude Code 进程，不是只关当前窗口 |
| 404 | 请求地址多写了 `/v1` 或 `/v1/messages`，改回根地址 |

更多问题见 [Claude Code 常见问题](/faq/claude-code)。

## 恢复

在 CC Switch 的 Claude Code 分支启用原来的 Provider，完全退出 Claude Code 后重开。需要恢复文件时，按 [通用设置](/integrations/cc-switch/common) 里的恢复步骤用备份覆盖 `~/.claude/settings.json`。
