---
title: Claude Desktop
description: 用 CC Switch 给 Claude Desktop 写入吱吱鼠AI 的第三方配置，并分清第三方模式和官方账号登录。
---

# Claude Desktop

Claude Desktop 本身只接受 Anthropic 账号登录。要让它调用吱吱鼠AI，需要借助 [CC Switch](/integrations/cc-switch/) 写入第三方（3P）配置，再由 CC Switch 的本地路由把请求转发到吱吱鼠AI。

::: warning 两种模式不要混用
- **官方模式**：用 Anthropic 账号登录，不经过吱吱鼠AI。
- **第三方模式**：读取 CC Switch 写入的 3P 配置，请求走吱吱鼠AI。

不要改 OAuth、Cookie 或会话文件来绕过登录。
:::

## 1. 安装 Claude Desktop

从 [Claude 官方下载页](https://claude.com/download) 下载客户端。macOS 打开 DMG 后把 Claude.app 拖进「应用程序」；Windows 运行安装程序。

装好后先 **完全退出** Claude Desktop。CC Switch 写入配置后要重启客户端才生效，运行中的进程不会可靠地重新读取配置。

## 2. 准备 CC Switch 和 API Key

1. 按 [CC Switch 通用设置](/integrations/cc-switch/common) 安装 CC Switch 并备份原配置。
2. 打开 [令牌页面](https://zzshu.cc/console/token)，新建一个名为 `claude-desktop` 的 Key。
3. 分组选择带 Anthropic 端点的 Claude 分组，例如 `Claude Max`。
4. 到 [模型广场](https://zzshu.cc/pricing) 记下这个分组里要用的模型 ID，例如 `claude-sonnet-4-6`、`claude-opus-4-6`、`claude-haiku-5-5`。

## 3. 在 CC Switch 添加 Provider

在 CC Switch 顶部选择 **Claude Desktop** 分支（不是 Claude Code），点右上角 `+`，选「自定义配置」，按下表填写：

| 字段 | 填什么 |
| --- | --- |
| 供应商名称 | `吱吱鼠AI` |
| 官网链接 | `https://zzshu.cc` |
| API Key | 第 2 步创建的 Key |
| 请求地址 | 线路根地址，例如 `https://zzshu.cc`，不要加 `/v1/messages` |
| API 格式 | Anthropic Messages（原生） |
| 需要模型映射 | 开启 |

可用线路：

<RouteTable />

Claude Desktop 和 Claude Code 是两套配置。Claude Code 读 `~/.claude/settings.json`，Claude Desktop 读自己的 3P 配置。在 Claude Code 分支里配好的 Provider 不会自动出现在这里。

## 4. 配置模型映射

Claude Desktop 里选的是 Sonnet、Opus、Haiku 这类角色名，CC Switch 负责把角色换成吱吱鼠AI 的真实模型 ID。

1. 点「获取模型列表」。
2. 给要用的角色填上模型 ID，例如 Sonnet → `claude-sonnet-4-6`，Opus → `claude-opus-4-6`，Haiku → `claude-haiku-5-5`。
3. 只想用一个模型时，至少填一个角色，空着的角色会沿用第一个有效映射。
4. 只有模型确实支持 1M 上下文时才勾选 1M。

模型映射只改模型名，不做协议转换。映射到的模型必须支持 Anthropic Messages 端点。

<!-- TODO: 截图 CC Switch Claude Desktop 模型映射表单 -->

详细的字段说明见 [CC Switch 配置 Claude Desktop](/integrations/cc-switch/claude-desktop)。

## 5. 启用本地路由并重启

1. 保存 Provider，回到列表启用 `吱吱鼠AI`。
2. 打开「设置 → 路由 → 本地路由」，开启「在主页显示路由开关」。
3. 回到 Claude Desktop 分支，打开本地路由，确认状态是运行中。默认监听 `127.0.0.1:15721`。
4. 完全退出 Claude Desktop，再重新打开。

开启模型映射后，Claude Desktop 实际连接的是本地地址：

```text
http://127.0.0.1:15721/claude-desktop
```

使用期间 CC Switch 必须一直开着，关掉它请求就断了。

## 6. 验证

Claude Desktop 打开后应该直接进入第三方模式界面，不会出现 Anthropic 登录页。

1. 选择一个已映射的角色模型。
2. 发送一条短消息，例如「只回答 2+3 的结果」。
3. 打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。日志里的模型应该是你映射的那个 ID。

客户端有回复、日志有记录、模型和映射一致，三条都满足才算接入成功。只看到本地路由在运行，或者 Provider 显示已启用，都不能说明请求走通了。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 启动后出现 Sign in 登录页 | 当前读的是官方配置。回 CC Switch 的 Claude Desktop 分支启用 `吱吱鼠AI`，完全退出客户端后重开。不要把吱吱鼠AI 的 Key 填进登录框 |
| 第三方模式窗口空白 | 确认 CC Switch 还在运行、本地路由已开、当前 Provider 仍是 `吱吱鼠AI`，重新启用一次再重启客户端。还是空白就先恢复官方模式 |
| 有回复但使用日志里没记录 | 检查选中的是不是 Claude Desktop 分支，本地路由是否在运行 |
| 提示模型不存在 | 重新获取模型列表，确认映射的模型 ID 在 Key 所在分组里 |
| 401 | 重新复制 Key，检查前后有没有空格 |

## 配置文件位置

这些文件由 CC Switch 管理，排查时可以看，但不要手改里面的 Key 或本地路由令牌。配置出问题时，回 CC Switch 重新启用 Provider。

::: code-group

```text [macOS]
~/Library/Application Support/Claude/claude_desktop_config.json
~/Library/Application Support/Claude-3p/claude_desktop_config.json
~/Library/Application Support/Claude-3p/configLibrary/_meta.json
~/Library/Application Support/Claude-3p/configLibrary/00000000-0000-4000-8000-000000157210.json
```

```text [Windows]
%LOCALAPPDATA%\Claude\claude_desktop_config.json
%LOCALAPPDATA%\Claude-3p\claude_desktop_config.json
%LOCALAPPDATA%\Claude-3p\configLibrary\_meta.json
%LOCALAPPDATA%\Claude-3p\configLibrary\00000000-0000-4000-8000-000000157210.json
```

:::

字段和模式的完整说明见 [CC Switch 官方手册](https://github.com/farion1231/cc-switch/blob/main/docs/user-manual/en/2-providers/2.6-claude-desktop.md)。

## 恢复官方模式

在 CC Switch 的 Claude Desktop 分支启用「Claude Desktop 官方」，完全退出客户端后重开。官方模式不需要吱吱鼠AI 的 Key，也不需要本地路由。之后用自己的 Anthropic 账号登录即可。
