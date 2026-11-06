---
title: WorkBuddy
description: 在 WorkBuddy 的自定义模型页面添加吱吱鼠AI 的 OpenAI 兼容模型。
---

# WorkBuddy

WorkBuddy 支持在设置里添加自定义模型，走 OpenAI Chat Completions 协议。**API 地址填到 `/v1`**，WorkBuddy 会自己补上后面的接口路径。

::: tip 想省事？
打开 [客户端接入向导](/integrations/cli/?client=workbuddy)，选好分组和模型后会直接生成下面要填的字段。
:::

不同版本的界面文字可能有出入，以当前版本的模型设置页为准。字段说明可参考 [WorkBuddy 官方模型配置文档](https://www.workbuddy.ai/docs/workbuddy/From-Beginner-to-Expert-Guide/Function-Description/Model)。

## 1. 安装并登录

从 [WorkBuddy 官网](https://www.workbuddy.ai/) 下载对应系统和处理器架构的版本，安装后用 WorkBuddy 支持的方式登录。

首次启动可能会申请文件、辅助功能或通知权限。只授权你准备用到的功能，添加自定义模型不需要这些权限。

## 2. 创建专用 API Key

1. 打开 [令牌页面](https://zzshu.cc/console/token)，点击「添加令牌」。
2. 名称写 `workbuddy`，只给 WorkBuddy 用。
3. 分组选能访问目标模型的分组。例如 GPT 模型选 `GPT Pro稳定`，国产模型选 `国模聚合`。
4. 复制 Key。截图时保持密码框为掩码状态。

## 3. 确认模型 ID

到 [模型广场](https://zzshu.cc/pricing) 查，或者用同一个 Key 请求模型列表：

::: code-group

```bash [macOS / Linux]
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'
curl https://zzshu.cc/v1/models \
  -H "Authorization: Bearer $ZZSHU_API_KEY"
```

```powershell [Windows PowerShell]
$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'
Invoke-RestMethod https://zzshu.cc/v1/models `
  -Headers @{ Authorization = "Bearer $env:ZZSHU_API_KEY" } | ConvertTo-Json -Depth 5
```

:::

从返回结果里复制准确的模型 ID。下文用 `gpt-5.6-sol` 举例，如果你的分组里没有它，换成实际返回的 ID。

## 4. 添加自定义模型

1. 点击左下角头像，进入「设置 → 模型」，点击「添加模型」。
2. 提供商选「自定义 / Custom」。不要改 WorkBuddy 内置的 Provider。
3. 按下表填写：

| 字段 | 填什么 |
| --- | --- |
| API 地址 | `https://zzshu.cc/v1` |
| API Key | 第 2 步创建的 Key |
| 模型 ID | `gpt-5.6-sol`，或你在第 3 步查到的 ID |
| 自定义协议 | 保持关闭 |

可用线路：

<RouteTable suffix="/v1" />

「自定义协议」关闭时，WorkBuddy 按标准 Chat Completions 规则补全路径，所以地址只写到 `/v1`。打开后它会把请求原样发到你填的完整 URL。两种写法不要混用：要么 `/v1` + 关闭，要么 `/v1/chat/completions` + 开启。一般用前一种。

<!-- TODO: 截图 WorkBuddy 自定义模型表单 -->

## 5. 设置模型能力

第一次保存时只开文本对话。工具调用、图片输入、推理这些开关，等你确认模型和分组确实支持后再逐个打开。按模型名猜能力容易出错，开错了 WorkBuddy 会发出模型不支持的请求格式。

## 6. 选择模型并发送消息

1. 保存后回到任务页面，在输入框的模型菜单里选择刚添加的模型。
2. 确认会话里显示的是这个模型，再发一条不带文件和工具的短消息：

```text
只回复 WORKBUDDY_OK，不要添加其他内容。
```

## 7. 验证

收到回复后，打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。日志里的模型 ID 应该和 WorkBuddy 里选的一致。

纯文本对话正常后，再逐项打开项目扫描、文件访问、工具调用和自动执行。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 找不到 Custom 选项 | 更新到支持自定义模型的 WorkBuddy 版本 |
| 401 | 重新粘贴 Key，检查有没有多复制空格，或者用了已停用的旧 Key |
| 404 | 地址写成 `https://zzshu.cc/v1`，关闭自定义协议，不要再追加接口路径 |
| 模型不存在 | 重新请求 `/v1/models`，复制分组里实际有的模型 ID |
| 保存后模型菜单里没有 | 回「设置 → 模型」确认模型还在列表里并已保存 |
| 文本正常，工具调用失败 | 先关掉能力开关，从纯文本开始逐项打开，把接入问题和工具兼容问题分开查 |

## 恢复

在「设置 → 模型」里删除这个自定义模型，切回 WorkBuddy 自带的模型即可。不再使用的 Key 可以在令牌页面停用或删除。
