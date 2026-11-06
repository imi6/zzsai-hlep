---
title: OpenCode
description: 在 OpenCode 里添加吱吱鼠AI Provider，用 OpenAI 兼容接口对话。
---

# OpenCode

OpenCode 通过 `@ai-sdk/openai-compatible` 适配器调用 OpenAI Chat Completions 接口，**Base URL 要带 `/v1`**。DeepSeek、GLM、Kimi、GPT、Claude 等只要支持 OpenAI 端点的模型都能用。

::: tip 想省事？
打开 [客户端接入向导](/integrations/cli/?client=opencode)，选好分组和模型后会直接生成下面所有命令和配置。
:::

## 1. 安装并检查版本

```bash
node --version
npm install -g opencode-ai
opencode --version
opencode debug paths
```

`opencode debug paths` 会列出配置、数据和缓存目录。下面改的是其中的配置目录，以这条命令的输出为准。

## 2. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，创建一个只给 OpenCode 用的 Key。
2. 分组按想用的模型选，例如 `国模聚合`、`DeepSeek`。
3. 到 [模型广场](https://zzshu.cc/pricing) 复制模型 ID，例如 `deepseek-v4.1-flash`。

每个客户端用单独的 Key。万一泄露或消费异常，只停用这一个就行。

## 3. 打开配置

::: code-group

```bash [macOS / Linux]
mkdir -p ~/.config/opencode
cp ~/.config/opencode/opencode.json ~/.config/opencode/opencode.json.bak 2>/dev/null || true
nano ~/.config/opencode/opencode.json
```

```powershell [Windows PowerShell]
New-Item -ItemType Directory -Force "$HOME\.config\opencode" | Out-Null
if (Test-Path "$HOME\.config\opencode\opencode.json") { Copy-Item "$HOME\.config\opencode\opencode.json" "$HOME\.config\opencode\opencode.json.bak" }
notepad "$HOME\.config\opencode\opencode.json"
```

:::

## 4. 写入配置

文件里已有其他 Provider、MCP 或权限设置的话，只合并 `model` 和 `provider.zzshu`：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "model": "zzshu/deepseek-v4.1-flash",
  "provider": {
    "zzshu": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "吱吱鼠AI",
      "options": {
        "baseURL": "https://zzshu.cc/v1",
        "apiKey": "{env:ZZSHU_API_KEY}"
      },
      "models": {
        "deepseek-v4.1-flash": {
          "name": "deepseek-v4.1-flash"
        }
      }
    }
  }
}
```

| 字段 | 填什么 |
| --- | --- |
| `model` | `Provider ID/模型 ID`，这里是 `zzshu/deepseek-v4.1-flash` |
| `baseURL` | 线路地址加 `/v1`，不要再加 `/chat/completions` |
| `apiKey` | `{env:ZZSHU_API_KEY}` 表示从环境变量读取，配置文件里不出现真实 Key |
| `models` | 要用的模型，键名是准确的模型 ID，可以写多个 |

可用线路：

<RouteTable suffix="/v1" />

## 5. 检查 Provider 和模型

::: code-group

```bash [macOS / Linux]
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'
opencode models zzshu
```

```powershell [Windows PowerShell]
$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'
opencode models zzshu
```

:::

输出里应该有 `zzshu/deepseek-v4.1-flash`。没有的话，检查 JSON 结构、Provider ID 和模型 ID，不用重装客户端。

## 6. 启动并验证

在同一个终端里进入一个临时目录启动：

```bash
mkdir -p /tmp/zzshu-opencode-test && cd /tmp/zzshu-opencode-test
opencode --model zzshu/deepseek-v4.1-flash
```

界面里确认当前模型是 `deepseek-v4.1-flash`、Provider 是吱吱鼠AI。需要切换模型时输入 `/models`。

<!-- TODO: 截图 OpenCode 界面显示吱吱鼠AI 模型 -->

发一条短消息，比如「只回答 2+3 的结果」。也可以不进界面，直接用命令测试：

```bash
opencode run --model zzshu/deepseek-v4.1-flash "只回答 2+3 的结果"
```

收到回复后，打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。普通对话没问题后，再让 OpenCode 读取真实项目。

也可以在 CC Switch 的 OpenCode 分支里添加 Provider，接口格式选 OpenAI Compatible，见 [CC Switch 使用说明](/integrations/cc-switch/)。CC Switch 会把 Key 明文写进配置，不要把生成的文件提交到 Git。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 模型列表里没有吱吱鼠AI | 检查 Provider ID、`models` 对象和 JSON 逗号；用 `opencode debug paths` 确认改的是正在用的文件 |
| 401 | 环境变量要在启动 OpenCode 的同一个终端里设置 |
| 403 | 检查余额、令牌分组，以及分组里有没有这个模型 |
| 404 | `baseURL` 漏了 `/v1` 或写成了 `/v1/v1`，模型 ID 拼写错误 |
| 请求格式错误 | 不要把 `@ai-sdk/openai-compatible` 换成 Responses 适配器，除非模型确认支持 Responses |

## 恢复原配置

```bash
mv ~/.config/opencode/opencode.json.bak ~/.config/opencode/opencode.json
unset ZZSHU_API_KEY
```

没有备份文件时，只删掉 `provider.zzshu` 和指向它的 `model`。
