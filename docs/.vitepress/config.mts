import { defineConfig, type DefaultTheme } from 'vitepress'

const integrations: DefaultTheme.SidebarItem[] = [
  {
    text: '开始',
    items: [
      { text: '客户端接入向导', link: '/integrations/cli/' },
      { text: '环境检查', link: '/integrations/cli/environment' },
    ],
  },
  {
    text: '命令行客户端',
    items: [
      { text: 'Claude Code', link: '/integrations/cli/claude-code' },
      { text: 'Codex CLI', link: '/integrations/cli/codex' },
      { text: 'Kimi Code CLI', link: '/integrations/cli/kimi-code' },
      { text: 'Grok Build CLI', link: '/integrations/cli/grok-build' },
      { text: 'OpenCode', link: '/integrations/advanced/opencode' },
      { text: 'OpenClaw', link: '/integrations/advanced/openclaw' },
      { text: 'Hermes Agent', link: '/integrations/advanced/hermes' },
    ],
  },
  {
    text: '桌面应用与扩展',
    items: [
      { text: '概览', link: '/integrations/advanced/' },
      { text: 'Claude Desktop', link: '/integrations/advanced/claude-desktop' },
      { text: 'WorkBuddy', link: '/integrations/advanced/workbuddy' },
      { text: 'AionUI', link: '/integrations/advanced/aionui' },
      { text: 'All API Hub', link: '/integrations/advanced/all-api-hub' },
    ],
  },
  {
    text: '跨协议接入',
    items: [
      { text: 'GPT 模型接入 Claude Code', link: '/integrations/advanced/chatgpt-claude-code' },
      { text: 'DeepSeek 接入 Claude Code', link: '/integrations/advanced/deepseek-claude-code' },
      { text: 'DeepSeek 接入 Codex', link: '/integrations/advanced/deepseek-codex' },
    ],
  },
  {
    text: 'CC Switch',
    collapsed: true,
    items: [
      { text: '概览', link: '/integrations/cc-switch/' },
      { text: '通用设置', link: '/integrations/cc-switch/common' },
      { text: '配置 Claude Code', link: '/integrations/cc-switch/claude-code' },
      { text: '配置 Codex', link: '/integrations/cc-switch/codex' },
      { text: 'Codex App', link: '/integrations/cc-switch/codex-app' },
      { text: '配置 Claude Desktop', link: '/integrations/cc-switch/claude-desktop' },
      { text: '用量查询', link: '/integrations/cc-switch/usage-query' },
      { text: 'CC Switch CLI', link: '/integrations/cc-switch/cli' },
    ],
  },
  {
    text: '图像生成',
    collapsed: true,
    items: [
      { text: '概览', link: '/integrations/paint/' },
      { text: 'Gemini 图像模型', link: '/integrations/paint/banana' },
      { text: 'OpenAI Images 兼容', link: '/integrations/paint/gpt-image' },
    ],
  },
  {
    text: '常见问题',
    collapsed: true,
    items: [
      { text: '通用问题', link: '/faq/' },
      { text: 'Claude Code', link: '/faq/claude-code' },
      { text: 'Codex', link: '/faq/codex' },
      { text: 'Gemini', link: '/faq/gemini' },
      { text: '缓存与代理排查', link: '/integrations/cli/cache-fix' },
    ],
  },
]

export default defineConfig({
  lang: 'zh-CN',
  title: '吱吱鼠AI 文档',
  titleTemplate: ':title - 吱吱鼠AI',
  description: '吱吱鼠AI 客户端接入、使用指南与 API 参考',
  cleanUrls: true,
  lastUpdated: true,
  head: [
    ['link', { rel: 'icon', href: '/logo.jpg' }],
    ['meta', { name: 'theme-color', content: '#2563eb' }],
  ],
  themeConfig: {
    logo: '/logo.jpg',
    siteTitle: '吱吱鼠AI',
    nav: [
      { text: '客户端接入', link: '/integrations/cli/', activeMatch: '^/(integrations|faq)/' },
      { text: '使用指南', link: '/guides/overview', activeMatch: '^/guides/' },
      { text: 'API 参考', link: '/api/', activeMatch: '^/api/' },
      { text: '条款与政策', link: '/legal' },
      { text: '控制台', link: 'https://zzshu.cc' },
    ],
    sidebar: {
      '/integrations/': integrations,
      '/faq/': integrations,
      '/guides/': [{ text: '使用指南', items: [{ text: '快速开始', link: '/guides/overview' }] }],
      '/api/': [{ text: 'API 参考', items: [{ text: '接口总览', link: '/api/' }] }],
    },
    outline: { level: [2, 3], label: '本页目录' },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: { noResultsText: '没有找到相关结果', resetButtonTitle: '清除', footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' } },
        },
      },
    },
    docFooter: { prev: '上一篇', next: '下一篇' },
    lastUpdated: { text: '最后更新' },
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '目录',
    darkModeSwitchLabel: '外观',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    footer: { message: '吱吱鼠AI', copyright: `© ${new Date().getFullYear()} zzshu.cc` },
  },
})
