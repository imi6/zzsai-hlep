---
title: Grok Build
description: 在 Grok Build CLI 的 config.toml 里添加吱吱鼠AI 的 Responses 模型。
---

# Grok Build

Grok Build CLI 的自定义模型写在 `~/.grok/config.toml` 里，走 OpenAI Responses 协议，Base URL 要带 `/v1`。下面的字段结构参考了 CC Switch 对 Grok Build 配置的校验规则，实际以你安装的版本为准。

<!-- TODO: 核对 Grok Build 官方安装地址和当前版本的 config.toml 字段 -->

## 1. 安装并检查版本

按 xAI 官方页面提供的方式安装，然后运行：

```bash
grok --version
grok --help
grok inspect
```

`grok` 命令不存在时先停下，把安装问题解决了再写配置。

## 2. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，创建一个只给 Grok Build 用的 Key。
2. 分组选择支持 Responses 端点的分组，例如 `Grok Heavy` 或 `Grok Free`。
3. 到 [模型广场](https://zzshu.cc/pricing) 复制模型 ID，例如 `grok-4.6`。`grok-4.7` 目前只在 `Grok Heavy` 分组里。

## 3. 备份并打开配置

::: code-group

```bash [macOS / Linux]
mkdir -p ~/.grok
cp ~/.grok/config.toml ~/.grok/config.toml.bak 2>/dev/null || true
nano ~/.grok/config.toml
```

```powershell [Windows PowerShell]
New-Item -ItemType Directory -Force "$HOME\.grok" | Out-Null
if (Test-Path "$HOME\.grok\config.toml") { Copy-Item "$HOME\.grok\config.toml" "$HOME\.grok\config.toml.bak" }
notepad "$HOME\.grok\config.toml"
```

:::

## 4. 写入配置

```toml
[models]
default = "grok-4.6"

[model."grok-4.6"]
model = "grok-4.6"
base_url = "https://zzshu.cc/v1"
name = "吱吱鼠AI"
env_key = "ZZSHU_API_KEY"
api_backend = "responses"
context_window = 128000
```

| 字段 | 填什么 |
| --- | --- |
| `default` | 默认模型，要和下面 `[model."..."]` 引号里的名字一致 |
| `model` | 吱吱鼠AI 的模型 ID |
| `base_url` | 线路地址加 `/v1`，每个模型块都要写 |
| `env_key` | 存放 Key 的环境变量名，不是 Key 本身 |
| `api_backend` | 固定写 `"responses"` |
| `context_window` | 正整数，按模型实际上下文长度填写，上面的数字只是占位 |

<!-- TODO: 确认 grok 系列模型在吱吱鼠AI 上的上下文长度 -->

可用线路：

<RouteTable suffix="/v1" />

## 5. 设置 Key 并检查

::: code-group

```bash [macOS / Linux]
read -s ZZSHU_API_KEY
export ZZSHU_API_KEY
grok inspect
```

```powershell [Windows PowerShell]
$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'
grok inspect
```

:::

`grok inspect` 显示的配置要和上面写的一致。如果输出的字段结构不一样，以当前版本为准修改配置，不要硬发请求。

## 6. 验证

先用 `grok --help` 确认支持 `-p` 和 `-m` 参数，再发一条单次提问：

```bash
grok -p "只回答 2+3 的结果" -m grok-4.6
```

收到回复后，打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。用 curl 请求成功不能代替这一步，必须是 Grok Build 自己发出的请求。

推理强度之类的参数，确认客户端、模型和配置都支持后再开。

也可以在 CC Switch 的 Grok Build 分支里完成同样的配置，见 [CC Switch 使用说明](/integrations/cc-switch/)。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| `grok inspect` 报配置无效 | 检查模型块是否缺 `base_url`、`api_backend` 或 `context_window` |
| 401 | 环境变量要在运行 `grok` 的同一个终端里设置 |
| 403 | 检查余额、令牌分组，以及分组里有没有这个模型 |
| 404 | `base_url` 漏了 `/v1`，或模型 ID 写错 |
| 默认模型没生效 | `default` 的值和模型块名不一致 |

## 恢复原配置

```bash
mv ~/.grok/config.toml.bak ~/.grok/config.toml
unset ZZSHU_API_KEY
```

没有备份文件时，只删掉刚加的模型块和 `default`。不要改动或删除 Grok 官方登录相关的文件。
