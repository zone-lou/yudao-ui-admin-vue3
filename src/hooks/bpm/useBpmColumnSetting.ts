import { ref, watch } from 'vue'

export type BpmColumnOption = {
  key: string
  label: string
}

export const useBpmColumnSetting = (
  storageKey: string,
  columns: BpmColumnOption[],
  defaultVisibleKeys?: string[]
) => {
  const allColumnKeys = columns.map((column) => column.key)
  const defaultColumnKeys = defaultVisibleKeys?.length ? defaultVisibleKeys : allColumnKeys
  const checkedColumnKeys = ref<string[]>([...defaultColumnKeys])
  // 页面级键不包含账号信息，同一浏览器内切换账号仍沿用表格偏好。
  const widthStorageKey = `${storageKey}:widths`
  const columnWidths = ref<Record<string, number>>({})

  const normalizeKeys = (keys: unknown): string[] => {
    if (!Array.isArray(keys)) {
      return [...defaultColumnKeys]
    }
    return [...new Set(keys.filter((key) => allColumnKeys.includes(key)))]
  }

  const readSetting = (key: string): unknown => {
    try {
      const saved = localStorage.getItem(key)
      return saved === null ? undefined : JSON.parse(saved)
    } catch {
      return undefined
    }
  }

  const saveSetting = (key: string, value: unknown) => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // 浏览器禁用存储或空间不足时，仍允许在当前页面调整表格。
    }
  }

  const savedKeys = readSetting(storageKey)
  if (savedKeys !== undefined) {
    checkedColumnKeys.value = normalizeKeys(savedKeys)
  }
  const savedWidths = readSetting(widthStorageKey)
  const validWidthKeys = [...allColumnKeys, 'selection', 'index', 'operation']
  if (savedWidths && typeof savedWidths === 'object' && !Array.isArray(savedWidths)) {
    for (const [key, width] of Object.entries(savedWidths)) {
      if (
        validWidthKeys.includes(key) &&
        typeof width === 'number' &&
        Number.isFinite(width) &&
        width > 0
      ) {
        columnWidths.value[key] = width
      }
    }
  }

  const visibleColumn = (key: string) => checkedColumnKeys.value.includes(key)
  const getColumnWidth = (key: string, defaultWidth?: number) =>
    columnWidths.value[key] ?? defaultWidth

  const handleHeaderDragend = (
    newWidth: number,
    _oldWidth: number,
    column: { columnKey?: string }
  ) => {
    const key = column.columnKey
    if (key && validWidthKeys.includes(key) && Number.isFinite(newWidth) && newWidth > 0) {
      columnWidths.value[key] = newWidth
      saveSetting(widthStorageKey, columnWidths.value)
    }
  }

  const resetColumns = () => {
    checkedColumnKeys.value = [...defaultColumnKeys]
    columnWidths.value = {}
    saveSetting(widthStorageKey, columnWidths.value)
  }

  watch(
    checkedColumnKeys,
    (value) => saveSetting(storageKey, normalizeKeys(value)),
    { deep: true, flush: 'sync' }
  )

  return {
    columnOptions: columns,
    checkedColumnKeys,
    visibleColumn,
    getColumnWidth,
    handleHeaderDragend,
    resetColumns
  }
}
