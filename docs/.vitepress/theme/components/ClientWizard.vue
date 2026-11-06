<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { withBase } from 'vitepress'
import catalog from '../../data/catalog.json'
import { brand, categories, routes } from '../../data/site'
import { clients, compatibleModels, type Platform } from '../../data/clients'
import { buildTutorial } from '../../data/tutorial'

const CUSTOM = '__custom__'
const ALL = '__all__'

const categoryId = ref('claude')
const group = ref('Claude Max')
const preferredClient = ref('claude')
const model = ref('')
const customModel = ref('')
const endpoint = ref(routes[0].url)
const platform = ref<Platform>('unix')
const feedback = ref('')
const probing = ref(false)
const latency = ref<Record<string, string>>({})

const category = computed(() => categories.find((c) => c.id === categoryId.value)!)

/** 当前分类下可选的分组 */
const groups = computed(() => {
  const cat = category.value
  return catalog.groups.filter((g) => {
    const id = g.id.toLowerCase()
    if (!cat.include.some((k) => id.includes(k.toLowerCase()))) return false
    if (cat.exclude?.some((k) => id.includes(k.toLowerCase()))) return false
    if (cat.endpoint) return catalog.models.some((m) => m.groups.includes(g.id) && m.endpoints.includes(cat.endpoint!))
    return true
  })
})
const groupInfo = computed(() => catalog.groups.find((g) => g.id === group.value))

const compatible = computed(() =>
  category.value.tools.filter((id) => compatibleModels(catalog.models, group.value, id, category.value.endpoint).length > 0),
)
const client = computed(() =>
  compatible.value.includes(preferredClient.value) ? preferredClient.value : compatible.value[0] || preferredClient.value,
)
const tool = computed(() => clients[client.value])

const models = computed(() => compatibleModels(catalog.models, group.value, client.value, category.value.endpoint))
const selectedModel = computed(() => {
  if (model.value === CUSTOM) return CUSTOM
  if (models.value.some((m) => m.name === model.value)) return model.value
  return models.value[0]?.name || CUSTOM
})
const currentModel = computed(() => (selectedModel.value === CUSTOM ? customModel.value.trim() : selectedModel.value))
const valid = computed(() => !!currentModel.value && !/[\r\n\0]/.test(currentModel.value))

const blocks = computed(() => {
  if (!valid.value) return []
  const m = catalog.models.find((x) => x.name === currentModel.value)
  return buildTutorial({
    client: client.value,
    model: currentModel.value,
    endpoint: endpoint.value,
    platform: platform.value,
    image: category.value.id === 'visual',
    anthropic: !!m?.endpoints.includes('anthropic'),
  })
})
const showPlatform = computed(() => tool.value.kind === 'cli')

function selectCategory(id: string) {
  const next = categories.find((c) => c.id === id)!
  categoryId.value = id
  const list = groups.value
  group.value = list.some((g) => g.id === next.preferredGroup) ? next.preferredGroup : list[0]?.id || ALL
  if (!next.tools.includes(preferredClient.value)) preferredClient.value = next.tools[0]
  model.value = ''
  feedback.value = ''
}

function selectClient(id: string) {
  preferredClient.value = id
  model.value = ''
  feedback.value = ''
}

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    feedback.value = '已复制'
  } catch {
    feedback.value = '复制失败，请手动选中代码复制。'
  }
  setTimeout(() => (feedback.value = ''), 1800)
}

async function probe() {
  probing.value = true
  latency.value = {}
  await Promise.all(
    routes.map(async (r) => {
      if (r.placeholder) {
        latency.value = { ...latency.value, [r.url]: '未开通' }
        return
      }
      const ctrl = new AbortController()
      const timer = setTimeout(() => ctrl.abort(), 6000)
      const start = performance.now()
      try {
        await fetch(r.url + '/api/status', { mode: 'no-cors', cache: 'no-store', signal: ctrl.signal })
        latency.value = { ...latency.value, [r.url]: `${Math.round(performance.now() - start)} ms` }
      } catch (e) {
        latency.value = { ...latency.value, [r.url]: ctrl.signal.aborted ? '超时' : '失败' }
      } finally {
        clearTimeout(timer)
      }
    }),
  )
  probing.value = false
}

