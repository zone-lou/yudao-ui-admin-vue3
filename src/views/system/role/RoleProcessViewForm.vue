<template>
  <Dialog v-model="visible" title="办件查看范围" width="600">
    <el-form v-loading="loading" label-width="100px">
      <el-form-item label="角色名称">
        <el-tag>{{ roleName }}</el-tag>
      </el-form-item>
      <el-form-item label="可查看类型">
        <el-select
          v-model="selectedKeys"
          multiple
          filterable
          collapse-tags
          collapse-tags-tooltip
          placeholder="请选择办件类型"
          class="w-full"
        >
          <el-option
            v-for="item in options"
            :key="item.key"
            :label="item.name"
            :value="item.key"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button type="primary" :loading="loading" @click="save">保存</el-button>
      <el-button @click="visible = false">取消</el-button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import * as DefinitionApi from '@/api/bpm/definition'
import * as ScopeApi from '@/api/bpm/processViewScope'
import type { RoleVO } from '@/api/system/role'

const message = useMessage()
const visible = ref(false)
const loading = ref(false)
const roleId = ref<number>()
const roleName = ref('')
const selectedKeys = ref<string[]>([])
const options = ref<{ key: string; name: string }[]>([])

const historyTypes = [
  { key: 'receive_doc', name: '历史收文' },
  { key: 'leave', name: '历史请假' },
  { key: 'time_explain', name: '历史因公外出' },
  { key: 'confflow', name: '历史会议报告单' },
  { key: 'xzfy', name: '历史行政复议' },
  { key: 'xzss', name: '历史行政诉讼' },
  { key: 'history', name: '其他历史流程' }
]

const open = async (role: RoleVO) => {
  visible.value = true
  roleId.value = role.id
  roleName.value = role.name
  selectedKeys.value = []
  loading.value = true
  try {
    const [definitions, keys] = await Promise.all([
      DefinitionApi.getSimpleProcessDefinitionList(),
      ScopeApi.getRoleProcessViewKeys(role.id)
    ])
    const items = [...definitions, ...historyTypes]
    options.value = Array.from(new Map(items.map((item) => [item.key, item])).values())
    selectedKeys.value = keys
    keys.forEach((key) => {
      if (!options.value.some((item) => item.key === key)) {
        options.value.push({ key, name: `${key}（已配置）` })
      }
    })
  } finally {
    loading.value = false
  }
}

const save = async () => {
  if (roleId.value == null) return
  loading.value = true
  try {
    await ScopeApi.setRoleProcessViewKeys(roleId.value, selectedKeys.value)
    message.success('办件查看范围已保存')
    visible.value = false
  } finally {
    loading.value = false
  }
}

defineExpose({ open })
</script>
