import { RouteRecordRaw } from 'vue-router'

const bomRouter: RouteRecordRaw = {
  path: '/bom',
  component: () => import('@/layout/Layout.vue'),
  redirect: '/bom/version',
  name: 'Bom',
  meta: {
    title: 'BOM管理',
    icon: 'ep:notebook'
  },
  children: [
    {
      path: 'version',
      component: () => import('@/views/bom/version/index.vue'),
      name: 'BomVersion',
      meta: {
        title: 'BOM版本管理',
        icon: 'ep:list'
      }
    }
  ]
}

export default bomRouter
