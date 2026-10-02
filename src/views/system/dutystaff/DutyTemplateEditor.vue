<template>
  <Dialog v-model="dialogVisible" :title="`编辑${templateLabel}文案`" width="min(960px, 95vw)">
    <div v-loading="loading">
<!--      <el-alert type="info" :closable="false" class="mb-4">-->
<!--        日期由系统自动填入；其他变量取自值班配置，可在下方直接修改实际内容。-->
<!--      </el-alert>-->
      <div class="duty-message-layout">
        <div>
          <div class="mb-2">消息内容</div>
          <el-input
            ref="contentInputRef"
            v-model="content"
            type="textarea"
            :rows="8"
            placeholder="请输入值班提醒内容"
          />
        </div>
        <div>
          <div class="mb-2">发送效果预览</div>
          <div class="duty-message-preview whitespace-pre-wrap rounded border border-solid border-gray-200 p-3">
            {{ preview || '请输入消息内容' }}
          </div>
          <div class="mt-2 text-sm text-gray-500">预览使用当前配置值，实际发送时会读取最新值。</div>
        </div>
      </div>
      <div class="mt-4 mb-2">点击插入变量</div>
      <el-space wrap>
        <el-tooltip v-for="item in variables" :key="item.key" :content="`当前值：${item.value}`">
          <el-button size="small" @click="insertVariable(item.key)">{{ item.key }}</el-button>
        </el-tooltip>
      </el-space>
      <el-collapse class="mt-4">
        <el-collapse-item title="变量实际内容（点击展开维护）" name="params">
          <div class="mb-2 flex justify-end">
            <el-button type="primary" plain v-hasPermi="['duty:staff:update']" @click="openCreateParam">
              新增变量
            </el-button>
          </div>
          <el-table :data="configVariables" size="small">
            <el-table-column label="变量名" prop="key" width="150" />
            <el-table-column label="当前内容" prop="value" show-overflow-tooltip />
            <el-table-column label="操作" width="90">
              <template #default="scope">
                <el-button link type="primary" v-hasPermi="['duty:staff:update']" @click="editParam(scope.row)">修改</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
      <el-alert v-if="unknownVariables.length" type="warning" :closable="false" class="mt-4">
        未配置的变量：{{ unknownVariables.join('、') }}。请新增变量，或从文案中删除。
      </el-alert>
    </div>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" :loading="saving" :disabled="loading" @click="save">保存文案</el-button>
    </template>
  </Dialog>
  <Dialog v-model="createParamVisible" title="新增值班变量" width="440px">
    <el-form ref="createParamFormRef" :model="createParamForm" :rules="createParamRules" label-width="90px">
      <el-form-item label="变量名" prop="label">
        <el-input v-model="createParamForm.label" maxlength="100" placeholder="例如 address" />
      </el-form-item>
      <el-form-item label="实际内容" prop="value">
        <el-input v-model="createParamForm.value" maxlength="100" placeholder="请输入发送时填入的内容" />
      </el-form-item>
    </el-form>
    <div class="text-sm text-gray-500">新增后可在文案中插入 {变量名}，发送时会自动填入实际内容。</div>
    <template #footer>
      <el-button @click="createParamVisible = false">取消</el-button>
      <el-button type="primary" :loading="createParamSaving" @click="submitCreateParam">确定</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as DutyMessageApi from '@/api/system/dutystaff/message'
import { ElMessageBox } from 'element-plus'

defineOptions({ name: 'DutyTemplateEditor' })

const message = useMessage()
const dialogVisible = ref(false)
const loading = ref(false)
const saving = ref(false)
const templateLabel = ref('')
const templateCode = ref('')
const content = ref('')
const contentInputRef = ref()
const configVariables = ref<{ id: number; key: string; value: string }[]>([])
const createParamVisible = ref(false)
const createParamSaving = ref(false)
const createParamFormRef = ref()
const createParamForm = reactive({ label: '', value: '' })
const createParamRules = {
  label: [
    { required: true, message: '请输入变量名', trigger: 'blur' },
    { pattern: /^[A-Za-z][A-Za-z0-9_]*$/, message: '以英文字母开头，只能包含字母、数字和下划线', trigger: 'blur' },
    { validator: (_rule: unknown, value: string, callback: (error?: Error) => void) => {
      callback(value === 'dutydate' ? new Error('dutydate 是系统日期变量') : undefined)
    }, trigger: 'blur' }
  ],
  value: [{ required: true, whitespace: true, message: '请输入实际内容', trigger: 'blur' }]
}

