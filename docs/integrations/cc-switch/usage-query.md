---
title: CC Switch 用量查询
description: 在 CC Switch 的 Provider 卡片上显示吱吱鼠AI 令牌的已用和剩余额度。
---

# CC Switch 用量查询

吱吱鼠AI 基于 New API，提供按令牌查询用量的接口 `/api/usage/token/`。在 CC Switch 里配一段查询脚本，Provider 卡片上就能直接看到这个 Key 的已用和剩余额度。

开始前先按 [通用设置](/integrations/cc-switch/common) 添加好 `吱吱鼠AI` Provider。

## 1. 先测接口

用你在 CC Switch 里填的同一个 Key 请求一次，确认能返回数据：

::: code-group

```bash [macOS / Linux]
export ZZSHU_API_KEY='YOUR_ZZSHU_API_KEY'
curl https://zzshu.cc/api/usage/token/ \
  -H "Authorization: Bearer $ZZSHU_API_KEY"
```

```powershell [Windows PowerShell]
$env:ZZSHU_API_KEY = 'YOUR_ZZSHU_API_KEY'
Invoke-RestMethod https://zzshu.cc/api/usage/token/ `
  -Headers @{ Authorization = "Bearer $env:ZZSHU_API_KEY" } | ConvertTo-Json -Depth 5
```

:::

返回里 `code` 为 `true`，`data` 里有 `name`、`total_granted`、`total_used`、`total_available` 这几个字段，就说明接口可用。

## 2. 配置查询脚本

1. 在 CC Switch 里找到 `吱吱鼠AI` 卡片，点「配置用量查询」。
2. 开启用量查询，预设模板选「自定义」。
3. 粘贴下面的脚本。`{{apiKey}}` 保持原样，CC Switch 会自动替换成这个 Provider 的 Key：

```js
({
  request: {
    url: "https://zzshu.cc/api/usage/token/",
    method: "GET",
    headers: {
      "Authorization": "Bearer {{apiKey}}",
      "User-Agent": "cc-switch/1.0"
    }
  },
  extractor: function (response) {
    if (response.code === true && response.data) {
      return {
        isValid: true,
        planName: response.data.name,
        remaining: response.data.total_available,
        used: response.data.total_used,
        total: response.data.total_granted,
        unit: "quota"
      };
    }
    return {
      isValid: false,
      invalidMessage: response.message || "查询失败"
    };
  }
})
```

Provider 用的是备用线路时，把 `url` 里的域名换成同一条线路，路径不变：

<RouteTable suffix="/api/usage/token/" />

4. 点「格式化」检查语法，再点「测试脚本」，最后「保存配置」。

<!-- TODO: 截图 CC Switch 用量查询脚本配置界面 -->

## 3. 验证

保存后回到 Provider 列表，`吱吱鼠AI` 卡片上应该显示已用和剩余额度。

在客户端里发一条消息，打开 [使用日志](https://zzshu.cc/console/log) 核对请求时间、模型和状态，再刷新卡片，已用额度应该随之增加。

::: tip 额度单位
卡片显示的是这个令牌的额度，单位是 New API 内部的 quota，不是账户余额，也不是人民币或美元金额。账户余额和账单以 [控制台](https://zzshu.cc) 为准。
:::

<!-- TODO: 确认吱吱鼠AI 的 quota 与金额换算比例，以及令牌设为「无限额度」时接口返回的数值，必要时在这里补充说明 -->

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 测试脚本提示查询失败 | 先用第 1 步的命令单独测接口，确认 Key 有效 |
| 401 | Key 错误或已停用，回 Provider 里重新填 Key |
| 卡片数字和控制台余额对不上 | 卡片是令牌额度，控制台首页是账户余额，两者不是一回事 |
| 换了线路后查询失败 | 脚本里的域名要和 Provider 的请求地址用同一条线路 |

## 关闭

在卡片上点「配置用量查询」，关掉用量查询开关并保存。这不会影响 Provider 本身的请求。
