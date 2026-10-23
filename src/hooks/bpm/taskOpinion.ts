/** Keep independent dispatches; suppress only the exact task replaced by a recovery. */
export const selectOpinionTasks = (nodes: any[]) => {
  const rows = (nodes || []).flatMap((node) => (node.tasks || []).map((task: any) => ({ node, task })))
  const byId = new Map(rows.filter(({ task }) => task.id).map((row) => [String(row.task.id), row]))
  const replaced = new Set<string>()
  for (const { node, task } of rows) {
    if (!task.restoredFromTaskId) continue
    const source = byId.get(String(task.restoredFromTaskId))
    // The server supplies the relationship. Also guard against cross-node/person mismatches.
    if (source && source.task.id !== task.id
      && String(source.task.taskDefinitionKey || source.node.id) === String(task.taskDefinitionKey || node.id)
      && source.task.assigneeUser?.id != null && task.assigneeUser?.id != null
      && String(source.task.assigneeUser.id) === String(task.assigneeUser.id)) {
      replaced.add(String(source.task.id))
    }
  }
  return rows.filter(({ task }) => !replaced.has(String(task.id))
    && (task.status == null || task.status === 2))
}