const variables = computed(() => {
  const now = new Date()
  const dutyDate = new Date(now)
  if (now.getHours() >= 12) dutyDate.setDate(dutyDate.getDate() + 1)
  const dateValue = `${dutyDate.getFullYear()}年${dutyDate.getMonth() + 1}月${dutyDate.getDate()}日`
  return [{ key: 'dutydate', value: dateValue }, ...configVariables.value]
})

const unknownVariables = computed(() => {
  const known = new Set(variables.value.map((item) => item.key))
  return [...new Set(Array.from(content.value.matchAll(/\{([^{}]+)\}/g), (match) => match[1]))]
    .filter((key) => !known.has(key))
})

const preview = computed(() => {
  const values = new Map(variables.value.map((item) => [item.key, item.value]))
  return content.value.replace(/\{([^{}]+)\}/g, (placeholder, key: string) => values.get(key) ?? placeholder)
})

const loadParams = async () => {
  configVariables.value = (await DutyMessageApi.getDutyParams())
    .map((item) => ({ id: item.id, key: item.label, value: item.value }))
}

const open = async (code: string, label: string) => {
  dialogVisible.value = true
  loading.value = true
  templateLabel.value = label
  templateCode.value = code
  content.value = ''
  configVariables.value = []
  try {
    const [templates, params] = await Promise.all([
      DutyMessageApi.getDutyTemplates(),
      DutyMessageApi.getDutyParams()
    ])
    const template = templates.find((item) => item.code === code && item.configured)
    if (!template) {
      message.error('模板不存在，请联系系统管理员')
      dialogVisible.value = false
      return
    }
    content.value = template.content || ''
    configVariables.value = params.map((item) => ({ id: item.id, key: item.label, value: item.value }))
  } finally {
    loading.value = false
  }
}
defineExpose({ open })

const insertVariable = async (key: string) => {
  const textarea = contentInputRef.value?.textarea as HTMLTextAreaElement | undefined
  const text = `{${key}}`
  const start = textarea?.selectionStart ?? content.value.length
  const end = textarea?.selectionEnd ?? content.value.length
  content.value = content.value.slice(0, start) + text + content.value.slice(end)
  await nextTick()
  textarea?.focus()
  textarea?.setSelectionRange(start + text.length, start + text.length)
}

const editParam = async (item: { id: number; key: string; value: string }) => {
  try {
    const { value } = await ElMessageBox.prompt(`修改“${item.key}”的实际内容`, '值班变量', {
      inputValue: item.value,
      inputValidator: (input) => {
        if (!input?.trim()) return '内容不能为空'
        if (input.length > 100) return '内容不能超过 100 个字符'
        return true
      }
    })
    await DutyMessageApi.updateDutyParamValue(item.id, value)
    await loadParams()
    message.success('变量内容已保存')
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') throw error
  }
}

const openCreateParam = async () => {
  createParamForm.label = ''
  createParamForm.value = ''
  createParamVisible.value = true
  await nextTick()
  createParamFormRef.value?.clearValidate()
}

const submitCreateParam = async () => {
  if (!createParamFormRef.value) return
  await createParamFormRef.value.validate()
  createParamSaving.value = true
  try {
    await DutyMessageApi.createDutyParam(createParamForm.label, createParamForm.value)
    await loadParams()
    createParamVisible.value = false
    message.success('变量已新增')
  } finally {
    createParamSaving.value = false
  }
}

const emit = defineEmits(['success'])
const save = async () => {
  if (!content.value.trim()) {
    message.warning('请填写消息内容')
    return
  }
  if (unknownVariables.value.length) {
    message.warning('请先处理未配置的变量')
    return
  }
  saving.value = true
  try {
    await DutyMessageApi.updateDutyTemplateContent(templateCode.value, content.value)
    message.success('文案已保存')
    dialogVisible.value = false
    emit('success')
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.duty-message-layout {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.duty-message-preview {
  max-height: 240px;
  min-height: 170px;
  overflow: auto;
  overflow-wrap: anywhere;
}

@media (width <= 767px) {
  .duty-message-layout {
    grid-template-columns: 1fr;
  }
}
</style>
