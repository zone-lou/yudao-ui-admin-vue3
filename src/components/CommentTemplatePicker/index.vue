<template>
  <div v-if="taskId" class="comment-template-picker print-hide-row">
    <el-button link type="primary" size="small" @click="open"><Icon icon="ep:document" class="mr-1" />意见模板</el-button>
    <el-dialog v-model="visible" title="选择意见模板" width="680px" append-to-body class="legacy-comment-dialog">
      <div v-loading="loading" class="legacy-comment-panel">
        <div class="template-toolbar">
          <el-button size="small" :disabled="loading" @click="openPeople"><Icon icon="ep:user" class="mr-1" />插入部门人员</el-button>
          <span class="toolbar-spacer"></span>
          <el-button type="primary" plain size="small" :disabled="loading || !preview.trim()" @click="save">保存模板</el-button>
          <el-button type="danger" plain size="small" :disabled="loading || !selectedPersonal?.oaIdeaId" @click="remove">删除模板</el-button>
          <el-button size="small" :disabled="loading || !selectedPersonal?.oaIdeaId || selectedIndex === 0" @click="move(-1)">上移</el-button>
          <el-button size="small" :disabled="loading || !selectedPersonal?.oaIdeaId || selectedIndex === options.personal.length - 1" @click="move(1)">下移</el-button>
        </div>
        <div class="template-columns">
          <fieldset class="opinion-column">
            <legend>意见内容</legend>
            <textarea
              ref="editor"
              v-model="preview"
              aria-label="意见内容"
              placeholder="双击右侧模板插入意见，也可直接填写"
              :disabled="loading"
              @select="rememberSelection"
              @keyup="rememberSelection"
              @mouseup="rememberSelection"
              @focus="rememberSelection"
              @blur="rememberSelection"
            ></textarea>
          </fieldset>
          <fieldset class="list-column">
            <legend>意见模板（双击选取）</legend>
            <div class="template-list" role="listbox" aria-label="意见模板">
              <div v-if="options.business.length" class="list-group-title">个人常用意见</div>
              <button
                v-for="(row, index) in options.personal"
                :key="row.oaIdeaId ?? `default-${index}`"
                type="button"
                role="option"
                :aria-selected="selectedKey === personalKey(index)"
                :class="['template-item', { selected: selectedKey === personalKey(index) }]"
                :disabled="loading"
                @click="selectedKey = personalKey(index)"
                @dblclick="insertText(row.ideaMessage)"
                @keydown.enter.prevent="insertText(row.ideaMessage)"
              >{{ row.ideaMessage }}</button>
              <template v-if="options.business.length">
                <div class="list-group-title">业务意见模板</div>
                <button
                  v-for="(row, index) in options.business"
                  :key="row.commentGuid"
                  type="button"
                  role="option"
                  :aria-selected="selectedKey === `business-${row.commentGuid}`"
                  :class="['template-item', { selected: selectedKey === `business-${row.commentGuid}` }]"
                  :disabled="loading"
                  @click="selectedKey = `business-${row.commentGuid}`"
                  @dblclick="insertBusiness(row.commentGuid!)"
                  @keydown.enter.prevent="insertBusiness(row.commentGuid!)"
                >{{ row.commentName }}{{ index === 0 ? '（默认）' : '' }}</button>
              </template>
            </div>
          </fieldset>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" :disabled="loading || !preview.trim()" @click="apply">确定</el-button>
        <el-button @click="visible = false">取消</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="peopleVisible" title="插入部门人员" width="560px" append-to-body>
      <div v-loading="peopleLoading" class="legacy-people-panel">
        <div class="organization-root">
          <label><input type="checkbox" :checked="allPeopleSelected" :disabled="peopleLoading || !systemGroups.length" @change="toggleAllPeople" />全部部门</label>
        </div>
        <div class="organization-list">
          <div v-for="group in systemGroups" :key="group.id" class="department-group">
            <div class="department-heading">
              <button type="button" class="group-toggle" :aria-expanded="!collapsedDeptIds.includes(group.id)" :aria-label="`${collapsedDeptIds.includes(group.id) ? '展开' : '收起'}${group.name}`" @click="toggleCollapse(group.id)">{{ collapsedDeptIds.includes(group.id) ? '+' : '−' }}</button>
              <label><input type="checkbox" :checked="departmentSelected(group.id)" :disabled="peopleLoading" @change="toggleDepartment(group.id, ($event.target as HTMLInputElement).checked)" />{{ group.name }}</label>
            </div>
            <div v-show="!collapsedDeptIds.includes(group.id)" class="department-members">
              <label v-for="user in group.members" :key="user.id" :title="user.nickname" class="member-choice">
                <input type="checkbox" :checked="memberSelected(group.id, user.id)" :disabled="peopleLoading" @change="toggleMember(group.id, user.id, ($event.target as HTMLInputElement).checked)" />
                <span>{{ user.nickname }}</span>
              </label>
            </div>
          </div>
          <div v-if="!peopleLoading && !systemGroups.length" class="people-empty">暂无可选部门人员</div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" :disabled="peopleLoading || !hasPeopleSelection" @click="insertPeople">确定</el-button>
        <el-button @click="peopleVisible = false">取消</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { CommentTemplateApi, type TemplateOptions } from '@/api/bpm/commentTemplate'
