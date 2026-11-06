<script setup lang="ts">
// 文章里引用线路地址时用 <RouteTable />，地址统一来自 data/site.ts。
// suffix: 在根地址后追加的路径，例如 "/v1" 或 "/v1/messages"
import { routes } from '../../data/site'

defineProps<{ suffix?: string }>()
</script>

<template>
  <table class="zz-routes">
    <thead>
      <tr><th>线路</th><th>地址</th><th>说明</th></tr>
    </thead>
    <tbody>
      <tr v-for="r in routes" :key="r.url">
        <td>{{ r.name }}</td>
        <td><code>{{ r.url }}{{ suffix || '' }}</code></td>
        <td>{{ r.detail }}</td>
      </tr>
    </tbody>
  </table>
</template>
