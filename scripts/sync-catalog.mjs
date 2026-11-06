// 从 zzshu.cc 拉取模型/分组快照，写入 docs/.vitepress/data/catalog.json。
// 用法：npm run sync:catalog
import { writeFile } from 'node:fs/promises'

const SOURCE = 'https://zzshu.cc/api/pricing'
const OUT = new URL('../docs/.vitepress/data/catalog.json', import.meta.url)

// 不在文档里展示的分组
const HIDDEN_GROUPS = new Set(['auto', '模型测试分组', '专属无限测试', 'Claude 测试专属', 'Claude 测试专属-1'])

// 后台 GPT 分组的模型目前只标了 openai 端点。Codex 走 Responses API，
// 这里先把 GPT 分组里的 GPT/Codex/o 系列模型视为支持 openai-response。
// 后台补齐端点标注后，把这个开关改成 false。
const ASSUME_GPT_RESPONSES = true
const isGptGroup = (g) => /gpt/i.test(g)
const isResponsesModel = (name) => /^(gpt-|codex|o\d)/i.test(name) && !/(image|dalle|embedding|all$)/i.test(name)

const res = await fetch(SOURCE, { headers: { 'User-Agent': 'zzshu-docs-sync' } })
if (!res.ok) throw new Error(`${SOURCE} -> HTTP ${res.status}`)
const body = await res.json()
if (!body.success || !Array.isArray(body.data)) throw new Error('unexpected /api/pricing payload')

const usable = body.usable_group || {}
const ratio = body.group_ratio || {}
const groups = Object.keys(usable)
  .filter((id) => !HIDDEN_GROUPS.has(id))
  .map((id) => ({ id, desc: String(usable[id] || '').trim(), ratio: ratio[id] ?? null }))
const groupSet = new Set(groups.map((g) => g.id))

const models = body.data
  .map((m) => {
    const modelGroups = (m.enable_groups || []).filter((g) => groupSet.has(g))
    const endpoints = new Set(m.supported_endpoint_types || [])
    if (ASSUME_GPT_RESPONSES && modelGroups.some(isGptGroup) && isResponsesModel(m.model_name)) {
      endpoints.add('openai-response')
    }
    return { name: m.model_name, groups: modelGroups, endpoints: [...endpoints].sort() }
  })
  .filter((m) => m.groups.length > 0)
  .sort((a, b) => a.name.localeCompare(b.name))

const catalog = { updatedAt: new Date().toISOString(), source: SOURCE, groups, models }
await writeFile(OUT, JSON.stringify(catalog, null, 2) + '\n', 'utf8')
console.log(`catalog: ${groups.length} groups, ${models.length} models -> ${OUT.pathname}`)
