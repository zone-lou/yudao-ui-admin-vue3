import { ref, watch } from 'vue'

/** Drafts belong to one task; a refresh must not overwrite edits, including clearing. */
export const useTaskOpinionDraft = (taskId: () => string | undefined, nodes: () => any[]) => {
  const opinion = ref('')
  let edited = false
  let loading = false
  watch(opinion, () => { if (!loading) edited = true }, { flush: 'sync' })
  watch(taskId, () => {
    loading = true
    opinion.value = ''
    edited = false
    loading = false
  }, { immediate: true, flush: 'sync' })
  watch([taskId, nodes], () => {
    if (edited || !taskId()) return
    const task = (nodes() || []).flatMap((node) => node.tasks || [])
      .find((task) => task.id === taskId() && task.status === 1)
    if (typeof task?.reason !== 'string') return
    loading = true
    opinion.value = task.reason
    loading = false
  }, { immediate: true, deep: true })
  return opinion
}
