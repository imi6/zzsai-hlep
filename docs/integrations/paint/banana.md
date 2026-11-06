---
title: Gemini 图像模型绘图
description: 用 Gemini 原生接口或 Cherry Studio 调用吱吱鼠AI 的 Gemini 图像模型。
---

# Gemini 图像模型绘图

吱吱鼠AI 目前的 Gemini 图像模型是 `gemini-3.1-flash-image`，在 `Gemini` 分组。它走 Gemini 原生的 `generateContent` 接口，图片以 base64 的形式放在回复里，不走 `/v1/images/generations`。

::: warning 先查模型广场
模型 ID 会随上游更新变化。开始前到 [模型广场](https://zzshu.cc/pricing) 搜索 `image`，复制当前显示的完整 ID，不要把本文的示例当成固定名称。
:::

## 1. 创建专用 Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」。
2. 名称写 `gemini-image` 之类好认的名字。
3. 分组选 `Gemini`。
4. 保存后复制 Key。截图时把 Key 打码。

<!-- TODO: 截图 令牌页面选择 Gemini 分组 -->

## 2. 用 curl 验证

先用最小请求确认 Key、分组和模型都没问题，再去配置客户端。

::: code-group

```bash [macOS / Linux]
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'

curl "https://zzshu.cc/v1beta/models/gemini-3.1-flash-image:generateContent" \
  -H "x-goog-api-key: $ZZSHU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "contents": [{"parts": [{"text": "一只戴蓝色毛线帽的小老鼠，扁平插画风格"}]}],
    "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
  }' > result.json
```

```powershell [Windows PowerShell]
$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'

$body = @{
  contents = @(@{ parts = @(@{ text = '一只戴蓝色毛线帽的小老鼠，扁平插画风格' }) })
  generationConfig = @{ responseModalities = @('TEXT', 'IMAGE') }
} | ConvertTo-Json -Depth 6

Invoke-RestMethod -Method Post `
  -Uri 'https://zzshu.cc/v1beta/models/gemini-3.1-flash-image:generateContent' `
  -Headers @{ 'x-goog-api-key' = $env:ZZSHU_API_KEY } `
  -ContentType 'application/json; charset=utf-8' `
  -Body ([Text.Encoding]::UTF8.GetBytes($body)) |
  ConvertTo-Json -Depth 10 | Out-File result.json -Encoding utf8
```

:::

返回的 JSON 里，图片在 `candidates[0].content.parts` 中带 `inlineData` 的那一项，`data` 字段是 base64。macOS / Linux 可以用 `jq` 解出来：

```bash
jq -r '.candidates[0].content.parts[] | select(.inlineData) | .inlineData.data' result.json | base64 -d > mouse.png
```

拿到图片后，到 [使用日志](https://zzshu.cc/console/log) 核对模型和状态。

可用线路（Gemini 原生接口用根地址，路径从 `/v1beta` 开始）：

<RouteTable />

## 3. 用 Python 调用

Google 官方的 `google-genai` SDK 可以改 Base URL，直接指向吱吱鼠AI。

```bash
pip install google-genai
```

```python
from google import genai
from google.genai import types

client = genai.Client(
    api_key="YOUR_ZZSHU_API_KEY",
    http_options=types.HttpOptions(base_url="https://zzshu.cc"),
)

resp = client.models.generate_content(
    model="gemini-3.1-flash-image",
    contents="一只戴蓝色毛线帽的小老鼠，扁平插画风格",
    config=types.GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
)

for part in resp.candidates[0].content.parts:
    if part.inline_data:
        with open("mouse.png", "wb") as f:
            f.write(part.inline_data.data)
    elif part.text:
        print(part.text)
```

## 4. 在 Cherry Studio 里使用

1. 从 [Cherry Studio 官网](https://www.cherryai.com/) 下载安装并打开。
2. 进入「设置 → 模型服务」，滚到列表底部点「添加」。
3. 提供商名称填 `吱吱鼠AI Images`，提供商类型选 `New API`，点确定。
4. 选中刚建的提供商，填写：

| 字段 | 填什么 |
| --- | --- |
| API 密钥 | 第 1 步创建的 Key |
| API 地址 | `https://zzshu.cc`（只填根地址，New API 类型会自己拼路径，手动加 `/v1` 会变成 `/v1/v1`） |

5. 点「管理」获取模型列表，搜索 `gemini-3.1-flash-image` 并添加。列表里没有这个模型，说明 Key 的分组不对，回控制台检查，不要手动填一个 Key 无权访问的 ID。
6. 点模型右侧的编辑按钮，确认端点类型是 Gemini，保存。
7. 回到首页，打开当前助手的设置，在「模型设置」里**关闭流式输出**。不关的话，界面可能只显示一段文字、base64 原文或解析错误。
8. 在顶部模型选择器里选 `吱吱鼠AI Images` 下的这个模型，输入提示词发送。

<!-- TODO: 截图 Cherry Studio 中添加吱吱鼠AI Images 提供商并选中 Gemini 图像模型 -->

客户端里能看到图片，并且使用日志里的模型 ID 一致，才算配置完成。

## 排错

| 现象 | 处理 |
| --- | --- |
| 模型列表里找不到图像模型 | Key 不是 `Gemini` 分组，或模型已调整，回模型广场确认 |
| 返回只有文字，没有图片 | 请求里没带 `responseModalities: ["TEXT", "IMAGE"]`，或者提示词没有明确要求画图 |
| 界面显示 base64 原文或解析失败 | 关闭流式输出后重试 |
| 404 | 地址写成了 `/v1/v1beta/...`，或者把 Gemini 模型发到了 `/v1/images/generations` |
| 请求一分钟左右断开 | 本机代理限制了长连接，把 `zzshu.cc` 设为直连 |

更多 Gemini 协议相关的问题见 [Gemini 常见问题](/faq/gemini)。
