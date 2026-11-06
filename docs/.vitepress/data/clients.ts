// 客户端定义。教程步骤见 tutorial.ts。

export type Protocol = 'anthropic' | 'openai' | 'openai-response' | 'gemini'
export type Platform = 'unix' | 'windows'

export interface ClientDef {
  name: string
  protocol: Protocol
  kind: 'cli' | 'gui' | 'code'
  install?: string
  download?: string
  /** 按钮上的字母徽标 */
  badge: string
  color: string
  /** 完整文章路径 */
  guide?: string
}

export const clients: Record<string, ClientDef> = {
  claude: { name: 'Claude Code', protocol: 'anthropic', kind: 'cli', install: 'npm install -g @anthropic-ai/claude-code', badge: 'CC', color: '#D97757', guide: '/integrations/cli/claude-code' },
  codex: { name: 'Codex', protocol: 'openai-response', kind: 'cli', install: 'npm install -g @openai/codex', badge: 'CX', color: '#111827', guide: '/integrations/cli/codex' },
  dsh: { name: 'dsh', protocol: 'openai-response', kind: 'cli', install: 'npm install -g @deepseek-ai/dsh', badge: 'DS', color: '#4D6BFE' },
  opencode: { name: 'OpenCode', protocol: 'openai', kind: 'cli', install: 'npm install -g opencode-ai', badge: 'OC', color: '#334155', guide: '/integrations/advanced/opencode' },
  openclaw: { name: 'OpenClaw', protocol: 'openai', kind: 'cli', install: 'npm install -g openclaw', badge: 'CL', color: '#E5484D', guide: '/integrations/advanced/openclaw' },
  hermes: { name: 'Hermes', protocol: 'openai', kind: 'cli', download: 'https://hermes-agent.nousresearch.com/docs/', badge: 'HM', color: '#7C3AED', guide: '/integrations/advanced/hermes' },
  pi: { name: 'Pi', protocol: 'openai-response', kind: 'cli', install: 'npm install -g --ignore-scripts @earendil-works/pi-coding-agent', badge: 'Pi', color: '#0EA5E9' },
  gemini: { name: 'Gemini CLI', protocol: 'gemini', kind: 'cli', install: 'npm install -g @google/gemini-cli', badge: 'GM', color: '#1A73E8', guide: '/faq/gemini' },
  cherry: { name: 'Cherry Studio', protocol: 'openai', kind: 'gui', download: 'https://www.cherryai.com/', badge: 'CS', color: '#E11D48' },
  workbuddy: { name: 'WorkBuddy', protocol: 'openai', kind: 'gui', download: 'https://www.workbuddy.ai/', badge: 'WB', color: '#2563EB', guide: '/integrations/advanced/workbuddy' },
  zcode: { name: 'ZCode', protocol: 'openai', kind: 'gui', download: 'https://zcode.z.ai/', badge: 'ZC', color: '#0F172A' },
  trae: { name: 'TRAE SOLO', protocol: 'anthropic', kind: 'gui', download: 'https://www.trae.ai/', badge: 'TR', color: '#16A34A' },
  cursor: { name: 'Cursor', protocol: 'openai', kind: 'gui', download: 'https://cursor.com/', badge: 'CU', color: '#1F2937' },
  readfrog: { name: 'Read Frog', protocol: 'anthropic', kind: 'gui', download: 'https://www.readfrog.app/', badge: 'RF', color: '#22C55E' },
  kiss: { name: 'Kiss Translator', protocol: 'anthropic', kind: 'gui', download: 'https://github.com/fishjar/kiss-translator', badge: 'KT', color: '#F97316' },
  immersive: { name: '沉浸式翻译', protocol: 'anthropic', kind: 'gui', download: 'https://immersivetranslate.com/', badge: '译', color: '#EA580C' },
  code: { name: '代码调用', protocol: 'openai', kind: 'code', badge: '</>', color: '#475569' },
}

export interface CatalogModel {
  name: string
  groups: string[]
  endpoints: string[]
}

/** 当前分组下与客户端协议兼容的模型 */
export function compatibleModels(models: CatalogModel[], group: string, client: string, endpoint?: string) {
  const def = clients[client]
  return models.filter(
    (m) =>
      m.endpoints.includes(def.protocol) &&
      (!endpoint || m.endpoints.includes(endpoint)) &&
      (group === '__all__' || m.groups.includes(group)),
  )
}

export type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'text'; text: string }
  | { kind: 'code'; code: string; title?: string; lang?: string }
  | { kind: 'fields'; title: string; fields: { label: string; value: string }[] }

/** 去掉末尾斜杠和 /v1，得到线路根地址 */
export function rootOf(endpoint: string) {
  return endpoint.replace(/\/+$/, '').replace(/\/v1$/, '')
}
