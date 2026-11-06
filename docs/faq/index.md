---
title: 常见问题
description: 吱吱鼠AI 接入时的通用问题：状态码、余额、分组、模型 ID 和 Key 安全。
---

# 常见问题

这一页是所有客户端通用的问题。按客户端分的问题见：

- [Claude Code 常见问题](/faq/claude-code)：登录冲突、辅助模型、上下文和配置来源。
- [Codex 常见问题](/faq/codex)：Provider 配置、Responses 协议、环境变量。
- [Gemini 常见问题](/faq/gemini)：Gemini CLI、原生协议和 OpenAI 兼容协议的区别。

## 通用排查顺序

出问题时按这个顺序查，大部分问题前三步就能定位：

1. 用同一个 Key 请求 `/v1/models`，看能不能返回列表、列表里有没有你要的模型。
2. 确认模型 ID 和 Key 的分组对得上。
3. 检查 Base URL 有没有多写或漏写 `/v1`。
4. 完全退出客户端再重新打开，让它重新读取配置。
5. 到 [使用日志](https://zzshu.cc/console/log) 找这次请求，看状态和错误信息。

```bash
curl https://zzshu.cc/v1/models \
  -H "Authorization: Bearer YOUR_ZZSHU_API_KEY"
```

## 状态码

| 状态码 | 常见原因 | 处理 |
| --- | --- | --- |
| 401 | Key 缺失、填错、已删除，或者复制时带了空格、换行 | 重新复制 Key；检查环境变量里是不是另一个旧 Key |
| 403 | 余额不足、Key 额度用完、Key 已过期或被禁用，或者分组里没有这个模型 | 看错误信息里的具体原因，再查余额、令牌状态和分组 |
| 404 | 路径不对（多了 `/v1` 或少了 `/v1`）、模型 ID 不存在、模型不支持当前协议 | 对照客户端教程改 Base URL；到模型广场复制准确的模型 ID |
| 429 | 请求太快，或者上游渠道暂时繁忙 | 降低并发，隔几秒重试；不要同时重复提交同一个任务 |
| 500 / 502 / 503 / 504 | 上游渠道异常或超时 | 稍后重试一次；持续失败时换一个分组，或者带上请求时间联系客服 |

::: tip 错误信息比状态码更有用
同样是 403，「余额不足」和「分组无权访问模型」的处理方式完全不同。排查时看完整的错误正文，不要只看数字。
:::

## 余额和额度

### 余额和令牌额度有什么区别？

余额属于账户，所有 Key 共用。令牌额度是你在创建 Key 时给这个 Key 设的上限。账户有余额，但 Key 额度用完了，请求一样会失败。在 [令牌页面](https://zzshu.cc/console/token) 可以修改单个 Key 的额度，或者设为无限额度。

### 怎么充值？

在 [充值页面](https://zzshu.cc/console/topup) 操作。支持的支付方式和到账规则以页面显示为准。<!-- TODO: 运营方补充充值方式、兑换码、退款说明 -->

### 扣费比我预想的多？

1. 到使用日志里逐条看，核对模型、输入输出 token 数和分组。
2. Claude Code、Codex 这类 Agent 工具一次任务会发很多条请求，包括工具调用、上下文压缩、标题生成等，一次对话对应多条日志是正常的。
3. 不同分组的倍率不同，同一个模型在不同分组扣费不一样。
4. 出现大量你不认识的请求时，先删掉这个 Key，再排查是不是泄露了。

## 分组

### 分组是什么？

分组决定请求走哪条渠道，以及按什么倍率计费。一个 Key 只属于一个分组，这个 Key 只能调用该分组里有的模型。分组名大致说明了渠道来源，比如 `Claude Max`、`Claude KIRO正价稳定版`、`GPT Pro稳定`、`Gemini`、`Azure-GPT`、`国模聚合`。

### 怎么选分组？

1. 先确定要用的模型，到 [模型广场](https://zzshu.cc/pricing) 搜索，看它在哪些分组里。
2. 同一个模型出现在多个分组时，对比控制台上显示的倍率和分组说明。
3. 新分组先用小任务试，确认稳定再跑大任务。
4. 不同用途分开建 Key，比如 Claude Code 一个、Codex 一个，日志里好区分。

具体倍率经常调整，以控制台显示为准。

### 分组名里的「可蒸馏」是什么意思？

`Azure-GPT` 和 `Azure-GPT可蒸馏`、`Claude 真0注入开透传` 和 `Claude 真0注入开透传-可蒸馏` 这样成对出现的分组，渠道和使用规则不同。日常写代码、对话选哪一组都可以；有批量调用等特殊用途时，先看控制台里的分组说明，拿不准就联系客服确认。

<!-- TODO: 由运营方补充「可蒸馏」分组的准确定义和使用规则 -->

### auto 分组是什么？

`auto` 会在多个分组之间自动挑选，默认低价优先。你也可以在控制台里设置主用分组和备用分组的顺序。适合不想手动挑分组的场景；需要稳定复现结果时，建议直接指定分组。

### 改了 Key 的分组，客户端要重新配置吗？

不用改配置，Key 不变。但新分组里不一定有原来的模型，改完先到模型广场确认模型 ID 还能用。

## 模型

### 模型 ID 去哪里找？

在 [模型广场](https://zzshu.cc/pricing) 复制，或者用 Key 请求 `/v1/models`。不要凭记忆手打，也不要用别的平台的别名，比如 `claude-sonnet-4-6` 和 `claude-sonnet-4.6` 在吱吱鼠AI 是两个不同的模型 ID，分布在不同分组。

### 模型广场里的「端点」是什么意思？

端点是模型支持的调用协议：

| 端点 | 路径 | 典型客户端 |
| --- | --- | --- |
| anthropic | `/v1/messages` | Claude Code、TRAE SOLO |
| openai | `/v1/chat/completions` | Cherry Studio、OpenCode、Cursor |
| openai-response | `/v1/responses` | Codex |
| gemini | `/v1beta/models/{model}:generateContent` | Gemini CLI |
| image-generation | `/v1/images/generations` | 绘图 |

客户端用的协议，模型必须支持。各端点的调用示例见 [API 总览](/api/)。

### 能把 GPT 模型接进 Claude Code 吗？

不能直接接。GPT 模型不支持 Anthropic Messages 协议，需要做协议转换，见 [GPT 模型接入 Claude Code](/integrations/advanced/chatgpt-claude-code)。

## Base URL

### 什么时候带 /v1，什么时候不带？

| 客户端类型 | Base URL |
| --- | --- |
| OpenAI SDK、Codex、OpenCode、Cursor | `https://zzshu.cc/v1` |
| Claude Code、Anthropic SDK | `https://zzshu.cc` |
| Gemini CLI、Google GenAI SDK | `https://zzshu.cc` |
| Cherry Studio | `https://zzshu.cc`（客户端自己拼路径） |

可用线路：

<RouteTable />

### 返回了一段 HTML？

Base URL 多半填成了控制台网页地址，或者路径拼错了，请求落到了网页上。对照客户端教程检查地址。

### 请求一分钟左右就断开？

本机代理或公司网关可能限制了长连接。把 `zzshu.cc` 设为直连，或者换一条线路再试。

## Key 安全

### 怎么保管 Key？

- 一个客户端一个 Key，名字写清楚用途。泄露时只删一个，不影响别的工具。
- 能用环境变量就不要把 Key 写进配置文件；写进配置文件的话，不要提交到 Git 仓库。
- 截图、录屏、发给别人排查时，只保留 `sk-` 后面几位，其余打码。
- 不用的 Key 及时删除。
- 给 Key 设额度上限，即使泄露，损失也有限。

### Key 泄露了怎么办？

1. 立刻到 [令牌页面](https://zzshu.cc/console/token) 删除或禁用这个 Key。
2. 新建一个 Key，替换到客户端里。
3. 到使用日志里查看泄露期间的调用记录。

### 联系客服时要提供什么？

请求时间、模型 ID、分组、HTTP 状态码和完整错误信息。Key 只露出末尾几位，不要发完整 Key。<!-- TODO: 运营方补充客服联系方式 -->