onMounted(() => {
  const params = new URLSearchParams(location.search)
  const want = params.get('client')
  if (want && clients[want]) {
    if (!category.value.tools.includes(want)) {
      const next = categories.find((c) => c.tools.includes(want))
      if (next) selectCategory(next.id)
    }
    preferredClient.value = want
  }
  if (/Windows/i.test(navigator.userAgent)) platform.value = 'windows'
})

watch(client, (id) => {
  if (typeof window === 'undefined') return
  const url = new URL(location.href)
  url.searchParams.set('client', id)
  history.replaceState(history.state, '', url)
})
</script>
<template>
  <div class="zw">
    <header class="zw-hero">
      <img :src="withBase('/logo.jpg')" alt="" class="zw-hero-logo" />
      <div>
        <h1>客户端接入使用指南</h1>
        <p>选择模型类型、分组、客户端和线路，下面会生成对应的安装命令和配置。把 <code>{{ brand.keyPlaceholder }}</code> 换成你在控制台创建的 API Key 即可。</p>
      </div>
    </header>

    <nav class="zw-tabs" role="tablist" aria-label="模型类型">
      <button
        v-for="c in categories"
        :key="c.id"
        role="tab"
        type="button"
        :aria-selected="c.id === categoryId"
        @click="selectCategory(c.id)"
      >{{ c.label }}</button>
    </nav>

    <section class="zw-panel">
      <div class="zw-row">
        <label class="zw-field">
          <span>模型分组</span>
          <select v-model="group" @change="model = ''">
            <option :value="ALL">全部分组</option>
            <option v-for="g in groups" :key="g.id" :value="g.id">
              {{ g.id }}{{ g.ratio != null ? ` · ${g.ratio}x` : '' }}
            </option>
          </select>
        </label>
        <label class="zw-field">
          <span>模型</span>
          <select :value="selectedModel" @change="model = ($event.target as HTMLSelectElement).value">
            <option v-for="m in models" :key="m.name" :value="m.name">{{ m.name }}</option>
            <option :value="CUSTOM">自定义模型 ID…</option>
          </select>
        </label>
        <label v-if="selectedModel === CUSTOM" class="zw-field">
          <span>完整模型 ID</span>
          <input v-model="customModel" spellcheck="false" placeholder="例如 claude-sonnet-4-6" />
        </label>
      </div>
      <p v-if="groupInfo?.desc" class="zw-group-desc">{{ groupInfo.desc }}</p>

      <div class="zw-label">客户端</div>
      <div class="zw-clients" aria-label="选择客户端">
        <button
          v-for="id in category.tools"
          :key="id"
          type="button"
          class="zw-client"
          :aria-pressed="client === id"
          :disabled="!compatible.includes(id)"
          :title="compatible.includes(id) ? undefined : '当前分组没有与这个客户端兼容的模型'"
          @click="selectClient(id)"
        >
          <span class="zw-badge" :style="{ background: clients[id].color }">{{ clients[id].badge }}</span>
          {{ clients[id].name }}
        </button>
      </div>

      <div class="zw-label zw-label-row">
        <span>线路</span>
        <button type="button" class="zw-link" :disabled="probing" @click="probe">{{ probing ? '测速中…' : '测速' }}</button>
      </div>
      <div class="zw-routes">
        <button
          v-for="r in routes"
          :key="r.url"
          type="button"
          class="zw-route"
          :aria-pressed="endpoint === r.url"
          @click="endpoint = r.url"
        >
          <strong>{{ r.name }}</strong>
          <span>{{ r.detail }}</span>
          <code>{{ r.url }}</code>
          <em v-if="latency[r.url]">{{ latency[r.url] }}</em>
        </button>
      </div>

      <div v-if="showPlatform" class="zw-platform" role="radiogroup" aria-label="操作系统">
        <button type="button" :aria-pressed="platform === 'unix'" @click="platform = 'unix'">macOS / Linux</button>
        <button type="button" :aria-pressed="platform === 'windows'" @click="platform = 'windows'">Windows</button>
      </div>
    </section>

    <div class="zw-feedback" role="status" aria-live="polite">{{ feedback }}</div>

    <article class="zw-article" :aria-label="`${tool.name} 配置教程`">
      <h2 class="zw-article-title">
        <span class="zw-badge" :style="{ background: tool.color }">{{ tool.badge }}</span>
        {{ tool.name }} 配置步骤
      </h2>
      <template v-if="valid">
        <template v-for="(b, i) in blocks" :key="i">
          <h3 v-if="b.kind === 'heading'">{{ b.text }}</h3>
          <p v-else-if="b.kind === 'text'">{{ b.text }}</p>
          <div v-else-if="b.kind === 'code'" class="zw-code">
            <div class="zw-code-bar">
              <span>{{ b.title || b.lang || '命令' }}</span>
              <button type="button" @click="copy(b.code)">复制</button>
            </div>
            <pre><code>{{ b.code }}</code></pre>
          </div>
          <div v-else-if="b.kind === 'fields'" class="zw-code">
            <div class="zw-code-bar">
              <span>{{ b.title }}</span>
              <button type="button" @click="copy(b.fields.map((f) => `${f.label}: ${f.value}`).join('\n'))">复制全部</button>
            </div>
            <table class="zw-fields">
              <tbody>
                <tr v-for="f in b.fields" :key="f.label">
                  <th>{{ f.label }}</th>
                  <td><code>{{ f.value }}</code></td>
                  <td><button type="button" @click="copy(f.value)">复制</button></td>
                </tr>
              </tbody>
            </table>
          </div>
        </template>
      </template>
      <p v-else>请选择一个兼容的模型，或者填写你的 API Key 实际能用的完整模型 ID。</p>

      <p class="zw-more">
        <a v-if="tool.guide" :href="withBase(tool.guide)">完整文章与故障排查 →</a>
        <a :href="withBase('/faq/')">常见问题 →</a>
      </p>
      <p class="zw-meta">模型数据更新于 {{ catalog.updatedAt.slice(0, 10) }}，以<a :href="brand.pricingPage" target="_blank" rel="noopener">控制台模型广场</a>为准。</p>
    </article>
  </div>
