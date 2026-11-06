import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import ClientWizard from './components/ClientWizard.vue'
import RouteTable from './components/RouteTable.vue'
import './style.css'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('ClientWizard', ClientWizard)
    app.component('RouteTable', RouteTable)
  },
} satisfies Theme
