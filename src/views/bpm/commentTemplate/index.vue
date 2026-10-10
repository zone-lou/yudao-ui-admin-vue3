<template>
  <ContentWrap>
    <el-tabs v-model="activeTab">
      <el-tab-pane label="业务意见模板" name="templates">
        <div class="flex gap-3 mb-4">
          <el-select
            v-model="selectedBiz"
            placeholder="选择业务映射"
            class="!w-100"
            @change="loadTemplates"
          >
            <el-option
              v-for="binding in bindings"
              :key="binding.processDefinitionKey"
              :value="binding.bizdefGuid"
              :label="`${binding.processDefinitionKey} / ${binding.bizdefGuid}`"
            />
          </el-select>
          <el-button type="primary" :disabled="!selectedBiz" @click="editTemplate()"
            >新增模板</el-button
          >
        </div>
        <el-table v-loading="loading" :data="templates">
          <el-table-column prop="commentName" label="模板名称" />
          <el-table-column prop="commentCode" label="模板代码" />
          <el-table-column prop="commentAct" label="适用环节" show-overflow-tooltip />
          <el-table-column prop="seqOrder" label="顺序" width="90" />
          <el-table-column prop="commentContent" label="内容" show-overflow-tooltip />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="editTemplate(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteTemplate(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="业务映射" name="bindings">
        <el-button type="primary" class="mb-4" @click="editBinding()">新增映射</el-button>
        <el-table v-loading="loading" :data="bindings">
          <el-table-column prop="processDefinitionKey" label="当前流程Key" />
          <el-table-column prop="bizdefGuid" label="旧业务定义ID" />
          <el-table-column prop="ideaType" label="个人意见类型" />
          <el-table-column prop="sourceType" label="业务数据类型" />
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button link type="primary" @click="editBinding(row)">编辑</el-button>
              <el-button link type="danger" @click="deleteBinding(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
    <el-dialog v-model="templateVisible" title="意见模板定义" width="720px">
      <el-form :model="templateForm" label-width="110px">
        <el-form-item label="模板名称" required
          ><el-input v-model="templateForm.commentName" maxlength="50"
        /></el-form-item>
        <el-form-item label="模板代码" required
          ><el-input
            v-model="templateForm.commentCode"
            maxlength="50"
            placeholder="Default；多个代码以英文逗号分隔"
        /></el-form-item>
        <el-form-item label="适用环节"
          ><el-input
            v-model="templateForm.commentAct"
            maxlength="4000"
            placeholder="留空适用所有环节；旧环节ID或当前节点Key，英文逗号分隔"
        /></el-form-item>
        <el-form-item label="顺序"
          ><el-input-number v-model="templateForm.seqOrder" :min="0" :max="2147483647"
        /></el-form-item>
        <el-form-item label="插入业务字段">
          <el-select placeholder="选择字段插入正文末尾" @change="insertField">
            <el-option
              v-for="field in availableFields"
              :key="field"
              :label="field"
              :value="field"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模板内容" required
          ><el-input
            v-model="templateForm.commentContent"
            type="textarea"
            :rows="6"
            maxlength="3000"
            show-word-limit
        /></el-form-item>
        <el-form-item label="旧满足函数"
          ><el-input
            v-model="templateForm.meetFunction"
            maxlength="500"
            placeholder="保留旧值；与已核对的旧调用路径一致，不执行脚本"
        /></el-form-item>
      </el-form>
      <template #footer
        ><el-button @click="templateVisible = false">取消</el-button
        ><el-button type="primary" :loading="saving" @click="saveTemplate"
          >保存</el-button
        ></template
      >
    </el-dialog>
    <el-dialog v-model="bindingVisible" title="业务模板映射" width="720px">
      <el-form :model="bindingForm" label-width="130px">
        <el-form-item label="当前流程Key" required
          ><el-input
            v-model="bindingForm.processDefinitionKey"
            :disabled="editingBinding"
            maxlength="255"
        /></el-form-item>
        <el-form-item label="旧业务定义ID" required
          ><el-input v-model="bindingForm.bizdefGuid" maxlength="50"
        /></el-form-item>
        <el-form-item label="个人意见类型"
          ><el-input
            v-model="bindingForm.ideaType"
            maxlength="150"
            placeholder="沿用旧 IDEA_TYPE，例如 receivedoc、senddoc"
        /></el-form-item>
        <el-form-item label="业务数据类型" required>
          <el-select v-model="bindingForm.sourceType" @change="loadFields">
            <el-option
              v-for="source in sources"
              :key="source.value"
              :label="source.label"
              :value="source.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="环节映射"
          ><el-input
            v-model="bindingForm.nodeMapping"
            type="textarea"
            :rows="3"
            placeholder='JSON对象，例如 {"旧环节ID":"当前节点Key"}'
        /></el-form-item>
        <el-form-item label="字段映射"
          ><el-input
            v-model="bindingForm.fieldMapping"
            type="textarea"
            :rows="4"
            placeholder='JSON对象，例如 {"旧表名.SUBJECT":"subject"}'
        /></el-form-item>
        <el-form-item label="可用业务字段"
          ><div class="max-h-40 overflow-auto text-xs break-all">{{
            availableFields.join('、')
          }}</div></el-form-item
        >
      </el-form>
      <template #footer
        ><el-button @click="bindingVisible = false">取消</el-button
        ><el-button type="primary" :loading="saving" @click="saveBinding">保存</el-button></template
      >
    </el-dialog>
  </ContentWrap>