</template>

<style scoped>
.zw { max-width: 1040px; margin: 0 auto; padding: 32px 24px 64px; }
.zw-hero { display: flex; gap: 20px; align-items: center; margin-bottom: 28px; }
.zw-hero-logo { width: 72px; height: 72px; border-radius: 18px; flex: none; box-shadow: 0 6px 20px rgba(43, 108, 233, 0.25); }
.zw-hero h1 { font-size: 28px; line-height: 1.3; font-weight: 700; margin: 0 0 6px; }
.zw-hero p { margin: 0; color: var(--vp-c-text-2); line-height: 1.7; }
.zw-hero code, .zw-article p code { font-size: 0.9em; padding: 1px 6px; border-radius: 4px; background: var(--vp-c-default-soft); }

.zw-tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.zw-tabs button {
  padding: 7px 16px; border-radius: 999px; font-size: 14px; font-weight: 500;
  border: 1px solid var(--vp-c-divider); color: var(--vp-c-text-2); background: var(--vp-c-bg);
  transition: all 0.15s;
}
.zw-tabs button:hover { color: var(--vp-c-brand-1); border-color: var(--vp-c-brand-2); }
.zw-tabs button[aria-selected='true'] { color: #fff; background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); }

.zw-panel { border: 1px solid var(--vp-c-divider); border-radius: 16px; padding: 20px; background: var(--vp-c-bg-soft); }
.zw-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.zw-field { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--vp-c-text-2); }
.zw-field select, .zw-field input {
  height: 38px; padding: 0 10px; border-radius: 8px; font-size: 14px; color: var(--vp-c-text-1);
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
}
.zw-field select:focus, .zw-field input:focus { outline: 2px solid var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1); }
.zw-group-desc { margin: 10px 0 0; font-size: 13px; color: var(--vp-c-text-2); }

.zw-label { margin: 18px 0 8px; font-size: 13px; font-weight: 600; color: var(--vp-c-text-2); }
.zw-label-row { display: flex; align-items: center; gap: 12px; }
.zw-link { font-size: 13px; color: var(--vp-c-brand-1); font-weight: 500; }
.zw-link:disabled { opacity: 0.6; }

