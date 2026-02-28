import type { RouteMeta } from 'vue-router'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/hooks/web/useI18n'
import { ElBadge } from 'element-plus'
import { useBpmStore } from '@/store/modules/bpm/bpm'
import { useAppStore } from '@/store/modules/app'
import { computed } from 'vue'

export const useRenderMenuTitle = () => {
  const renderMenuTitle = (meta: RouteMeta, path?: string) => {
    const { t } = useI18n()
    const { title = 'Please set title', icon } = meta

    let badgeValue = 0
    let showBadge = false

    if (path) {
      const bpmStore = useBpmStore()
      if (path.includes('bpm/todo')) {
        badgeValue = bpmStore.taskCount.todoCount
        showBadge = true
      } else if (path.includes('bpm/done')) {
        badgeValue = bpmStore.taskCount.doneCount
        showBadge = true
      }
    }

    const appStore = useAppStore()
    const isCollapse = appStore.getCollapse

    // 渲染图标与与其紧密结合的角标（仅在折叠时展示基于图标的徽标）
    const iconWithBadge = icon ? (
      <div class="relative inline-flex items-center justify-center">
        <Icon icon={meta.icon}></Icon>
        {isCollapse && showBadge && badgeValue > 0 && (
          <ElBadge
            value={badgeValue}
            max={99}
            type="danger"
            class="absolute"
            style={{
              top: '-10px',
              right: '8px',
              transform: 'scale(0.75)',
              zIndex: 10
            }}
          />
        )}
      </div>
    ) : null

    const titleSpan = (
      // 展开时的徽标挂在这里，通过加点左右 padding 避免和文字挤成一堆并超出
      <span class="v-menu__title overflow-visible whitespace-nowrap relative pr-2">
        {t(title as string)}
        {!isCollapse && showBadge && badgeValue > 0 && (
          <ElBadge
            value={badgeValue}
            max={99}
            type="danger"
            class="absolute"
            style={{
              top: '-6px',
              right: '-8px',
              transform: 'scale(0.75)',
              zIndex: 10
            }}
          />
        )}
      </span>
    )

    return iconWithBadge ? (
      <>
        {iconWithBadge}
        {titleSpan}
      </>
    ) : (
      titleSpan
    )
  }

  return {
    renderMenuTitle
  }
}
