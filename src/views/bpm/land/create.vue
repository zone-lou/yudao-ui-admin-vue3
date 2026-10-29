<template>
  <ContentWrap
    :title="isManagementEdit ? '土地用途认定修改' : '土地用途认定登记'"
    v-loading="loading"
  >
    <template #header>
      <el-button
        v-if="!isManagementEdit"
        type="primary"
        :disabled="initializing || !ready || !definitionId"
        :loading="loading"
        @click="openSend"
      >
        <Icon icon="ep:promotion" class="mr-5px" /> 发送
      </el-button>
      <el-button type="success" :disabled="initializing || !ready" :loading="loading" @click="save">
        <Icon icon="ep:document-checked" class="mr-5px" />
        {{ isManagementEdit ? '保存修改' : '保存' }}
      </el-button>
    </template>
    <el-result v-if="loadFailed" icon="error" title="登记信息加载失败">
      <template #extra><el-button @click="initialize">重新加载</el-button></template>
    </el-result>
    <LandSheet v-else :ref="setSheetRef" v-model="record" editable>
      <tr v-for="label in opinionLabels" :key="label"
        ><th scope="row">{{ label }}</th
        ><td colspan="3" class="blank-opinion"
          ><span>办理人：　　　　　　　　　日期：</span></td
        ></tr
      >
    </LandSheet>
    <ProcessSendDialog
      :ref="setSendRef"
      title="发送土地用途认定"
      :show-sms="true"
      :show-reason="false"
      :process-definition-id="definitionId"
      :process-instance-id="record.processInstanceId"
      :task-id="record.taskId"
      :activity-id="LAND_REGISTER_NODE"
      @submit="submit"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/modules/user'
import { useMessage } from '@/hooks/web/useMessage'
import { getUserProfile } from '@/api/system/user/profile'
import { getProcessDefinition } from '@/api/bpm/definition'
import { emptyLandRecord, landApi, LAND_PROCESS_KEY, LAND_REGISTER_NODE } from '@/api/bpm/land'
import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'
import LandSheet from './components/LandSheet.vue'

defineOptions({ name: 'BpmLandCreate' })
const route = useRoute()
const isManagementEdit = computed(() => Boolean(route.query.id))
const router = useRouter()
const message = useMessage()
const userStore = useUserStore()
const record = ref(emptyLandRecord())
const definitionId = ref('')
const initializing = ref(true)
const loading = ref(false)
const loadFailed = ref(false)
const ready = ref(false)
const sheetRef = ref<InstanceType<typeof LandSheet>>()
const sendRef = ref<InstanceType<typeof ProcessSendDialog>>()
const setSheetRef = (element: Element | ComponentPublicInstance | null) => {
  sheetRef.value = element as InstanceType<typeof LandSheet> | undefined
}
const setSendRef = (element: Element | ComponentPublicInstance | null) => {
  sendRef.value = element as InstanceType<typeof ProcessSendDialog> | undefined
}
const opinionLabels = ['主办科室意见', '协办科室意见', '科室人员办理意见', '登记中心汇总意见']

const validate = async () => {
  try {
    return Boolean(await sheetRef.value?.validate())
  } catch (error) {
    message.warning(error instanceof Error ? error.message : '请检查登记信息')
    return false
  }
}
const persist = async () => {
  const data = { ...record.value, fileList: sheetRef.value?.getFiles() || [] }
  if (isManagementEdit.value) await landApi.managementUpdate(data)
  else if (data.id) await landApi.update(data)
  else {
    const result = await landApi.save(data)
    if (!result?.id) throw new Error('保存未返回业务编号，请重新加载后核实')
    Object.assign(data, result)
  }
  // 立即保留业务编号；后续发送失败时重试不会重复创建。
  record.value = data
  return data
}
const save = async () => {
  if (loading.value || !(await validate())) return
  loading.value = true
  try {
    await persist()
    message.success('保存成功')
  } catch (error) {
    if (error instanceof Error) message.error(error.message)
  } finally {
    loading.value = false
  }
}
const openSend = async () => {
  if (isManagementEdit.value) return
  if (loading.value || !(await validate())) return
  if (!definitionId.value) {
    message.warning('未找到土地用途认定流程，请检查流程配置')
    return
  }
  await sendRef.value?.open({})
}
interface SendData {
  nextNodeAssignees: Record<string, number[]>
  variables: Record<string, unknown>
  sendSms: boolean
}
const submit = async (selection: SendData) => {
  if (isManagementEdit.value) return
  if (loading.value) return
  if (!(await validate())) {
    if (sendRef.value) sendRef.value.submitLoading = false
    return
  }
  loading.value = true
  try {
    const data = await persist()
    await landApi.submit({
      ...data,
      nextNodeAssignees: selection.nextNodeAssignees,
      processVariablesStr: JSON.stringify(selection.variables || {}),
      sendSms: selection.sendSms
    })
    sendRef.value?.close()
    ready.value = false
    message.success('土地用途认定已发送')
    if (data.processInstanceId)
      await router.replace({
        name: 'BpmProcessInstanceDetail',
        query: { id: data.processInstanceId }
      })
  } catch (error) {
    if (error instanceof Error) message.error(error.message)
  } finally {
    loading.value = false
    if (sendRef.value) sendRef.value.submitLoading = false
  }
}
const initialize = async () => {
  initializing.value = true
  loadFailed.value = false
  ready.value = false
  try {
    const id = Number(route.query.id)
    if (route.query.id && (!Number.isSafeInteger(id) || id <= 0)) throw new Error('业务编号无效')
    if (id) {
      const data = await landApi.get(id)
      record.value = { ...emptyLandRecord(), ...data, fileList: data.fileList || [] }
    } else {
      record.value.startUserName = userStore.getUser.nickname
      const profile = await getUserProfile()
      record.value.deptName = profile.dept?.name || userStore.getUser.deptName
    }
    if (!isManagementEdit.value) {
      const definition = await getProcessDefinition(undefined, LAND_PROCESS_KEY)
      definitionId.value = definition?.id || ''
      if (!definitionId.value) message.warning('土地用途认定流程尚未配置，暂不能发送')
    }
    await nextTick()
    ready.value = true
  } catch (error) {
    loadFailed.value = true
    if (error instanceof Error) message.error(error.message)
  } finally {
    initializing.value = false
  }
}
onMounted(initialize)
</script>

<style scoped>
.blank-opinion {
  height: 140px;
  text-align: right;
  vertical-align: bottom;
}

.blank-opinion span {
  font-size: 16px;
  color: #555;
}
</style>