.zw-clients { display: flex; flex-wrap: wrap; gap: 8px; }
.zw-client {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px 6px 6px; border-radius: 10px;
  font-size: 14px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); transition: all 0.15s;
}
.zw-client:hover:not(:disabled) { border-color: var(--vp-c-brand-2); }
.zw-client[aria-pressed='true'] { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); font-weight: 600; }
.zw-client:disabled { opacity: 0.4; cursor: not-allowed; }
.zw-badge {
  display: inline-flex; align-items: center; justify-content: center; min-width: 26px; height: 26px; padding: 0 4px;
  border-radius: 7px; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: -0.02em;
}

.zw-routes { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 8px; }
.zw-route {
  position: relative; display: flex; flex-direction: column; align-items: flex-start; gap: 2px; padding: 10px 12px;
  text-align: left; border-radius: 10px; border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
}
.zw-route strong { font-size: 14px; }
.zw-route span { font-size: 12px; color: var(--vp-c-text-2); }
.zw-route code { font-size: 12px; color: var(--vp-c-text-3); word-break: break-all; }
.zw-route em { position: absolute; top: 10px; right: 12px; font-style: normal; font-size: 12px; color: var(--vp-c-brand-1); }
.zw-route[aria-pressed='true'] { border-color: var(--vp-c-brand-1); background: var(--vp-c-brand-soft); }

.zw-platform { display: inline-flex; margin-top: 16px; padding: 3px; border-radius: 10px; background: var(--vp-c-default-soft); }
.zw-platform button { padding: 5px 14px; border-radius: 8px; font-size: 13px; color: var(--vp-c-text-2); }
.zw-platform button[aria-pressed='true'] { background: var(--vp-c-bg); color: var(--vp-c-text-1); font-weight: 600; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }

.zw-feedback { min-height: 24px; margin: 8px 0; font-size: 13px; color: var(--vp-c-brand-1); text-align: right; }

.zw-article { border: 1px solid var(--vp-c-divider); border-radius: 16px; padding: 24px; }
.zw-article-title { display: flex; align-items: center; gap: 10px; margin: 0 0 8px; font-size: 20px; font-weight: 700; border: 0; padding: 0; }
.zw-article h3 { margin: 24px 0 8px; font-size: 16px; font-weight: 600; }
.zw-article p { margin: 8px 0; line-height: 1.75; }
.zw-code { margin: 10px 0 14px; border-radius: 10px; overflow: hidden; border: 1px solid var(--vp-c-divider); background: var(--vp-code-block-bg); }
.zw-code-bar { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; font-size: 12px; color: var(--vp-c-text-2); border-bottom: 1px solid var(--vp-c-divider); }
.zw-code button, .zw-fields button { font-size: 12px; color: var(--vp-c-brand-1); font-weight: 500; }
.zw-code pre { margin: 0; padding: 14px 16px; overflow-x: auto; font-size: 13px; line-height: 1.6; }
.zw-code pre code { font-family: var(--vp-font-family-mono); color: var(--vp-code-block-color); white-space: pre; }
.zw-fields { width: 100%; margin: 0; border-collapse: collapse; display: table; font-size: 13px; }
.zw-fields th, .zw-fields td { border: 0; border-top: 1px solid var(--vp-c-divider); padding: 8px 12px; background: transparent; }
.zw-fields tr:first-child th, .zw-fields tr:first-child td { border-top: 0; }
.zw-fields th { width: 30%; text-align: left; font-weight: 500; color: var(--vp-c-text-2); white-space: nowrap; }
.zw-fields td code { word-break: break-all; }
.zw-fields td:last-child { width: 1%; text-align: right; }
.zw-more { display: flex; flex-wrap: wrap; gap: 16px; margin-top: 24px !important; }
.zw-more a, .zw-meta a { color: var(--vp-c-brand-1); font-weight: 500; }
.zw-meta { font-size: 12px; color: var(--vp-c-text-3); }

@media (max-width: 640px) {
  .zw { padding: 20px 16px 48px; }
  .zw-hero { flex-direction: column; align-items: flex-start; }
  .zw-hero h1 { font-size: 24px; }
  .zw-article { padding: 16px; }
}
</style>
