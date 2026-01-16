<script lang="tsx">
import { usePermissionStore } from '@/store/modules/permission'
import { useAppStore } from '@/store/modules/app'
import { pathResolve } from '@/utils/routerHelper'
import { cloneDeep } from 'lodash-es'
import { useDesign } from '@/hooks/web/useDesign'
import { isUrl } from '@/utils/is'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('layout-mix-top-menu')

export default defineComponent({
  name: 'LayoutMixTopMenu',
  setup() {
    const { push, currentRoute } = useRouter()

    const { t } = useI18n()

    const appStore = useAppStore()

    const permissionStore = usePermissionStore()

    const routers = computed(() => permissionStore.getRouters)

    const tabRouters = computed(() =>
      unref(routers).filter((v) => !v?.meta?.hidden && v.path !== '/index')
    )

    const activeMenu = computed(() => {
      const { meta, path } = unref(currentRoute)
      if (meta.activeMenu) {
        return meta.activeMenu as string
      }
      return path
    })

    const tabActive = ref('')

    // 初始化时设置选中的菜单
    onMounted(() => {
      const path = `/${unref(currentRoute).path.split('/')[1]}`
      const parent = unref(tabRouters).find(
        (v) =>
          (v.meta?.alwaysShow || (v?.children?.length && v?.children?.length > 1)) &&
          v.path === path
      )
      const children = parent?.children

      tabActive.value = path

      // 设置全局 Active Path 和 Title
      permissionStore.setActiveTopMenuPath(path)
      if (parent?.meta?.title) {
        permissionStore.setSidebarTitle(t(parent.meta.title))
      }

      if (children) {
        permissionStore.setMenuTabRouters(
          cloneDeep(children).map((v) => {
            v.path = pathResolve(unref(tabActive), v.path)
            return v
          })
        )
      }
    })

    // 点击事件
    const tabClick = (item: AppRouteRecordRaw, rootPath: string) => {
      if (isUrl(item.path)) {
        window.open(item.path)
        return
      }

      const newPath = item.children ? item.path : item.path.split('/')[0]
      tabActive.value = newPath

      // 设置全局 Active Path (统一使用根路径) 和 Title
      permissionStore.setActiveTopMenuPath(rootPath)
      if (item.meta?.title) {
        permissionStore.setSidebarTitle(t(item.meta.title))
      }

      if (item.children) {
        permissionStore.setMenuTabRouters(
          cloneDeep(item.children).map((v) => {
            v.path = pathResolve(unref(tabActive), v.path)
            return v
          })
        )
      } else {
        push(item.path)
        permissionStore.setMenuTabRouters([])
      }
    }

    const isActive = (routePath: string) => {
      const { path, meta } = unref(currentRoute)
      const currentActivePath = (meta.activeMenu as string) || path
      const normalizedRoutePath = routePath.startsWith('/') ? routePath : `/${routePath}`

      // 优先判断 Store 中的 Active Path (点击时立即生效)
      if (permissionStore.getActiveTopMenuPath === normalizedRoutePath) {
        return true
      }

      // 兜底：路由匹配
      const isMatch =
        normalizedRoutePath === '/'
          ? currentActivePath === '/'
          : currentActivePath === normalizedRoutePath ||
            currentActivePath.startsWith(normalizedRoutePath + '/')

      // 如果路由匹配，也同步更新 Store (处理浏览器前进后退/直接输URL的情况)
      if (isMatch) {
        // 注意：不能在 computed/render 中直接调用 set，这里只是作为被动匹配
        // 可以在 watch 路由时处理，这里仅做返回
        return true
      }
      return false
    }

    // 监听路由变化，同步更新 Store (处理外部跳转)
    watch(
      () => currentRoute.value.path,
      (path) => {
        const topPath = `/${path.split('/')[1]}`
        if (topPath !== permissionStore.getActiveTopMenuPath) {
          const topRoute = unref(tabRouters).find((v) => v.path === topPath)
          if (topRoute) {
            permissionStore.setActiveTopMenuPath(topPath)
            if (topRoute.meta?.title) {
              permissionStore.setSidebarTitle(t(topRoute.meta.title))
            }
          }
        }
      }
    )

    return () => (
      <div class={[prefixCls, 'flex items-center h-[var(--top-tool-height)]']}>
        <div class="flex items-center h-full">
          {unref(tabRouters).map((v) => {
            const item = (
              v.meta?.alwaysShow || (v?.children?.length && v?.children?.length > 1)
                ? v
                : {
                    ...(v?.children && v?.children[0]),
                    path: pathResolve(v.path, (v?.children && v?.children[0])?.path as string)
                  }
            ) as AppRouteRecordRaw

            // 过滤空标题
            if (!item.meta?.title) return null

            const isAct = isActive(v.path)

            return (
              <div
                class={[
                  `${prefixCls}__item`,
                  'flex items-center cursor-pointer px-4 relative',
                  {
                    'is-active': isAct
                  }
                ]}
                onClick={() => tabClick(item, v.path)}
              >
                <span class="font-medium">{t(item.meta?.title)}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
})
</script>

<style lang="scss" scoped>
$prefix-cls: #{$namespace}-layout-mix-top-menu;

.#{$prefix-cls} {
  &__item {
    // 文字垂直居中
    display: flex;
    height: 100%;
    padding: 0 10px !important; // 调整内边距
    font-family: 'Microsoft Yahei';
    font-size: 18px; // 调整字体大小
    color: #f0f0f0;
    border-bottom: 2px solid transparent; // 默认透明底部边框
    transition: all 0.3s;
    justify-content: center;
    align-items: center;
    user-select: none;

    &.is-active {
      color: #fff !important;
      background-color: #0056ff !important;
      border-bottom-color: #fff !important; // 白色底部边框
    }

    &:hover {
      color: #fff !important;
      background-color: #0056ff !important;
      border-bottom-color: #fff !important; // 白色底部边框
    }
  }
}
</style>
