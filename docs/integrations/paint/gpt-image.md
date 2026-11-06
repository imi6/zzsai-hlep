---
title: OpenAI Images 兼容绘图
description: 用 Images API 或 Cherry Studio 调用吱吱鼠AI 的 gpt-image 系列模型。
---

# OpenAI Images 兼容绘图

吱吱鼠AI 的 `gpt-image-1`、`gpt-image-1.5`、`gpt-image-2` 都在 `Azure-GPT` 分组，走 OpenAI Images API：

- 文生图：`POST https://zzshu.cc/v1/images/generations`
- 图片编辑：`POST https://zzshu.cc/v1/images/edits`

不要用 `/v1/chat/completions` 或 `/v1/responses` 代替 Images API。

::: warning 先查模型广场
开始前到 [模型广场](https://zzshu.cc/pricing) 确认目标模型还在 `Azure-GPT` 分组，并且标注了图像生成端点。模型名称会调整，不要假定某个 `gpt-image-*` 永久可用。
:::

## 1. 创建绘图专用 Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」。
2. 名称写 `gpt-image` 之类好认的名字。
3. 分组选 `Azure-GPT`。
4. 保存后复制 Key。

<!-- TODO: 截图 令牌页面选择 Azure-GPT 分组 -->

## 2. 文生图最小请求

```bash
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'

curl "https://zzshu.cc/v1/images/generations" \
  -H "Authorization: Bearer $ZZSHU_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-image-1",
    "prompt": "一只戴蓝色毛线帽的小老鼠，扁平插画风格",
    "n": 1
  }'
```

第一次只传 `model`、`prompt` 和 `n: 1`。成功后再逐个加 `size`、`quality`、输出格式这些参数，每加一个测一次，哪个参数不被支持一眼就能看出来。

返回的 `data[0]` 里是 `url` 或 `b64_json`。`gpt-image` 系列通常返回 `b64_json`，需要自己解码保存：

```bash
# 把上面的返回保存为 result.json 后
jq -r '.data[0].b64_json' result.json | base64 -d > mouse.png
```

返回的是临时 URL 时，生成后尽快下载，不要把它当成长期存储地址。

## 3. 图片编辑最小请求

```bash
curl "https://zzshu.cc/v1/images/edits" \
  -H "Authorization: Bearer $ZZSHU_API_KEY" \
  -F "model=gpt-image-1" \
  -F "prompt=保留主体，在右上角加一个红色小印章" \
  -F "image=@./input.png"
```

文生图成功、图片编辑失败，一般说明这个模型或当前渠道不支持编辑接口。换一个模型再试，或者联系客服确认。<!-- TODO: 确认 Azure-GPT 分组下哪些 gpt-image 模型支持 /v1/images/edits -->

## 4. 用 Python 调用

```bash
pip install openai
```

```python
import base64
from openai import OpenAI

client = OpenAI(
    api_key="YOUR_ZZSHU_API_KEY",
    base_url="https://zzshu.cc/v1",
)

result = client.images.generate(
    model="gpt-image-1",
    prompt="一只戴蓝色毛线帽的小老鼠，扁平插画风格",
    n=1,
)

item = result.data[0]
if item.b64_json:
    with open("mouse.png", "wb") as f:
        f.write(base64.b64decode(item.b64_json))
else:
    print(item.url)
```

也可以在 [客户端接入向导](/integrations/cli/?client=code) 里选「图像生成」分类和模型，直接生成这段代码。

可用线路（OpenAI SDK 的 `base_url` 要带 `/v1`）：

<RouteTable suffix="/v1" />

## 5. 在 Cherry Studio 里使用

1. 从 [Cherry Studio 官网](https://www.cherryai.com/) 下载安装并打开。
2. 进入「设置 → 模型服务」，滚到列表底部点「添加」。
3. 提供商名称填 `吱吱鼠AI Images`，提供商类型选 `New API`，点确定。
4. 选中刚建的提供商，按下表填写：

| 字段 | 填什么 |
| --- | --- |
| API 密钥 | 第 1 步创建的 Key |
| API 地址 | `https://zzshu.cc`（只填根地址，不要手动加 `/v1`） |

5. 点「管理」获取模型列表，搜索并添加 `gpt-image-1` 等模型。
6. 点模型右侧的编辑按钮，把**端点类型改为「图像生成（OpenAI）」**并保存。这一步漏掉的话，请求会发到普通对话接口。
7. 回到首页，点顶部的「+」，在应用列表里打开「绘画」。
8. 提供商选 `吱吱鼠AI Images`，模型选刚添加的模型。第一次用时尺寸和质量设为自动，数量设为 1。
9. 「绘图」标签下输入提示词即可文生图；「编辑」标签下先上传原图，再写修改要求。

<!-- TODO: 截图 Cherry Studio 模型编辑器中端点类型设为图像生成（OpenAI） -->
<!-- TODO: 截图 Cherry Studio 绘画页面选择吱吱鼠AI Images -->

生成完成后到 [使用日志](https://zzshu.cc/console/log) 核对模型、状态、耗时和扣费。

## 长连接与代理

出图通常比对话慢。遇到大约一分钟后中断、`Failed to fetch`，或者 HTML 被当成 JSON 解析：

1. 检查本机代理是否限制长连接，把 `zzshu.cc` 加入直连。
2. 保持 `n: 1`，尺寸和质量先用自动。
3. 去掉可选参数后重试。
4. 到使用日志里看这次请求有没有到达、返回了什么状态。

## 排错顺序

1. 用同一个 Key 请求 `GET /v1/models`，确认列表里有目标模型。
2. 用最小的 `/v1/images/generations` 请求确认服务端能出图。
3. 检查 Cherry Studio 里模型的端点类型是不是「图像生成（OpenAI）」。
4. 去掉 `size`、`quality`、格式等可选参数后重试。
5. 按状态码处理：401 看 Key，403 看余额和分组，404 看路径和模型 ID，429 降低频率，5xx 稍后重试。详见 [常见问题](/faq/)。
