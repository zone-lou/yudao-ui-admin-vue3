import { cloneDeep } from 'lodash-es'
import { reactive } from 'vue'

export const tabPathMap = reactive<Record<string, string[]>>({})

export const initTabMap = (routers: AppRouteRecordRaw[]) => {
  for (const router of routers) {
    tabPathMap[router.path] = []
  }
}

export const filterMenusPath = (routers: AppRouteRecordRaw[], allRouters: AppRouteRecordRaw[]) => {
  for (const router of routers) {
    if (router.children && router.children.length > 0) {
      filterMenusPath(router.children, allRouters)
    } else {
      const topPath = router.path.split('/')[1]
      if (topPath) {
        tabPathMap[`/${topPath}`]?.push(router.path)
      }
    }
  }
}
