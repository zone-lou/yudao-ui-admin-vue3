<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap title="会议报告单申请信息">
        <template #header>
          <el-button type="primary" @click="handleOpenDialog" :loading="formLoading">
            <Icon icon="ep:promotion" class="mr-5px" /> 发送
          </el-button>
        </template>

        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="150px"
          v-loading="formLoading"
        >
          <el-row>
            <el-col :span="12">
              <el-form-item label="会议名称" prop="title">
                <el-input v-model="formData.title" placeholder="请输入会议名称" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="会议时间" prop="startDate">
                <el-date-picker
                  v-model="formData.startDate"
                  type="date"
                  value-format="x"
                  placeholder="选择会议时间"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="会议地点" prop="venue">
                <el-input v-model="formData.venue" placeholder="请输入会议地点" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="召集单位及召集人" prop="joinUnit">
                <el-input v-model="formData.joinUnit" placeholder="请输入召集单位及召集人" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row>
            <el-col :span="12">
              <el-form-item label="我局参会科室" prop="offerUnit">
                <el-input v-model="formData.offerUnit" placeholder="请输入我局参会科室" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="我局参会人员" prop="offerPerson">
                <el-input v-model="formData.offerPerson" placeholder="请输入我局参会人员" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="会议主要内容及我局承办事项" prop="content">
            <el-input
              v-model="formData.content"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="会议主要内容及我局承办事项"
            />
          </el-form-item>
          <el-form-item label="参会人员会议表态情况及建议意见" prop="situation">
            <el-input
              v-model="formData.situation"
              type="textarea"
              :autosize="{ minRows: 2, maxRows: 4 }"
              placeholder="参会人员会议表态情况及建议意见"
            />
          </el-form-item>

          <el-form-item label="附件" prop="attachFilePath">
            <UploadFile v-model="formData.attachFilePath" />
          </el-form-item>
        </el-form>
      </ContentWrap>
    </el-col>
  </el-row>

  <ProcessSendDialog
    ref="sendDialogRef"
    title="发送会议报告单"
    :show-reason="false"
    :process-definition-id="processDefinitionId"
    :activity-id="startUserNodeId"
    @submit="submitProcess"
  />
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useMessage } from '@/hooks/web/useMessage'
import * as DefinitionApi from '@/api/bpm/definition'
import { Confflow, ConfflowApi } from '@/api/bpm/confflow' // 引入会议报告单API
import { dateUtil } from '@/utils/dateUtil'

// 引入弹窗相关组件和常量
import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'
import { NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'

defineOptions({ name: 'BpmConfflowCreate' })

const message = useMessage()
const { delView } = useTagsViewStore()
const { push } = useRouter()
const route = useRoute()

// ===== 弹窗控制 =====
const sendDialogRef = ref()
const startUserNodeId = NodeId.START_USER_NODE_ID
const processDefinitionId = ref('')
const processDefineKey = 'conference_report' // 流程定义 Key

const formLoading = ref(false)
const formRef = ref()

// 表单数据初始化
const formData = ref({
  id: undefined,
  title: undefined,
  applyDate: undefined,
  startDate: undefined,
  venue: undefined,
  joinUnit: undefined,
  offerUnit: undefined,
  offerPerson: undefined,
  situation: undefined,
  content: '',
  remark: undefined,
  attachFilePath: ''
})

// 表单校验规则
const formRules = reactive({
  title: [{ required: true, message: '会议名称不能为空', trigger: 'blur' }],
  startDate: [{ required: true, message: '会议时间不能为空', trigger: 'blur' }],
  venue: [{ required: true, message: '会议地点不能为空', trigger: 'blur' }]
})

/** 点击发送打开弹窗 */
const handleOpenDialog = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  // 打开选人弹窗
  sendDialogRef.value.open({})
}

/** 接收弹窗返回的 assignees 和 variables 并正式提交业务表单 */
const submitProcess = async (submitData: { nextNodeAssignees: any; variables: any }) => {
  formLoading.value = true
  try {
    const data = { ...formData.value } as unknown as Confflow

    // 绑定下一节点办理人参数
    data.nextNodeAssignees = submitData.nextNodeAssignees

    // 如果流程中有网关需要变量，在此序列化传入
    if (submitData.variables && Object.keys(submitData.variables).length > 0) {
      data.processVariablesStr = JSON.stringify(submitData.variables)
    }

    // 调用新增接口
    await ConfflowApi.createConfflow(data)
    message.success('会议报告单发起成功')

    if (sendDialogRef.value) {
      sendDialogRef.value.close()
    }

    // 延迟关闭当前 Tab 并跳转到统一办件列表
    setTimeout(() => {
      delView(route)
      push('/bpm/unified')
    }, 200)
  } catch (error) {
    console.error(error)
    if (sendDialogRef.value) {
      sendDialogRef.value.submitLoading = false
    }
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
  // 默认日期填充
  formData.value.applyDate = dateUtil().valueOf() // 时间戳

  // 获取流程定义 ID (用于弹窗加载节点配置)
  const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
    undefined,
    processDefineKey
  )

  if (!processDefinitionDetail) {
    message.error(`会议报告单流程(${processDefineKey})未配置，请检查！`)
    return
  }
  processDefinitionId.value = processDefinitionDetail.id
})
</script>

<style scoped lang="scss"></style>
