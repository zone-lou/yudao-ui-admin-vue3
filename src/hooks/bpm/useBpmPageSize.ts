import { ref, watch } from 'vue'

/** 每张表独立记住每页条数，首次打开默认显示 100 条。 */
export const useBpmPageSize = (
  storageKey: string,
  pageSizes: number[] = [10, 20, 30, 50, 100]
) => {
  const pageSize = ref(100)
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey) ?? 'null')
    if (pageSizes.includes(saved)) {
      pageSize.value = saved
    }
  } catch {
    // 存储不可用或内容损坏时使用默认条数。
  }

  watch(
    pageSize,
    (value) => {
      if (!pageSizes.includes(value)) return
      try {
        localStorage.setItem(storageKey, JSON.stringify(value))
      } catch {
        // 存储不可用时仍允许在当前页面切换每页条数。
      }
    },
    { flush: 'sync' }
  )

  return pageSize
}
