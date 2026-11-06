import { brand } from './site'
import { clients, rootOf, type Block, type Platform } from './clients'

export interface TutorialInput {
  client: string
  model: string
  endpoint: string
  platform: Platform
  image?: boolean
  /** 模型同时支持 Anthropic Messages（代码调用会多给一组示例） */
  anthropic?: boolean
}

const h = (text: string): Block => ({ kind: 'heading', text })
const t = (text: string): Block => ({ kind: 'text', text })
const c = (code: string, title?: string, lang?: string): Block => ({ kind: 'code', code, title, lang })

const json = (v: unknown) => JSON.stringify(v, null, 2)
const q = (v: string) => JSON.stringify(v)

export function buildTutorial(input: TutorialInput): Block[] {
  const { client, platform } = input
  const def = clients[client]
  if (!def) throw new Error(`unknown client: ${client}`)
  const model = input.model.trim()
  if (!model || /[\r\n\0]/.test(model)) throw new Error('invalid model id')

  const root = rootOf(input.endpoint)
  const v1 = root + '/v1'
  const id = brand.providerId
  const KEY = brand.envKey
  const PH = brand.keyPlaceholder
  const win = platform === 'windows'
  const shell = win ? 'powershell' : 'bash'
  const term = win ? 'Windows PowerShell' : 'macOS / Linux'

  const sq = (v: string) => (win ? `'${v.replaceAll("'", "''")}'` : `'${v.replaceAll("'", `'"'"'`)}'`)
  const setEnv = (k: string, v: string) => (win ? `$env:${k} = ${sq(v)}` : `export ${k}=${sq(v)}`)
  /** 跨平台路径：~/.x/y → %USERPROFILE%\.x\y */
  const p = (path: string) => (win ? path.replace(/^~/, '$HOME').replaceAll('/', '\\') : path)
  const mkdir = (dir: string) => (win ? `New-Item -ItemType Directory -Force "${p(dir)}" | Out-Null` : `mkdir -p ${dir}`)
  const edit = (file: string) => (win ? `notepad "${p(file)}"` : `nano ${file}`)
  const backup = (file: string) =>
    win
      ? `if (Test-Path "${p(file)}") { Copy-Item "${p(file)}" "${p(file)}.bak" }`
      : `cp ${file} ${file}.bak 2>/dev/null || true`
  const run = (cmd: string) => c(`${setEnv(KEY, PH)}\n${cmd}`, term, shell)
  const verify = t(`发送一条简短消息，然后打开${brand.name}控制台的「使用日志」，核对请求时间、模型和状态。两边一致才算接入成功。`)

  const installCli = (cmd: string, versionCmd: string): Block[] => [
    h(`安装 ${def.name}`),
    t('1. 确认 Node.js 版本满足客户端要求（建议 Node.js 20 或更新）。'),
    c('node --version', undefined, shell),
    t(`2. 安装或更新 ${def.name}。`),
    c(cmd, undefined, shell),
    t('3. 查看版本号，确认命令可用。'),
    c(versionCmd, undefined, shell),
  ]

  // ---- CLI 客户端 ----
  if (client === 'claude') {
    const file = '~/.claude/settings.json'
    return [
      ...installCli(def.install!, 'claude --version'),
      h('写入配置'),
      t(`4. 创建配置目录并备份已有设置。`),
      c(`${mkdir('~/.claude')}\n${backup(file)}`, undefined, shell),
      t('5. 打开 settings.json：'),
      c(edit(file), undefined, shell),
      t(`6. 把下面的 env 字段合并进去，保留原有的插件、Hook 等设置。Base URL 只填根地址，Claude Code 会自己补上 /v1/messages。`),
      c(json({ env: { ANTHROPIC_BASE_URL: root, ANTHROPIC_API_KEY: PH, ANTHROPIC_MODEL: model } }), file, 'json'),
      h('启动并验证'),
      t('7. 完全退出旧的 Claude Code 进程，重新打开终端后运行：'),
      c('claude', term, shell),
      verify,
    ]
  }

  if (client === 'codex') {
    const file = '~/.codex/config.toml'
    return [
      ...installCli(def.install!, 'codex --version'),
      h('写入配置'),
      t('4. 创建配置目录并备份已有配置。'),
      c(`${mkdir('~/.codex')}\n${backup(file)}`, undefined, shell),
      t('5. 打开 config.toml：'),
      c(edit(file), undefined, shell),
      t('6. 合并下面的 Provider 配置。Codex 使用 Responses API，wire_api 必须是 "responses"，base_url 要带 /v1。'),
      c(
        `model_provider = "${id}"\nmodel = ${q(model)}\n\n[model_providers.${id}]\nname = ${q(brand.name)}\nbase_url = ${q(v1)}\nenv_key = "${KEY}"\nwire_api = "responses"`,
        file,
        'toml',
      ),
      h('启动并验证'),
      t('7. 在同一个终端设置 Key 并启动 Codex。环境变量只对当前终端有效，Key 不会写进配置文件。'),
      run('codex'),
      verify,
    ]
  }

  if (client === 'opencode') {
    const file = '~/.config/opencode/opencode.json'
    const cfg = {
      $schema: 'https://opencode.ai/config.json',
      model: `${id}/${model}`,
      provider: {
        [id]: {
          npm: '@ai-sdk/openai-compatible',
          name: brand.name,
          options: { baseURL: v1, apiKey: `{env:${KEY}}` },
          models: { [model]: { name: model } },
        },
      },
    }
    return [
      ...installCli(def.install!, 'opencode -v'),
      h('写入配置'),
      t('4. 创建配置目录并打开 opencode.json。'),
      c(`${mkdir('~/.config/opencode')}\n${edit(file)}`, undefined, shell),
      t(`5. 合并下面的 Provider 配置。apiKey 从环境变量 ${KEY} 读取，配置文件里不出现真实 Key。`),
      c(json(cfg), file, 'json'),
      h('启动并验证'),
      t(`6. 设置 Key 后启动 OpenCode，在模型选择器里选择 ${brand.name}。`),
      run('opencode'),
      verify,
    ]
  }

  if (client === 'openclaw') {
    const file = '~/.openclaw/openclaw.json'
    const cfg = {
      models: {
        mode: 'merge',
        providers: {
          [id]: { baseUrl: v1, apiKey: `\${${KEY}}`, api: 'openai-completions', models: [{ id: model, name: model, input: ['text'] }] },
        },
      },
      agents: { defaults: { model: { primary: `${id}/${model}` } } },
    }
    return [
      ...installCli(def.install!, 'openclaw --version'),
      h('写入配置'),
      t('4. 备份并打开 OpenClaw 配置文件。'),
      c(`${backup(file)}\n${edit(file)}`, undefined, shell),
      t('5. 合并下面的 Provider 和默认模型设置。'),
      c(json(cfg), file, 'json'),
      h('启动并验证'),
      t('6. 设置 Key 并重启网关，让配置生效。'),
      run('openclaw gateway restart'),
      verify,
    ]
  }

  if (client === 'dsh') {
    return [
      ...installCli(def.install!, 'dsh --version'),
      h('写入配置'),
      t('4. 创建配置目录并打开 settings.yaml。'),
      c(`${mkdir('~/.dsh')}\n${edit('~/.dsh/settings.yaml')}`, undefined, shell),
      t('5. 合并下面的模型配置。Responses 地址填到 /v1 即可。'),
      c(
        `llm-pi-ai:\n  providers:\n    ${id}:\n      displayName: ${brand.name}\n      apiKeyEnv: ${KEY}\n      api: openai-responses\n      baseURL: ${q(v1)}\n      models:\n        - id: ${q(model)}\n          name: ${q(model)}\n\nagent-default-model:\n  provider: ${id}\n  model: ${q(model)}`,
        '~/.dsh/settings.yaml',
        'yaml',
      ),
      t('6. 打开凭据文件，填写与 apiKeyEnv 同名的条目。'),
      c(edit('~/.dsh/.credentials.yaml'), undefined, shell),
      c(`version: 1\nrefs:\n  ${KEY}: ${PH}`, '~/.dsh/.credentials.yaml', 'yaml'),
      ...(win ? [] : [t('限制凭据文件权限：'), c('chmod 600 ~/.dsh/.credentials.yaml', undefined, shell)]),
      h('启动并验证'),
      t(`7. 启动网页界面，在模型选择器里选择 ${brand.name} 的模型。`),
      c('dsh web', term, shell),
      verify,
    ]
  }

  if (client === 'hermes') {
    const file = '~/.hermes/config.yaml'
    return [
      h('安装 Hermes'),
      t(`1. 按 Hermes 官方文档安装客户端（${def.download}）。macOS / Linux 可以使用官方脚本：`),
      c('curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash', undefined, 'bash'),
      t('2. 重新打开终端，检查版本。'),
      c('hermes --version', undefined, shell),
      h('写入配置'),
      t('3. 打开 Hermes 配置文件：'),
      c(edit(file), undefined, shell),
      t('4. 合并下面的自定义 Provider。'),
      c(
        `model:\n  default: ${q(model)}\n  provider: custom:${id}\n\ncustom_providers:\n  - name: ${id}\n    base_url: ${q(v1)}\n    key_env: ${KEY}\n    api_mode: chat_completions`,
        file,
        'yaml',
      ),
      h('启动并验证'),
      t('5. 设置 Key，先用一条单次提问验证连接：'),
      run('hermes chat -q "Hello"'),
      t('需要交互界面时直接运行 hermes。'),
      verify,
    ]
  }

  if (client === 'pi') {
    const file = '~/.pi/agent/models.json'
    const cfg = { providers: { [id]: { baseUrl: v1, api: 'openai-responses', apiKey: `\${${KEY}}`, models: [{ id: model, name: model }] } } }
    return [
      ...installCli(def.install!, 'pi --version'),
      h('写入配置'),
      t('4. 创建配置目录并打开 models.json。'),
      c(`${mkdir('~/.pi/agent')}\n${edit(file)}`, undefined, shell),
      t('5. 合并下面的 Provider 配置。'),
      c(json(cfg), file, 'json'),
      h('启动并验证'),
      t(`6. 设置 Key 后启动 Pi，在 /model 菜单里选择 ${brand.name}。`),
      run('pi'),
      verify,
    ]
  }

  if (client === 'gemini') {
    const file = '~/.gemini/settings.json'
    return [
      ...installCli(def.install!, 'gemini --version'),
      h('写入配置'),
      t('4. 创建配置目录并打开 settings.json。'),
      c(`${mkdir('~/.gemini')}\n${edit(file)}`, undefined, shell),
      t('5. 合并下面的设置，让 Gemini CLI 使用 API Key 认证。'),
      c(json({ model: { name: model }, security: { auth: { selectedType: 'gemini-api-key' } } }), file, 'json'),
      h('启动并验证'),
      t(`6. 设置 Key 和 Base URL 后启动。Gemini CLI 走 Gemini 原生协议，Base URL 填根地址，不带 /v1。`),
      c(`${setEnv('GEMINI_API_KEY', PH)}\n${setEnv('GOOGLE_GEMINI_BASE_URL', root)}\ngemini`, term, shell),
      verify,
    ]
  }

  // ---- 代码调用 ----
  if (client === 'code') {
    const init = `from openai import OpenAI\n\nclient = OpenAI(\n    api_key="${PH}",\n    base_url=${q(v1)},\n)\n\n`
    if (input.image) {
      return [
        h('图片生成'),
        t('1. 安装 OpenAI Python SDK。'),
        c('pip install openai', undefined, shell),
        t('2. 调用 Images API 生成图片。'),
        c(init + `result = client.images.generate(\n    model=${q(model)},\n    prompt="一只戴蓝色毛线帽的小老鼠，扁平插画风格",\n    size="1024x1024",\n)\nprint(result.data[0].url or result.data[0].b64_json[:80])`, 'image.py', 'python'),
      ]
    }
    const body = JSON.stringify({ model, messages: [{ role: 'user', content: 'Hello' }] })
    const blocks: Block[] = [
      h('OpenAI 兼容格式'),
      t('1. 安装 OpenAI Python SDK。'),
      c('pip install openai', undefined, shell),
      t('2. 用 Python 或 curl 发送请求。'),
      c(init + `resp = client.chat.completions.create(\n    model=${q(model)},\n    messages=[{"role": "user", "content": "Hello"}],\n)\nprint(resp.choices[0].message.content)`, 'chat.py', 'python'),
      c(`curl ${v1}/chat/completions \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer ${PH}" \\\n  -d '${body}'`, 'curl', 'bash'),
    ]
    if (input.anthropic) {
      const abody = JSON.stringify({ model, max_tokens: 1024, messages: [{ role: 'user', content: 'Hello' }] })
      blocks.push(
        h('Anthropic Messages 格式'),
        t('这个模型同时支持 Anthropic 协议，也可以用 Anthropic SDK 调用。base_url 填根地址。'),
        c('pip install anthropic', undefined, shell),
        c(`import anthropic\n\nclient = anthropic.Anthropic(\n    api_key="${PH}",\n    base_url=${q(root)},\n)\n\nmsg = client.messages.create(\n    model=${q(model)},\n    max_tokens=1024,\n    messages=[{"role": "user", "content": "Hello"}],\n)\nprint(msg.content[0].text)`, 'messages.py', 'python'),
        c(`curl ${v1}/messages \\\n  -H "Content-Type: application/json" \\\n  -H "x-api-key: ${PH}" \\\n  -H "anthropic-version: 2023-06-01" \\\n  -d '${abody}'`, 'curl', 'bash'),
      )
    }
    return blocks
  }

  // ---- 图形界面客户端 ----
  const fields = (rows: [string, string][], title = `${def.name} · 自定义模型`): Block => ({
    kind: 'fields',
    title,
    fields: rows.map(([label, value]) => ({ label, value })),
  })
  const download = t(`从官网下载并安装 ${def.name}：${def.download}`)
  const keyStep = t(`1. 在${brand.name}控制台的「令牌」页面创建一个专用 API Key，分组选择能访问所选模型的分组。`)

  if (client === 'cherry' && input.image) {
    return [
      download,
      keyStep,
      t('2. 打开「设置 → 模型服务」，点击「添加」，提供商类型选择 New API，按下表填写。'),
      fields([['提供商名称', `${brand.name} Images`], ['提供商类型', 'New API'], ['API 地址', root], ['API 密钥', PH], ['模型 ID', model], ['端点类型', '图像生成（OpenAI）']], 'Cherry Studio · 图像提供商'),
      t('3. 点击「管理」获取模型列表，添加上面的模型 ID。'),
      t('4. 编辑这个模型，把端点类型改为「图像生成（OpenAI）」并保存。'),
      t('5. 回到首页，打开「绘画」，选择刚添加的提供商和模型。首次使用把尺寸和质量设为自动，数量设为 1。'),
    ]
  }

  if (client === 'cherry') {
    const anth = model.startsWith('claude-')
    return [
      download,
      keyStep,
      t(`2. 打开「设置 → 模型服务」，点击「添加」。Claude 模型选 Anthropic 类型，其他模型选 OpenAI 类型。`),
      fields([['提供商名称', brand.name], ['提供商类型', anth ? 'Anthropic' : 'OpenAI'], ['API 地址', root], ['API 密钥', PH], ['模型 ID', model]], 'Cherry Studio · 模型服务'),
      t('3. 点击「管理」获取模型列表，搜索并添加上面的模型 ID。'),
      t('4. 回到聊天界面，在顶部选择这个模型，发送一条消息测试。'),
      verify,
    ]
  }

  if (client === 'workbuddy') {
    return [
      download,
      keyStep,
      t('2. 点击左下角头像，进入「设置 → 模型」，点击「添加模型」。'),
      t('3. 选择「自定义 / Custom」，按下表填写，保持「自定义协议」关闭。'),
      fields([['API 地址', v1], ['API Key', PH], ['模型 ID', model]]),
      t('4. 保存后回到任务页面，在输入框的模型菜单里选择这个模型，发送一条消息测试。'),
      verify,
    ]
  }

  if (client === 'zcode') {
    return [
      download,
      keyStep,
      t(`2. 打开「模型设置」，添加供应商，名称填 ${brand.name}。`),
      fields([['供应商名称', brand.name], ['API 地址', v1], ['API Key', PH], ['模型 ID', model]]),
      t('3. 点击「添加模型」，填写模型 ID，上下文长度按模型实际能力填写。'),
      t(`4. 回到工作区，在输入框的模型菜单里展开 ${brand.name}，选择这个模型并发送消息。`),
      verify,
    ]
  }

  if (client === 'trae') {
    return [
      download,
      keyStep,
      t('2. 打开 TRAE SOLO 的模型设置，点击「添加模型」，展开「自定义配置」。'),
      t('3. API 格式选择 Anthropic Messages，Base URL 填根地址，并关闭「完整 URL」。'),
      fields([['API 格式', 'Anthropic Messages'], ['Base URL', root], ['API Key', PH], ['模型 ID', model]]),
      t('4. 提交后回到 SOLO 对话界面，选择这个模型并发送消息。'),
      verify,
    ]
  }

  if (client === 'cursor') {
    return [
      download,
      keyStep,
      t('2. 打开 Cursor Settings → Network，把 HTTP 兼容模式设为 HTTP/1.1。'),
      t('3. 进入 Models 页面，展开 API Keys，填入 Key；打开 Override OpenAI Base URL，填入下面的地址。'),
      fields([['OpenAI API Key', PH], ['Override OpenAI Base URL', v1], ['模型 ID', model]]),
      t('4. 在模型列表里点击「Add model」添加上面的模型 ID，回到聊天界面选择它并发送消息。'),
      verify,
    ]
  }

  if (client === 'readfrog') {
    return [
      download,
      keyStep,
      t('2. 打开 Read Frog 设置，在 API Providers 里选择 Anthropic。'),
      t('3. 填入 Key 和地址，勾选自定义模型名称，填写模型 ID。'),
      fields([['Provider', 'Anthropic'], ['Base URL', v1], ['API Key', PH], ['模型 ID', model]]),
      t('4. 点击 Test Connection 检查连接。'),
    ]
  }

  if (client === 'kiss' || client === 'immersive') {
    const isKiss = client === 'kiss'
    return [
      download,
      keyStep,
      t(isKiss ? '2. 打开 Kiss Translator 设置，添加翻译服务，类型选择 Claude。' : '2. 打开沉浸式翻译设置，进入「翻译服务 → 其他 / 自定义」，选择 Claude 服务。'),
      t('3. 地址要填完整的 /v1/messages 路径，并启用自定义模型名称。'),
      fields([['服务类型', 'Claude'], ['API 地址', v1 + '/messages'], ['API Key', PH], ['模型', model]]),
      t('4. 保存设置，打开一个外文网页测试翻译。'),
    ]
  }

  throw new Error(`no tutorial for client: ${client}`)
}