</template>
<script setup lang="ts">
import {
  CommentTemplateApi,
  type BusinessTemplate,
  type TemplateBinding
} from '@/api/bpm/commentTemplate'
defineOptions({ name: 'BpmCommentTemplate' })
const message = useMessage()
const activeTab = ref('templates')
const loading = ref(false)
const saving = ref(false)
const selectedBiz = ref('')
const bindings = ref<TemplateBinding[]>([])
const templates = ref<BusinessTemplate[]>([])
const availableFields = ref<string[]>([])
const templateVisible = ref(false)
const bindingVisible = ref(false)
const editingBinding = ref(false)
const sources = [
  { label: '收文', value: 'receivedoc' },
  { label: '发文', value: 'senddoc' },
  { label: '请假', value: 'leave' },
  { label: '会议报告', value: 'confflow' },
  { label: '公出', value: 'timeexplain' },
  { label: '行政复议', value: 'xzfy' },
  { label: '行政诉讼', value: 'xzss' }
]
const emptyTemplate = (): BusinessTemplate => ({
  bizdefGuid: selectedBiz.value,
  commentName: '',
  commentCode: 'Default',
  commentContent: '',
  commentAct: '',
  meetFunction: '',
  seqOrder: 0
})
const emptyBinding = (): TemplateBinding => ({
  processDefinitionKey: '',
  bizdefGuid: '',
  ideaType: '',
  sourceType: 'receivedoc',
  nodeMapping: '{}',
  fieldMapping: '{}'
})
const templateForm = ref<BusinessTemplate>(emptyTemplate())
const bindingForm = ref<TemplateBinding>(emptyBinding())
const loadTemplates = async () => {
  if (!selectedBiz.value) {
    templates.value = []
    return
  }
  loading.value = true
  try {
    templates.value = await CommentTemplateApi.business(selectedBiz.value)
  } finally {
    loading.value = false
  }
}
const refresh = async () => {
  loading.value = true
  try {
    bindings.value = await CommentTemplateApi.bindings()
    if (!bindings.value.some((row) => row.bizdefGuid === selectedBiz.value))
      selectedBiz.value = bindings.value[0]?.bizdefGuid || ''
    await loadTemplates()
  } finally {
    loading.value = false
  }
}
const loadFields = async (source: string) => {
  availableFields.value = await CommentTemplateApi.fields(source)
}
const editTemplate = async (row?: BusinessTemplate) => {
  templateForm.value = row ? { ...row } : emptyTemplate()
  const binding = bindings.value.find((item) => item.bizdefGuid === selectedBiz.value)
  availableFields.value = []
  if (binding) {
    await loadFields(binding.sourceType)
    availableFields.value = [
      ...new Set([
        ...availableFields.value,
        ...Object.keys(JSON.parse(binding.fieldMapping || '{}'))
      ])
    ]
  }
  templateVisible.value = true
}
const insertField = (field: string) => {
  templateForm.value.commentContent += `{${field}}`
}
const saveTemplate = async () => {
  if (
    !templateForm.value.commentName.trim() ||
    !templateForm.value.commentCode.trim() ||
    !templateForm.value.commentContent.trim()
  ) {
    message.warning('请填写名称、代码和内容')
    return
  }
  saving.value = true
  try {
    await CommentTemplateApi.saveBusiness(templateForm.value)
    templateVisible.value = false
    await loadTemplates()
    message.success('保存成功')
  } finally {
    saving.value = false
  }
}
const deleteTemplate = async (row: BusinessTemplate) => {
  await message.delConfirm()
  await CommentTemplateApi.deleteBusiness(row.commentGuid!)
  await loadTemplates()
}
const editBinding = async (row?: TemplateBinding) => {
  editingBinding.value = !!row
  bindingForm.value = row ? { ...row } : emptyBinding()
  await loadFields(bindingForm.value.sourceType)
  bindingVisible.value = true
}
const parseMapping = (text: string): Record<string, string> => {
  const value = JSON.parse(text || '{}')
  if (
    !value ||
    Array.isArray(value) ||
    typeof value !== 'object' ||
    Object.values(value).some((item) => typeof item !== 'string')
  )
    throw new Error('映射必须是键和值均为字符串的JSON对象')
  return value
}
const saveBinding = async () => {
  if (!bindingForm.value.processDefinitionKey.trim() || !bindingForm.value.bizdefGuid.trim()) {
    message.warning('请填写流程Key和旧业务定义ID')
    return
  }
  let nodeMapping: Record<string, string>
  let fieldMapping: Record<string, string>
  try {
    nodeMapping = parseMapping(bindingForm.value.nodeMapping)
    fieldMapping = parseMapping(bindingForm.value.fieldMapping)
  } catch {
    message.warning('请检查环节和字段映射的JSON格式')
    return
  }
  saving.value = true
  try {
    await CommentTemplateApi.saveBinding({ ...bindingForm.value, nodeMapping, fieldMapping })
    bindingVisible.value = false
    await refresh()
    message.success('保存成功')
  } finally {
    saving.value = false
  }
}
const deleteBinding = async (row: TemplateBinding) => {
  await message.confirm('删除映射后，该流程将不再加载业务模板，原模板数据保留。是否继续？')
  await CommentTemplateApi.deleteBinding(row.processDefinitionKey)
  await refresh()
}
onMounted(refresh)
</script>