import * as UserApi from '@/api/system/user'
import * as DeptApi from '@/api/system/dept'

const props = withDefaults(defineProps<{ modelValue: string; taskId?: string; code?: string }>(), {
  code: 'Default'
})
const emit = defineEmits<{ (event: 'update:modelValue', value: string): void }>()
const message = useMessage()
const visible = ref(false)
const loading = ref(false)
const preview = ref('')
const editor = ref<HTMLTextAreaElement>()
const selectedKey = ref('')
const options = ref<TemplateOptions>({ ideaType: '', personal: [], business: [] })
let selectionStart = 0
let selectionEnd = 0
let requestVersion = 0
const personalKey = (index: number) => `personal-${options.value.personal[index]?.oaIdeaId ?? `default-${index}`}`
const selectedIndex = computed(() => options.value.personal.findIndex((_, index) => personalKey(index) === selectedKey.value))
const selectedPersonal = computed(() => options.value.personal[selectedIndex.value])
const refresh = async () => {
  const version = ++requestVersion
  const taskId = props.taskId
  if (!taskId) return
  const data = await CommentTemplateApi.options(taskId, props.code)
  if (version !== requestVersion || taskId !== props.taskId || !visible.value) return
  options.value = data
  if (!options.value.personal.some((_, index) => personalKey(index) === selectedKey.value)
      && !options.value.business.some((row) => `business-${row.commentGuid}` === selectedKey.value)) {
    selectedKey.value = ''
  }
}
const open = async () => {
  visible.value = true
  preview.value = ''
  selectedKey.value = ''
  selectionStart = selectionEnd = 0
  options.value = { ideaType: '', personal: [], business: [] }
  loading.value = true
  try {
    await refresh()
  } finally {
    loading.value = false
  }
}
const rememberSelection = () => {
  if (!editor.value) return
  selectionStart = editor.value.selectionStart
  selectionEnd = editor.value.selectionEnd
}
const insertText = async (text: string) => {
  const start = Math.min(selectionStart, preview.value.length)
  const end = Math.min(selectionEnd, preview.value.length)
  preview.value = preview.value.slice(0, start) + text + preview.value.slice(end)
  const caret = start + text.length
  selectionStart = selectionEnd = caret
  await nextTick()
  editor.value?.focus()
  editor.value?.setSelectionRange(caret, caret)
  selectionStart = selectionEnd = caret
}
const insertBusiness = async (id: string) => {
  const taskId = props.taskId
  const version = requestVersion
  if (!taskId || loading.value) return
  loading.value = true
  try {
    const text = await CommentTemplateApi.render(taskId, id, props.code)
    if (taskId === props.taskId && version === requestVersion && visible.value) {
      loading.value = false
      await insertText(text)
    }
  } finally {
    loading.value = false
  }
}
const save = async () => {
  const text = preview.value.trim()
  if (!text) return
  if (text.length > 150) {
    message.warning('个人意见模板最多150字')
    return
  }
  const taskId = props.taskId
  await message.confirm('保存意见模板将会另建一个模板，确定保存吗？')
  if (!visible.value || taskId !== props.taskId) return
  loading.value = true
  try {
    const order = Math.min(99999, Math.max(0, ...options.value.personal
      .filter((row) => row.oaIdeaId != null).map((row) => row.ideaOrder)) + 1)
    const id = await CommentTemplateApi.savePersonal({
      ideaMessage: text,
      ideaType: options.value.ideaType,
      ideaOrder: order
    })
    if (taskId !== props.taskId || !visible.value) return
    await refresh()
    selectedKey.value = `personal-${id}`
    message.success('已保存为个人模板')
  } finally {
    loading.value = false
  }
}
const remove = async () => {
  const id = selectedPersonal.value?.oaIdeaId
  const taskId = props.taskId
  if (id == null) return
  await message.confirm('确认要删除所选的意见模板？')
  if (!visible.value || taskId !== props.taskId) return
  loading.value = true
  try {
    await CommentTemplateApi.deletePersonal(id)
    if (taskId === props.taskId) await refresh()
  } finally {
    loading.value = false
  }
}
const move = async (offset: number) => {
  const index = selectedIndex.value
  const rows = [...options.value.personal]
  if (!selectedPersonal.value?.oaIdeaId || index + offset < 0 || index + offset >= rows.length) return
  ;[rows[index], rows[index + offset]] = [rows[index + offset], rows[index]]
  loading.value = true
  try {
    await CommentTemplateApi.orderPersonal(rows.map((row) => row.oaIdeaId!))
    await refresh()
  } finally {
    loading.value = false
  }
}
const apply = () => {
  if (!preview.value.trim() || loading.value) return
  // 旧收发文回调将弹窗意见追加到表单已有意见。
  emit('update:modelValue', props.modelValue + preview.value)
  visible.value = false
}
const peopleVisible = ref(false)
const peopleLoading = ref(false)
const departments = ref<DeptApi.DeptVO[]>([])
const users = ref<UserApi.UserVO[]>([])
const collapsedDeptIds = ref<number[]>([])
// 按部门保存勾选状态，兼容一个人员属于多个部门。
const checkedMembers = ref<Record<number, number[]>>({})
const systemGroups = computed(() => departments.value.map((dept) => ({
  id: dept.id,
  name: dept.name,
  members: users.value.filter((user) => user.deptId === dept.id || user.deptIds?.includes(dept.id))
})).filter((group) => group.members.length > 0))
const memberSelected = (deptId: number, userId: number) => checkedMembers.value[deptId]?.includes(userId) ?? false
const departmentSelected = (deptId: number) => {
  const group = systemGroups.value.find((row) => row.id === deptId)
  return !!group?.members.length && group.members.every((user) => memberSelected(deptId, user.id))
}
const allPeopleSelected = computed(() => systemGroups.value.length > 0
  && systemGroups.value.every((group) => departmentSelected(group.id)))
