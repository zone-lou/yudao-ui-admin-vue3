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

  const normalizeKeys = (keys: string[]) => {
    const validKeys = keys.filter((key) => allColumnKeys.includes(key))
    return validKeys.length > 0 ? validKeys : [...defaultColumnKeys]
  }

  const loadColumnKeys = () => {
    const saved = localStorage.getItem(storageKey)
    if (!saved) {
      return
    }
    try {
      checkedColumnKeys.value = normalizeKeys(JSON.parse(saved))
    } catch {
      checkedColumnKeys.value = [...defaultColumnKeys]
    }
  }

  const visibleColumn = (key: string) => checkedColumnKeys.value.includes(key)

  const resetColumns = () => {
    checkedColumnKeys.value = [...defaultColumnKeys]
  }

  watch(
    checkedColumnKeys,
    (value) => {
      localStorage.setItem(storageKey, JSON.stringify(normalizeKeys(value)))
    },
    { deep: true }
  )

  loadColumnKeys()

  return {
    columnOptions: columns,
    checkedColumnKeys,
    visibleColumn,
    resetColumns
  }
}
