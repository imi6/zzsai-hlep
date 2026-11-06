// 检查每个客户端 × 系统 × 线路都能生成教程，且 JSON 配置可以解析。
// 用法：node scripts/check-tutorials.mjs
import { build } from 'esbuild'
import { readFile } from 'node:fs/promises'

const out = await build({
  entryPoints: ['docs/.vitepress/data/tutorial.ts'],
  bundle: true,
  write: false,
  format: 'esm',
  platform: 'node',
})
const mod = await import('data:text/javascript;base64,' + Buffer.from(out.outputFiles[0].text).toString('base64'))
const { clients } = await import('data:text/javascript;base64,' + Buffer.from((await build({ entryPoints: ['docs/.vitepress/data/clients.ts'], bundle: true, write: false, format: 'esm' })).outputFiles[0].text).toString('base64'))
const catalog = JSON.parse(await readFile('docs/.vitepress/data/catalog.json', 'utf8'))

let n = 0
const errors = []
for (const client of Object.keys(clients)) {
  for (const platform of ['unix', 'windows']) {
    for (const image of client === 'cherry' || client === 'code' ? [false, true] : [false]) {
      try {
        const blocks = mod.buildTutorial({ client, model: 'claude-sonnet-4-6', endpoint: 'https://zzshu.cc/', platform, image, anthropic: true })
        if (!blocks.length) throw new Error('empty tutorial')
        for (const b of blocks) {
          if (b.kind === 'code' && b.lang === 'json') JSON.parse(b.code)
          if (b.kind === 'code' && /\/v1\/v1|zzshu\.cc\/\/|undefined|bearlab/i.test(b.code)) throw new Error('bad url/text in ' + b.title + ':\n' + b.code)
        }
        n++
      } catch (e) {
        errors.push(`${client}/${platform}/${image ? 'image' : 'chat'}: ${e.message}`)
      }
    }
  }
}
// 每个客户端至少在某个分组下有可用模型
const noModel = Object.entries(clients).filter(([, d]) => !catalog.models.some((m) => m.endpoints.includes(d.protocol))).map(([k]) => k)
console.log(`ok: ${n} tutorials`)
if (noModel.length) console.log('clients without any compatible model:', noModel)
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
