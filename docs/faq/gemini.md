---
title: Gemini CLI 与 Gemini 常见问题
description: 把 Gemini CLI 接到吱吱鼠AI，并排查 Gemini 原生协议和 OpenAI 兼容协议的常见问题。
---

# Gemini CLI 与 Gemini 常见问题

吱吱鼠AI 的 Gemini 模型同时支持两种协议：

| 协议 | 路径 | Base URL | 用在哪 |
| --- | --- | --- | --- |
| Gemini 原生 | `/v1beta/models/{model}:generateContent` | `https://zzshu.cc` | Gemini CLI、Google GenAI SDK |
| OpenAI 兼容 | `/v1/chat/completions` | `https://zzshu.cc/v1` | Cline、Cherry Studio、OpenCode 等 |

Gemini CLI 走原生协议，**Base URL 只填根地址，不带 `/v1`**。

::: tip 想省事？
打开 [客户端接入向导](/integrations/cli/?client=gemini)，选好分组和模型后会直接生成下面的命令和配置。
:::

## 接入 Gemini CLI

### 1. 安装并检查版本

建议 Node.js 20 或更新。

```bash
node --version
npm install -g @google/gemini-cli
gemini --version
```

### 2. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」。
2. 名称写 `gemini-cli` 这样好认的名字。
3. 分组选 Gemini 分组，例如 `Gemini`、`Gemini-Vertex`、`Gemini-Ultra`。
4. 到 [模型广场](https://zzshu.cc/pricing) 复制这个分组下的模型 ID，例如 `Gemini` 分组的 `gemini-2.5-flash`、`gemini-3-flash`，`Gemini-Vertex` 分组的 `gemini-2.5-pro`。模型要标注了 gemini 端点。

### 3. 写入配置

::: code-group

```bash [macOS / Linux]
mkdir -p ~/.gemini
nano ~/.gemini/settings.json
```

```powershell [Windows PowerShell]
New-Item -ItemType Directory -Force "$HOME\.gemini" | Out-Null
notepad "$HOME\.gemini\settings.json"
```

:::

把下面的内容合并进 `settings.json`，让 Gemini CLI 用 API Key 认证，而不是 Google 账号登录：

```json
{
  "model": {
    "name": "gemini-2.5-flash"
  },
  "security": {
    "auth": {
      "selectedType": "gemini-api-key"
    }
  }
}
```

文件里已有其他设置的话，保留它们，只加这两项。

### 4. 设置 Key 和地址并启动

::: code-group

```bash [macOS / Linux]
export GEMINI_API_KEY='YOUR_ZZSHU_API_KEY'
export GOOGLE_GEMINI_BASE_URL='https://zzshu.cc'
gemini
```

```powershell [Windows PowerShell]
$env:GEMINI_API_KEY = 'YOUR_ZZSHU_API_KEY'
$env:GOOGLE_GEMINI_BASE_URL = 'https://zzshu.cc'
gemini
```

:::

| 变量 | 填什么 |
| --- | --- |
| `GEMINI_API_KEY` | 第 2 步创建的 Key |
| `GOOGLE_GEMINI_BASE_URL` | 线路根地址，见下表，不带 `/v1` |

可用线路：

<RouteTable />

这两个变量只对当前终端有效。想长期生效，写进 `~/.zshrc`、`~/.bashrc` 或 PowerShell Profile，见 [环境变量配置](/integrations/cli/environment)。

### 5. 验证

在 Gemini CLI 里发一句：

```text
只回答 2+3 的结果。
```

收到回复后，打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。日志里有这条记录，才说明请求走了吱吱鼠AI。

### 6. 恢复原配置

::: code-group

```bash [macOS / Linux]
unset GEMINI_API_KEY GOOGLE_GEMINI_BASE_URL
```

```powershell [Windows PowerShell]
Remove-Item Env:GEMINI_API_KEY, Env:GOOGLE_GEMINI_BASE_URL -ErrorAction SilentlyContinue
```

:::

再把 `settings.json` 里的 `security.auth.selectedType` 改回原来的值。

## 用 curl 验证原生接口

客户端出问题时，先绕开客户端，用 curl 确认 Key、分组和模型：

```bash
# 列出原生协议可用的模型
curl "https://zzshu.cc/v1beta/models" \
  -H "x-goog-api-key: $GEMINI_API_KEY"

# 发一条最小请求
curl "https://zzshu.cc/v1beta/models/gemini-2.5-flash:generateContent" \
  -H "x-goog-api-key: $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents": [{"parts": [{"text": "只回复 OK"}]}]}'
```

`generateContent` 能返回内容，问题就在客户端配置。

## 在 Cline 里用 Gemini 模型

Cline 走 OpenAI 兼容协议：

1. 在 VS Code 扩展市场安装 Cline 并打开。
2. 进入 API Configuration，Provider 选 `OpenAI Compatible`。
3. Base URL 填 `https://zzshu.cc/v1`。
4. API Key 填吱吱鼠AI 的专用 Key。
5. Model ID 填分组里的模型，例如 `gemini-2.5-flash`。
6. 保存后先发一条短消息，没问题再打开文件和命令工具。

可用线路（OpenAI 兼容要带 `/v1`）：

<RouteTable suffix="/v1" />

## 用 CC Switch 管理 Gemini CLI

1. 在 CC Switch 顶部切到 Gemini。
2. 新增自定义配置，名称填 `吱吱鼠AI`。
3. Base URL 填 `https://zzshu.cc`，API Key 填专用 Key，模型填准确的模型 ID。
4. 保存并启用，然后完全退出 Gemini CLI 再重新打开。

CC Switch 的通用用法见 [CC Switch 通用说明](/integrations/cc-switch/common)。

不要把吱吱鼠AI 的 Key 填进 Google 账号登录框，也不要覆盖已有的 Google 账号凭据。

## 常见问题

### Gemini CLI 启动后还是要求登录 Google 账号？

- `settings.json` 里没有 `"selectedType": "gemini-api-key"`，或者 JSON 格式写错了。
- `GEMINI_API_KEY` 没有在启动 `gemini` 的同一个终端里设置。
- 本机还残留 Google 账号的登录缓存，Gemini CLI 优先用了它。

### 为什么 CC Switch 启用后还是走旧地址？

1. 完全退出 Gemini CLI，不只是关掉一个终端标签。
2. 新开终端，检查 `GOOGLE_GEMINI_BASE_URL`、`GEMINI_API_KEY` 的值。
3. 看看 shell Profile、IDE 启动环境和 CC Switch 是不是同时写了不同的值。
4. 确认 CC Switch 顶部选的是 Gemini，而不是别的客户端。

### 模型名带 gemini，就一定能在 Gemini CLI 里用？

不一定。要看模型广场里这个模型有没有标注 gemini 端点，以及它在不在你 Key 的分组里。只标注了 OpenAI 端点的模型，换用 Cline、Cherry Studio 这类 OpenAI 兼容客户端。

### 能用 Gemini 画图吗？

可以，用 `Gemini` 分组的图像模型，见 [Gemini 图像模型绘图](/integrations/paint/banana)。

### 状态码怎么排查？

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| 401 | Key 没读到、已失效，或者用的是 Google 自己的凭据 | 检查 `GEMINI_API_KEY` 在当前终端是否生效 |
| 403 | 余额不足、Key 额度用完，或者分组里没有这个模型 | 看完整错误信息，查余额和分组 |
| 404 | Base URL 多写了 `/v1`，或者模型 ID 不在分组里 | Base URL 改回根地址，到模型广场核对 |
| 返回 HTML | Base URL 填成了控制台网页地址 | 对照上面的线路表重填 |
| 能列模型但生成失败 | 模型不支持当前协议 | 检查模型的端点标注和请求路径 |

通用问题见 [常见问题](/faq/)。

### 截图和日志要遮住什么？

API Key、账号邮箱、用户 ID、本地绝对路径都要打码。排查时保留客户端版本、请求路径、HTTP 状态码、模型 ID 和时间就够了。