const hasPeopleSelection = computed(() => Object.values(checkedMembers.value).some((ids) => ids.length > 0))
const toggleDepartment = (deptId: number, checked: boolean) => {
  checkedMembers.value[deptId] = checked
    ? systemGroups.value.find((row) => row.id === deptId)?.members.map((user) => user.id) ?? []
    : []
}
const toggleMember = (deptId: number, userId: number, checked: boolean) => {
  const ids = checkedMembers.value[deptId] ?? []
  checkedMembers.value[deptId] = checked ? [...new Set([...ids, userId])] : ids.filter((id) => id !== userId)
}
const toggleAllPeople = (event: Event) => {
  const checked = (event.target as HTMLInputElement).checked
  systemGroups.value.forEach((group) => toggleDepartment(group.id, checked))
}
const toggleCollapse = (deptId: number) => {
  collapsedDeptIds.value = collapsedDeptIds.value.includes(deptId)
    ? collapsedDeptIds.value.filter((id) => id !== deptId) : [...collapsedDeptIds.value, deptId]
}
const openPeople = async () => {
  peopleVisible.value = true
  checkedMembers.value = {}
  collapsedDeptIds.value = []
  peopleLoading.value = true
  try {
    const [deptList, userList] = await Promise.all([
      DeptApi.getSimpleDeptList(), UserApi.getSimpleUserList()
    ])
    departments.value = deptList
    users.value = userList
  } finally {
    peopleLoading.value = false
  }
}
const insertPeople = async () => {
  if (!visible.value || peopleLoading.value || !hasPeopleSelection.value) return
  const staffNames: string[] = []
  const departmentNames: string[] = []
  for (const group of systemGroups.value) {
    // 旧 StaffPickerV2：整组选中返回部门名，不再返回该组人员。
    if (departmentSelected(group.id)) departmentNames.push(group.name)
    else group.members.forEach((user) => {
      if (memberSelected(group.id, user.id)) staffNames.push(user.nickname)
    })
  }
  peopleVisible.value = false
  // 旧模板窗口先插入人员名，再插入部门名，不加分隔符。
  await insertText([...staffNames, ...departmentNames].join(''))
}
watch(visible, (value) => {
  if (!value) {
    requestVersion++
    peopleVisible.value = false
  }
})
watch(() => props.taskId, () => {
  requestVersion++
  visible.value = false
  peopleVisible.value = false
  preview.value = ''
  selectedKey.value = ''
})
</script>
<style scoped>
.comment-template-picker {
  width: auto;
  text-align: right;
}
.legacy-comment-panel,
.legacy-people-panel {
  color: var(--el-text-color-primary);
  text-align: left;
  font-size: var(--el-font-size-base);
}
.template-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-bottom: 16px;
}
.template-toolbar :deep(.el-button + .el-button) {
  margin-left: 0;
}
.toolbar-spacer {
  flex: 1;
}
.template-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  height: 320px;
}
.template-columns fieldset {
  display: flex;
  min-width: 0;
  min-height: 0;
  margin: 0;
  padding: 12px;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  background: var(--el-bg-color);
}
.template-columns legend {
  padding: 0 6px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  font-weight: 500;
}
.opinion-column textarea {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 10px 12px;
  resize: none;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  outline: none;
  background: var(--el-fill-color-blank);
  color: var(--el-text-color-primary);
  font: inherit;
  line-height: 1.7;
  transition: border-color 0.2s;
}
.opinion-column textarea:hover {
  border-color: var(--el-border-color-hover);
}
.opinion-column textarea:focus {
  border-color: var(--el-color-primary);
}
.opinion-column textarea::placeholder {
  color: var(--el-text-color-placeholder);
}
.opinion-column textarea:disabled {
  background: var(--el-disabled-bg-color);
  color: var(--el-disabled-text-color);
}
.template-list {
  width: 100%;
  overflow: auto;
}
.template-item {
  display: block;
  width: 100%;
  margin-bottom: 4px;
  padding: 9px 12px;
  border: 1px solid transparent;
  border-radius: var(--el-border-radius-base);
  background: var(--el-fill-color-blank);
  color: var(--el-text-color-regular);
  cursor: pointer;
  font: inherit;
  line-height: 1.5;
  text-align: left;
  white-space: normal;
  overflow-wrap: anywhere;
  transition: background-color 0.2s, color 0.2s;
}
.template-item:hover {
  background: var(--el-fill-color-light);
}
.template-item.selected {
  border-color: var(--el-color-primary-light-7);
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}
.template-item:focus-visible,
.group-toggle:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 1px;
}
.template-item:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}
.list-group-title {
  padding: 8px 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-weight: 500;
}
.legacy-people-panel {
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
}
.organization-root {
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  font-weight: 500;
}
.organization-list {
  height: 340px;
  overflow: auto;
  padding: 0 16px;
  background: var(--el-bg-color);
}
.department-group {
  padding: 12px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.department-group:last-child {
  border-bottom: 0;
}
.department-heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}
.group-toggle {
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  background: var(--el-fill-color-blank);
  color: var(--el-text-color-secondary);
  cursor: pointer;
  font-size: 14px;
  line-height: 18px;
}
.group-toggle:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}
.department-members {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px 8px;
  padding: 12px 0 0 28px;
}
.organization-root label,
.department-heading label,
.member-choice {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  cursor: pointer;
}
.legacy-people-panel input[type='checkbox'] {
  flex-shrink: 0;
  width: 14px;
  height: 14px;
  margin: 0;
  accent-color: var(--el-color-primary);
  cursor: pointer;
}
.member-choice {
  color: var(--el-text-color-regular);
  font-size: 13px;
}
.member-choice:hover {
  color: var(--el-color-primary);
}
.member-choice span {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.people-empty {
  padding: 24px 12px;
  color: var(--el-text-color-secondary);
  text-align: center;
}
@media print {
  .comment-template-picker {
    display: none !important;
  }
}
</style>
