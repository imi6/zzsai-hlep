---
title: CC Switch 通用设置
description: 安装 CC Switch，备份客户端配置，添加和恢复吱吱鼠AI Provider。
---

# CC Switch 通用设置

这篇讲所有客户端分支都要做的事：安装、备份、添加 Provider、恢复。具体客户端的差异见各自的文章。

## 1. 下载安装

只从 [官方发布页](https://github.com/farion1231/cc-switch/releases) 或官方网站下载。

| 系统 | 选哪个包 |
| --- | --- |
| Windows | 普通电脑选 x64 的 `.msi`，ARM 设备选标有 ARM64 的包 |
| macOS | Apple Silicon 选 `aarch64`，Intel 选 `x64`；也可以用 Homebrew |
| Linux | Debian / Ubuntu 用 `.deb`，Fedora / RHEL 用 `.rpm`，其他发行版用 AppImage |

macOS 用 Homebrew 安装：

```bash
brew tap farion1231/ccswitch
brew install --cask cc-switch
```

Linux 安装 `.deb` 时，把 `<version>` 换成 Releases 页面里的真实文件名：

```bash
sudo dpkg -i ./cc-switch_<version>_amd64.deb
```

装好后打开「设置 → 关于」核对版本。先把 CC Switch 和要管理的客户端各启动一次，让它们创建配置目录。

## 2. 备份原配置

CC Switch 切换 Provider 时会改写客户端的配置文件。先完全退出 Claude Code 和 Codex，再备份。文件不存在会自动跳过：

::: code-group

```bash [macOS / Linux]
mkdir -p "$HOME/cc-switch-backup"
cp -p ~/.claude/settings.json "$HOME/cc-switch-backup/claude-settings.json" 2>/dev/null || true
cp -p ~/.codex/config.toml "$HOME/cc-switch-backup/codex-config.toml" 2>/dev/null || true
cp -p ~/.codex/auth.json "$HOME/cc-switch-backup/codex-auth.json" 2>/dev/null || true
shasum -a 256 ~/.claude/settings.json ~/.codex/config.toml 2>/dev/null
```

```powershell [Windows PowerShell]
$bak = "$HOME\cc-switch-backup"
New-Item -ItemType Directory -Force $bak | Out-Null
if (Test-Path "$HOME\.claude\settings.json") { Copy-Item "$HOME\.claude\settings.json" "$bak\claude-settings.json" }
if (Test-Path "$HOME\.codex\config.toml") { Copy-Item "$HOME\.codex\config.toml" "$bak\codex-config.toml" }
if (Test-Path "$HOME\.codex\auth.json") { Copy-Item "$HOME\.codex\auth.json" "$bak\codex-auth.json" }
Get-FileHash "$HOME\.claude\settings.json", "$HOME\.codex\config.toml" -ErrorAction SilentlyContinue
```

:::

记下输出的校验和，恢复时用来比对。备份里可能有 Key 或登录状态，不要上传到云盘、公开仓库或发给别人。

## 3. 创建专用 API Key

打开 [令牌页面](https://zzshu.cc/console/token)，按客户端分别建 Key，例如 `cc-switch-claude`、`cc-switch-codex`。分组要包含你准备用的模型：

| 客户端 | 分组示例 | 模型示例 |
| --- | --- | --- |
| Claude Code、Claude Desktop | `Claude Max` | `claude-sonnet-4-6` |
| Codex | `GPT Pro稳定` | `gpt-5.6-sol` |

到 [模型广场](https://zzshu.cc/pricing) 核对模型 ID 和支持的端点。

## 4. 添加吱吱鼠AI Provider

下面以 Claude Code 分支为例，其他分支步骤相同，只是地址不同。

1. 打开 CC Switch，在顶部图标栏选要配置的客户端。不同分支写入的配置格式不一样，先确认选对了。
2. 点右上角 `+`，在「添加新供应商」页面选「自定义配置」。
3. 按下表填写：

| 字段 | 填什么 |
| --- | --- |
| 供应商名称 | `吱吱鼠AI` |
| 官网链接 | `https://zzshu.cc` |
| API Key | 第 3 步创建的 Key |
| 请求地址 | Anthropic 分支填 `https://zzshu.cc`；OpenAI 兼容分支填 `https://zzshu.cc/v1` |
| 模型 | 模型广场里这个分组的准确模型 ID |

可用线路（OpenAI 兼容分支在后面加 `/v1`）：

<RouteTable />

::: warning
Anthropic 分支不要追加 `/v1/messages`。OpenAI 兼容分支只保留一个 `/v1`。
:::

4. 不需要继承本机的插件、Hook 或环境变量时，关闭「应用通用配置」，点击「保存」。
5. 回到 Provider 列表，点 `吱吱鼠AI` 卡片的「启用」，卡片显示「使用中」就切换好了。

<!-- TODO: 截图 CC Switch 自定义配置表单（Key 打码） -->

## 5. 验证

完全退出并重启目标客户端，发一条最短的消息，例如 `ping`。收到回复后打开 [使用日志](https://zzshu.cc/console/log)，核对请求时间、模型和状态。

文本对话正常后，再打开工具调用、长上下文或自动执行这些功能。

## 常见问题

| 现象 | 处理 |
| --- | --- |
| 顶部没有目标客户端 | 打开「设置 → 通用」，检查应用可见性里有没有把它隐藏 |
| 已启用但客户端还走旧地址 | 确认卡片显示「使用中」，完全退出客户端后重开 |
| 模型不存在 | 到模型广场重新核对这个分组的模型 ID，不要照抄示例 |
| 桌面版和 CLI 版同时在用 | 两者可能互相覆盖配置，一次只用一种 |

## 恢复

1. 在 CC Switch 里切回原来的 Provider，关闭本地代理或路由接管。
2. 完全退出 CC Switch，重新计算配置文件的校验和，和备份时记下的比对。
3. 不一致的话，确认没有进程还在写配置，再从备份恢复：

::: code-group

```bash [macOS / Linux]
cp -p "$HOME/cc-switch-backup/claude-settings.json" ~/.claude/settings.json
cp -p "$HOME/cc-switch-backup/codex-config.toml" ~/.codex/config.toml
cp -p "$HOME/cc-switch-backup/codex-auth.json" ~/.codex/auth.json
```

```powershell [Windows PowerShell]
$bak = "$HOME\cc-switch-backup"
Copy-Item "$bak\claude-settings.json" "$HOME\.claude\settings.json"
Copy-Item "$bak\codex-config.toml" "$HOME\.codex\config.toml"
Copy-Item "$bak\codex-auth.json" "$HOME\.codex\auth.json"
```

:::

只恢复你备份过的文件，没有备份的那一行跳过。
