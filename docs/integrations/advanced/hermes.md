---
title: Hermes Agent
description: 安装 Hermes Agent，通过自定义 Provider 接入吱吱鼠AI 的 OpenAI 兼容接口。
---

# Hermes Agent

Hermes Agent 支持自定义 OpenAI 兼容 Provider，用 `chat_completions` 模式调用，**Base URL 要带 `/v1`**。

::: tip 想省事？
打开 [客户端接入向导](/integrations/cli/?client=hermes)，选好分组和模型后会直接生成下面所有命令和配置。
:::

## 1. 安装 Hermes Agent

先看 [Hermes Agent 官方文档](https://hermes-agent.nousresearch.com/docs/) 了解安装方式。macOS、Linux 或 WSL2 可以用官方脚本。建议先下载下来看一眼再运行：

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh -o /tmp/hermes-install.sh
less /tmp/hermes-install.sh
bash /tmp/hermes-install.sh
```

安装脚本可能会装 Python、uv 和虚拟环境，并修改 Shell 配置。装完后重新打开终端检查：

```bash
hermes --version
hermes doctor
```

两条命令都正常再继续。安装中途失败时，保存输出，分别看是网络、Python、uv 还是依赖编译的问题。

<!-- TODO: Windows 原生环境是否支持，按 Hermes 官方文档补充 -->

## 2. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，创建一个只给 Hermes 用的 Key。
2. 分组按想用的模型选，例如 `国模聚合`、`Kimi`。
3. 到 [模型广场](https://zzshu.cc/pricing) 复制模型 ID，例如 `kimi-k3`。

## 3. 写入配置

有两种方式，选一种即可。

### 方式 A：用 Hermes 向导

```bash
hermes model
```

在菜单里选 Custom Endpoint，依次填写：

| 项目 | 填什么 |
| --- | --- |
| Name | `zzshu` |
| Base URL | `https://zzshu.cc/v1` |
| API mode | `chat_completions` |
| API Key | 第 2 步创建的 Key |
| Default model | `kimi-k3` |

Base URL 不要加 `/chat/completions`。API mode 要手动选，不要依赖 Hermes 根据 URL 自动判断。

### 方式 B：手动编辑配置文件

::: code-group

```bash [macOS / Linux]
cp ~/.hermes/config.yaml ~/.hermes/config.yaml.bak 2>/dev/null || true
nano ~/.hermes/config.yaml
```

```powershell [Windows PowerShell]
if (Test-Path "$HOME\.hermes\config.yaml") { Copy-Item "$HOME\.hermes\config.yaml" "$HOME\.hermes\config.yaml.bak" }
notepad "$HOME\.hermes\config.yaml"
```

:::

合并下面的内容：

```yaml
model:
  default: "kimi-k3"
  provider: custom:zzshu

custom_providers:
  - name: zzshu
    base_url: "https://zzshu.cc/v1"
    key_env: ZZSHU_API_KEY
    api_mode: chat_completions
```

`provider: custom:zzshu` 里冒号后面的名字，要和 `custom_providers` 里的 `name` 一致。

可用线路：

<RouteTable suffix="/v1" />

## 4. 保存 Key

`config.yaml` 只放非敏感设置。Key 可以写进 `~/.hermes/.env`，只写一行变量，不加引号：

```text
ZZSHU_API_KEY=YOUR_ZZSHU_API_KEY
```

macOS / Linux 保存后收紧权限：

```bash
chmod 600 ~/.hermes/.env
```

也可以只在当前终端设置环境变量，见下一步。

## 5. 验证

先用一条单次提问测试连接：

::: code-group

```bash [macOS / Linux]
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'
hermes chat -q "只回答 2+3 的结果"
```

```powershell [Windows PowerShell]
$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'
hermes chat -q "只回答 2+3 的结果"
```

:::

收到回复后，打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。配置保存成功、模型出现在菜单里，都不能代替这一步。

需要交互界面时直接运行 `hermes`。会话里切换模型：

```text
/model custom:zzshu:kimi-k3
```

也可以在 CC Switch 的 Hermes 分支里添加 Provider，API 模式选 OpenAI Chat Completions，见 [CC Switch 使用说明](/integrations/cc-switch/)。

## 6. 再打开工具和 Gateway

先关闭工具、记忆、定时任务和 Gateway。纯文本对话成功后再逐项打开。Telegram、Discord、Slack 等 Gateway 需要外部账号或 Bot Token，等 Provider 验证通过后再单独配置。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| Unknown provider | `provider: custom:zzshu` 和 `custom_providers[].name` 不一致 |
| 401 | Hermes 没读到 Key；检查 `.env` 里有没有多余引号或空格 |
| 403 | 检查余额、令牌分组，以及分组里有没有这个模型 |
| 404 | 检查 Base URL 是否带 `/v1`、模型 ID 和 `api_mode` |
| 能选模型但对话失败 | 先关掉工具，只发纯文本，再确认模型支持 Chat Completions |
| Gateway 不回消息 | 先回到 CLI 会话验证 Provider，再单独查外部平台凭据 |

## 恢复原配置

```bash
mv ~/.hermes/config.yaml.bak ~/.hermes/config.yaml
```

没有备份文件时，只删掉 `custom_providers` 里的 `zzshu` 条目，并把 `model` 改回原来的值。`.env` 里删掉 `ZZSHU_API_KEY` 那一行。
