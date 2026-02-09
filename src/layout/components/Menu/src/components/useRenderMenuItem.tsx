import { ElSubMenu, ElMenuItem } from 'element-plus'
import { hasOneShowingChild } from '../helper'
import { isUrl } from '@/utils/is'
import { useRenderMenuTitle } from './useRenderMenuTitle'
import { pathResolve } from '@/utils/routerHelper'
import { ElBadge } from 'element-plus' // 引入 Badge 组件
import { useBpmStore } from '@/store/modules/bpm/bpm' // 引入 BPM Store

const { renderMenuTitle } = useRenderMenuTitle()

export const useRenderMenuItem = () =>
  // allRouters: AppRouteRecordRaw[] = [],
  {
    // 1. 初始化 Store
    const bpmStore = useBpmStore()

    // 2. 封装一个渲染带徽标标题的函数
    const renderWithBadge = (meta: any, path: string) => {
      const titleContent = renderMenuTitle(meta)

      let badgeValue = 0
      let showBadge = false
      if (path) {
        // 逻辑 A: 待办任务菜单 -> 显示待办数量
        if (path.includes('bpm/todo')) {
          badgeValue = bpmStore.taskCount.todoCount
          showBadge = true
        }
        // 逻辑 B: 已办任务菜单 -> 显示已办数量
        else if (path.includes('bpm/done')) {
          badgeValue = bpmStore.taskCount.doneCount
          showBadge = true
        }
      }

      // 如果满足显示条件，且数量大于 0 (可选)，则渲染 Badge
      // 注意：如果不希望数量为0时隐藏，去掉 && badgeValue > 0
      if (showBadge && badgeValue > 0) {
        return (
          // 关键修改 1: relative 用于定位，flex 布局保证内容一行显示
          <div class="flex items-center justify-start w-full h-full">
            {/* 关键修改 2: flex-1 强制文字部分占据左侧所有空间，text-left 强制靠左 */}
            <div class="relative inline-flex items-center overflow-visible">{titleContent}</div>

            {/* 关键修改 3: 徽标样式调整 */}
            {/* 如果你想实现“右上角”悬浮效果，可以用 absolute 定位 */}
            <ElBadge
              value={badgeValue}
              max={99}
              type="danger"
              class="absolute"
              style={{
                top: '-8px', // 负值越小越往上 (根据字体大小微调)
                right: '-20px', // 负值越小越往右
                transform: 'scale(0.8)', // 缩小一点更精致
                lineHeight: 'initial', // 清除继承的行高
                zIndex: 10 // 保证在最上层
              }}
            />
          </div>
        )
      }

      return titleContent
    }

    const renderMenuItem = (routers: AppRouteRecordRaw[], parentPath = '/') => {
      return routers
        .filter((v) => !v.meta?.hidden)
        .map((v) => {
          const meta = v.meta ?? {}
          const { oneShowingChild, onlyOneChild } = hasOneShowingChild(v.children, v)
          const fullPath = isUrl(v.path) ? v.path : pathResolve(parentPath, v.path)

          // 情况 A: 渲染叶子节点 (MenuItem)
          if (
            oneShowingChild &&
            (!onlyOneChild?.children || onlyOneChild?.noShowingChildren) &&
            !meta?.alwaysShow
          ) {
            const finalPath = onlyOneChild ? pathResolve(fullPath, onlyOneChild.path) : fullPath
            return (
              <ElMenuItem index={finalPath}>
                {{
                  // 使用 renderWithBadge 替换原来的 renderMenuTitle
                  default: () =>
                    renderWithBadge(onlyOneChild ? onlyOneChild?.meta : meta, finalPath)
                }}
              </ElMenuItem>
            )
          }
          // 情况 B: 渲染目录节点 (SubMenu)
          else {
            return (
              <ElSubMenu index={fullPath}>
                {{
                  // 使用 renderWithBadge 替换原来的 renderMenuTitle
                  title: () => renderWithBadge(meta, fullPath),
                  default: () => renderMenuItem(v.children!, fullPath)
                }}
              </ElSubMenu>
            )
          }
        })
    }

    return {
      renderMenuItem
    }
  }


