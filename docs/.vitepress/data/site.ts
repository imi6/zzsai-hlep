// 站点级配置：品牌、线路、模型分类。
// 修改线路或分类时只需要改这个文件，向导和文章里的地址表都会跟着变。

export const brand = {
  name: '吱吱鼠AI',
  /** 写进客户端配置里的 Provider ID，只用小写字母 */
  providerId: 'zzshu',
  /** 环境变量名 */
  envKey: 'ZZSHU_API_KEY',
  /** 代码示例里的 Key 占位符 */
  keyPlaceholder: 'YOUR_ZZSHU_API_KEY',
  console: 'https://zzshu.cc',
  tokenPage: 'https://zzshu.cc/console/token',
  logPage: 'https://zzshu.cc/console/log',
  pricingPage: 'https://zzshu.cc/pricing',
}

export interface Route {
  url: string
  name: string
  detail: string
  /** 占位线路：还没有真实地址，测速会跳过 */
  placeholder?: boolean
}

// TODO: 换成真实线路。url 只填根域名，不要带 /v1。
export const routes: Route[] = [
  { url: 'https://zzshu.cc', name: '主站', detail: 'CDN · 默认推荐' },
  { url: 'https://line2.zzshu.cc', name: '备用线路 A', detail: '示例 · 待替换', placeholder: true },
  { url: 'https://line3.zzshu.cc', name: '备用线路 B', detail: '示例 · 待替换', placeholder: true },
]

export interface Category {
  id: string
  label: string
  /** 分组名包含任意关键词即归入此类（不区分大小写） */
  include: string[]
  /** 分组名包含任意关键词则排除 */
  exclude?: string[]
  /** 只保留带这个端点的模型 */
  endpoint?: string
  preferredGroup: string
  tools: string[]
}

const common = ['claude', 'codex', 'opencode', 'openclaw', 'hermes', 'cherry', 'workbuddy', 'zcode', 'trae', 'dsh']
const extended = [...common, 'cursor', 'code', 'readfrog', 'kiss', 'immersive']

export const categories: Category[] = [
  {
    id: 'claude',
    label: 'Claude',
    include: ['claude'],
    exclude: ['kiro', '测试'],
    preferredGroup: 'Claude Max',
    tools: common,
  },
  {
    id: 'kiro',
    label: 'Kiro',
    include: ['kiro'],
    preferredGroup: 'Claude KIRO正价稳定版',
    tools: common,
  },
  {
    id: 'openai',
    label: 'OpenAI / Codex',
    include: ['gpt'],
    preferredGroup: 'GPT Pro稳定',
    tools: ['codex', 'pi', 'dsh', 'cursor', 'trae', 'claude', 'opencode', 'openclaw', 'hermes', 'cherry', 'workbuddy', 'zcode', 'code'],
  },
  {
    id: 'gemini',
    label: 'Gemini',
    include: ['gemini'],
    preferredGroup: 'Gemini',
    tools: ['gemini', ...extended],
  },
  {
    id: 'grok',
    label: 'Grok',
    include: ['grok'],
    preferredGroup: 'Grok Heavy',
    tools: [...common, 'cursor', 'code'],
  },
  {
    id: 'domestic',
    label: '国产模型',
    include: ['国模', 'deepseek', 'glm', 'kimi'],
    preferredGroup: '国模聚合',
    tools: extended,
  },
  {
    id: 'visual',
    label: '图像生成',
    include: [''],
    endpoint: 'image-generation',
    preferredGroup: 'Azure-GPT',
    tools: ['cherry', 'code'],
  },
]
