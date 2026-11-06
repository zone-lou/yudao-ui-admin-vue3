<template>
  <el-tree
    ref="tree"
    :data="treeData"
    :props="{ label: 'name', children: 'children' }"
    node-key="treeKey"
    show-checkbox
    default-expand-all
    @check="handleCheck"
  >
    <template #default="scope"><slot v-bind="scope"></slot></template>
  </el-tree>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

type Candidate = {
  id: string | number
  treeKey?: string
  children?: Candidate[]
  disabled?: boolean
  [key: string]: any
}
const props = defineProps<{ data: Candidate[]; single?: boolean }>()
const emit = defineEmits(['check'])
const tree = ref()
// 展示位置有独立 key；业务 ID 始终保留人员 ID。
const treeData = computed(() => {
  const visit = (nodes: Candidate[], path: string): Candidate[] =>
    nodes.map((node, index) => ({
      ...node,
      treeKey: `${path}/${index}`,
      ...(node.children ? { children: visit(node.children, `${path}/${index}`) } : {})
    }))
  return visit(props.data || [], 'candidate')
})
const leaves = (nodes: Candidate[]): Candidate[] =>
  nodes.flatMap((node) => (node.children ? leaves(node.children) : [node]))
const uniqueUsers = (nodes: Candidate[]) =>
  [...new Map(nodes.filter((node) => !node.children).map((node) => [String(node.id), node])).values()]
const getCheckedNodes = (..._args: any[]) => uniqueUsers(tree.value?.getCheckedNodes(true, false) || [])
const getCheckedKeys = () => getCheckedNodes().map((node) => node.id)
// 每个人只保留一个展示位置；恢复/全选优先保留当前所在部门。
const applySelection = (selected: Map<string, Candidate>) => {
  const nodes = [...selected.values()]
  tree.value?.setCheckedKeys((props.single ? nodes.slice(0, 1) : nodes).map((node) => node.treeKey))
}
const setCheckedKeys = (ids: (string | number)[]) => {
  const requested = new Set(ids.map(String))
  const selected = new Map<string, Candidate>()
  for (const node of [...getCheckedNodes(), ...leaves(treeData.value)]) {
    const id = String(node.id)
    if (!node.disabled && requested.has(id) && !selected.has(id)) selected.set(id, node)
  }
  applySelection(selected)
}
const handleCheck = (data: Candidate, state: { checkedKeys: string[] }) => {
  const affected = leaves([data]).filter((node) => !node.disabled)
  const checked = affected.length > 0 && affected.every((node) => state.checkedKeys.includes(node.treeKey!))
  const selected = new Map(getCheckedNodes().map((node) => [String(node.id), node]))
  if (props.single) {
    selected.clear()
    if (checked && affected.length) selected.set(String(affected[0].id), affected[0])
  } else {
    affected.forEach((node) => {
      const id = String(node.id)
      // 新勾选的位置覆盖原位置；取消只影响当前部门中的勾选。
      if (checked) selected.set(id, node)
      else if (selected.get(id)?.treeKey === node.treeKey) selected.delete(id)
    })
  }
  applySelection(selected)
  emit('check', data, { checkedKeys: getCheckedKeys() })
}
defineExpose({ getCheckedNodes, getCheckedKeys, setCheckedKeys })
</script>
