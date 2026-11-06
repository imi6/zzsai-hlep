---
title: OpenClaw
description: 在 OpenClaw 里添加吱吱鼠AI Provider，设为默认模型，并用最小工具权限完成首次对话。
---

# OpenClaw

OpenClaw 用 `openai-completions` 适配器调用 OpenAI Chat Completions 接口，**Base URL 要带 `/v1`**。下面按「安装 → 建 Key → 写 Provider → 设默认模型 → 本地对话」的顺序配置。

::: tip 想省事？
打开 [客户端接入向导](/integrations/cli/?client=openclaw)，选好分组和模型后会直接生成下面所有命令和配置。
:::

## 1. 安装并检查版本

OpenClaw 对 Node.js 版本要求比较严格，安装前先看 [官方安装说明](https://docs.openclaw.ai/install/installer) 里列出的支持范围。

```bash
node --version
npm install -g openclaw
openclaw --version
```

默认 Node.js 版本不符合要求时，用版本管理器单独为 OpenClaw 切换，不要替换其他项目在用的版本。

## 2. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，创建一个只给 OpenClaw 用的 Key。
2. 分组按想用的模型选，例如 `国模聚合`、`DeepSeek`。
3. 到 [模型广场](https://zzshu.cc/pricing) 复制模型 ID，例如 `deepseek-v4-pro`。

## 3. 备份并打开配置

OpenClaw 默认读取 `~/.openclaw/openclaw.json`。

::: code-group

```bash [macOS / Linux]
mkdir -p ~/.openclaw
cp ~/.openclaw/openclaw.json ~/.openclaw/openclaw.json.bak 2>/dev/null || true
nano ~/.openclaw/openclaw.json
```

```powershell [Windows PowerShell]
New-Item -ItemType Directory -Force "$HOME\.openclaw" | Out-Null
if (Test-Path "$HOME\.openclaw\openclaw.json") { Copy-Item "$HOME\.openclaw\openclaw.json" "$HOME\.openclaw\openclaw.json.bak" }
notepad "$HOME\.openclaw\openclaw.json"
```

:::

## 4. 写入配置

文件里已有 Agent、Gateway 或外部渠道的话，保留它们，只合并下面这些字段：

```json
{
  "models": {
    "mode": "merge",
    "providers": {
      "zzshu": {
        "baseUrl": "https://zzshu.cc/v1",
        "apiKey": "${ZZSHU_API_KEY}",
        "api": "openai-completions",
        "models": [
          { "id": "deepseek-v4-pro", "name": "deepseek-v4-pro", "input": ["text"] }
        ]
      }
    }
  },
  "agents": {
    "defaults": {
      "model": { "primary": "zzshu/deepseek-v4-pro" }
    }
  },
  "tools": {
    "profile": "minimal"
  }
}
```

| 字段 | 说明 |
| --- | --- |
| `mode: "merge"` | 和客户端自带的 Provider 合并，不覆盖 |
| `baseUrl` | 线路地址加 `/v1`，不要再加具体接口路径 |
| `apiKey` | `${ZZSHU_API_KEY}` 表示从环境变量读取 |
| `api` | Chat Completions 模型写 `openai-completions`；只有确认模型支持 Responses 时才改成 `openai-responses` |
| `primary` | 默认模型，格式是 `Provider ID/模型 ID` |
| `tools.profile` | 首次配置先用 `minimal`，把工具问题和连接问题分开排查 |

可用线路：

<RouteTable suffix="/v1" />

## 5. 校验并重启

::: code-group

```bash [macOS / Linux]
openclaw config validate
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'
openclaw gateway restart
```

```powershell [Windows PowerShell]
openclaw config validate
$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'
openclaw gateway restart
```

:::

环境变量只对当前终端和它启动的子进程有效。重启 OpenClaw 时要在设置过 Key 的终端里操作。

## 6. 验证

先用本地 Agent 发一条消息：

```bash
openclaw agent --local --agent main \
  --model zzshu/deepseek-v4-pro \
  --message "只回答 2+3 的结果" \
  --json --timeout 30
```

输出里要同时有成功状态和回复正文。只看到 HTTP 200 而没有回复内容，不算配置完成。

然后打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。

也可以在 CC Switch 的 OpenClaw 分支里添加 Provider，API 协议选 OpenAI Completions，见 [CC Switch 使用说明](/integrations/cc-switch/)。CC Switch 会把 Key 明文写进配置，不要提交 `openclaw.json`。

## 7. 再逐项打开工具和渠道

纯文本对话成功后，再按需调整 `tools.profile`，逐个验证文件、命令、浏览器等工具。Telegram、Discord 这类外部渠道需要单独的 Bot Token，不要和 Provider 首次配置一起做。

::: warning
工具和 Gateway 可以读写文件、执行命令、连接外部平台。首次测试时不要用生产环境的 Bot Token、浏览器 Cookie 或重要仓库。
:::

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 启动时报 Node.js 版本不支持 | 单独为 OpenClaw 切换到官方支持的 Node.js 版本 |
| 401 | Key 要在启动 OpenClaw 的同一个终端里设置 |
| 403 | 检查余额、令牌分组，以及分组里有没有这个模型 |
| 404 | 检查模型 ID、`baseUrl` 和 `api`，避免出现 `/v1/v1` |
| HTTP 200 但回复不完整 | 把 `tools.profile` 改回 `minimal`，先验证纯文本 |
| 配置通过校验但没有发请求 | 本地 Agent 命令要同时指定 `--agent main` 和 `--model` |

## 恢复原配置

```bash
mv ~/.openclaw/openclaw.json.bak ~/.openclaw/openclaw.json
openclaw gateway restart
```

没有备份文件时，只删掉 `models.providers.zzshu` 和指向它的默认模型。
