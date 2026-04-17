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
          label-width="0"
          v-loading="formLoading"
        >
          <div class="oa-container">
            <div class="doc-title">义乌市自然资源和规划局会议报告单</div>
            <table class="oa-table">
              <colgroup>
                <col style="width: 140px;" />
                <col style="width: 35%;" />
                <col style="width: 140px;" />
                <col />
              </colgroup>
              <tbody>
                <tr class="h-row">
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>会议名称</td>
                  <td class="input-cell">
                    <el-form-item prop="title" class="mb-0">
                      <el-input v-model="formData.title" placeholder="请输入会议名称" />
                    </el-form-item>
                  </td>
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>会议时间</td>
                  <td class="input-cell">
                    <el-form-item prop="startDate" class="mb-0">
                      <el-date-picker
                        v-model="formData.startDate"
                        type="date"
                        value-format="x"
                        placeholder="选择会议时间"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <tr class="h-row">
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>会议地点</td>
                  <td class="input-cell">
                    <el-form-item prop="venue" class="mb-0">
                      <el-input v-model="formData.venue" placeholder="请输入会议地点" />
                    </el-form-item>
                  </td>
                  <td class="label-cell">召集单位<br />及召集人</td>
                  <td class="input-cell">
                    <el-form-item prop="joinUnit" class="mb-0">
                      <el-input v-model="formData.joinUnit" placeholder="请输入召集单位及召集人" />
                    </el-form-item>
                  </td>
                </tr>

                <tr class="h-row">
                  <td class="label-cell">我局参会科室</td>
                  <td class="input-cell">
                    <el-form-item prop="offerUnit" class="mb-0">
                      <el-input v-model="formData.offerUnit" placeholder="请输入我局参会科室" />
                    </el-form-item>
                  </td>
                  <td class="label-cell">我局参会人员</td>
                  <td class="input-cell">
                    <el-form-item prop="offerPerson" class="mb-0">
                      <el-input v-model="formData.offerPerson" placeholder="请输入我局参会人员" />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">会议主要内容<br />及我局承办事项</td>
                  <td colspan="3" class="input-cell h-large" style="padding: 10px;">
                    <el-form-item prop="content" class="mb-0 h-full w-full">
                      <el-input
                        v-model="formData.content"
                        type="textarea"
                        :autosize="{ minRows: 4, maxRows: 6 }"
                        placeholder="请输入主要内容及事项"
                        class="h-full w-full"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">参会人员<br />会议表态情况<br />及建议意见</td>
                  <td colspan="3" class="input-cell h-medium" style="padding: 10px;">
                    <el-form-item prop="situation" class="mb-0 h-full w-full">
                      <el-input
                        v-model="formData.situation"
                        type="textarea"
                        :autosize="{ minRows: 3, maxRows: 5 }"
                        placeholder="请输入表态情况及意见"
                        class="h-full w-full"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <!-- 附件列表行 -->
                <tr class="print-hide-row">
                  <td class="label-cell">附件列表</td>
                  <td colspan="3" class="input-cell">
                    <el-form-item prop="attachFilePath" class="mb-0">
                      <UploadFile v-model="formData.attachFilePath" />
                    </el-form-item>
                  </td>
                </tr>

                <!-- 留空的签名区，保持样式一致 -->
                <tr>
                    <td class="label-cell" rowspan="2">科室负责人审核</td>
                    <td colspan="3" style="height: 50px; padding: 10px;"></td>
                </tr>
                <tr>
                    <td colspan="3" class="footer-row">
                        <div class="footer-content border-none" style="display: flex; justify-content: flex-start; padding-left: 20px; gap: 20px;">
                            <span>办理人员：<span class="sign-input"></span></span>
                            <span>办理日期：<span class="sign-input"></span></span>
                        </div>
                    </td>
                </tr>

                <tr>
                    <td class="label-cell">分管领导阅签</td>
                    <td colspan="3" class="nested-table-container">
                        <table class="nested-table">
                            <tr>
                                <td class="sub-header" style="width: 60%;">办理意见</td>
                                <td class="sub-header" style="width: 20%;">办理人员</td>
                                <td class="sub-header" style="width: 20%;">办理日期</td>
                            </tr>
                            <tr>
                                <td class="sub-content"></td>
                                <td class="sub-content" style="text-align: center;"></td>
                                <td class="sub-content" style="text-align: center;"></td>
                            </tr>
                        </table>
                    </td>
                </tr>

                <tr>
                    <td class="label-cell" rowspan="2">局长阅签</td>
                    <td colspan="3" style="height: 50px; padding: 10px;"></td>
                </tr>
                <tr>
                    <td colspan="3" class="footer-row">
                        <div class="footer-content" style="display: flex; justify-content: center; gap: 50px;">
                            <span>办理人员：<span class="sign-input"></span></span>
                            <span>日期：<span class="sign-input"></span></span>
                        </div>
                    </td>
                </tr>

              </tbody>
            </table>
          </div>
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
import { useUserStore } from '@/store/modules/user'
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
const userStore = useUserStore()
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

  // 默认填充发起人信息（我局参会科室，我局参会人员）
  const currentUser = userStore.user as any
  if (currentUser) {
    if (currentUser.nickname) {
      formData.value.offerPerson = currentUser.nickname
    }
    if (currentUser.dept?.name) {
      formData.value.offerUnit = currentUser.dept.name
    } else if (currentUser.deptName) {
      formData.value.offerUnit = currentUser.deptName
    }
  }

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
<style lang="scss" scoped>
.oa-container {
  font-family: SimSun, 'Songti SC', STSong, serif;
  width: 100%;
  max-width: 900px;
  padding: 30px 40px;
  margin: 0 auto;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.doc-title {
  margin-bottom: 20px;
  font-size: 28px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #d71920;
  text-align: center;
}

.oa-table {
  width: 100%;
  table-layout: fixed;
  border: 1px solid #d71920;
  border-collapse: collapse;
}

.oa-table td {
  padding: 8px;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
  word-wrap: break-word;
  vertical-align: middle;
  border: 1px solid #d71920;
}

.label-cell {
  width: 140px;
  font-weight: bold;
  color: #d71920;
  text-align: center;
  background-color: #fffbfc;
}

.input-cell {
  padding: 4px 8px !important;
  overflow: visible; /* 必须使 el-form-item__error 不被截断 */
}

.h-row {
  height: 45px;
}

.h-large {
  height: 120px;
  text-align: left;
  vertical-align: top;
}

.h-medium {
  height: 80px;
  text-align: left;
  vertical-align: top;
}

.footer-row {
  height: 35px;
  vertical-align: middle;
}

.footer-content {
  color: #444;
}

.sign-input {
  display: inline-block;
  min-width: 80px;
  text-align: center;
  border-bottom: none;
}

/* === 嵌套表格样式 === */
.nested-table-container {
  height: 100%;
  padding: 0 !important;
}

.nested-table {
  width: 100%;
  height: 100%;
  margin: 0;
  border: none;
  border-collapse: collapse;
}

.nested-table td,
.sub-header,
.sub-content {
  padding: 5px;
  vertical-align: middle;
  border: none;
  border-right: 1px solid #d71920 !important;
  border-bottom: 1px solid #d71920 !important;
}

.nested-table tr:last-child td,
.nested-table tr:last-child .sub-content {
  border-bottom: none !important;
}

.nested-table tr td:last-child,
.nested-table tr .sub-header:last-child,
.nested-table tr .sub-content:last-child {
  border-right: none !important;
}

.sub-header {
  height: 30px;
  font-weight: bold;
  color: #d71920;
  text-align: center;
  background-color: #fffbfc;
}

.sub-content {
  height: 50px;
  vertical-align: top;
}

/* ================== Element Plus 覆写 ================== */
:deep(.el-input__wrapper),
:deep(.el-textarea__inner) {
  padding: 0;
  background-color: transparent;
  border-radius: 0;
  box-shadow: none !important;
}

:deep(.el-input__inner) {
  font-family: inherit;
  font-size: 14px;
  color: #000;
  text-align: left;
}

:deep(.el-textarea__inner) {
  font-family: inherit;
  font-size: 14px;
  color: #000;
  resize: none;
}

:deep(.el-form-item) {
  margin-bottom: 0 !important;
}

/* 浮动气泡样式的必填报错提醒 */
:deep(.el-form-item__error) {
  position: absolute;
  top: -20px;
  left: 0;
  z-index: 1000;
  padding: 2px 6px;
  font-family: sans-serif;
  font-size: 11px;
  line-height: 1;
  color: #fff;
  white-space: nowrap;
  background-color: #f56c6c;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.12);
}

:deep(.el-form-item__error::after) {
  position: absolute;
  bottom: -4px;
  left: 10px;
  display: block;
  width: 0;
  height: 0;
  content: '';
  border-color: #f56c6c transparent transparent transparent;
  border-style: solid;
  border-width: 4px 4px 0 4px;
}

/* 隐藏输入框获取焦点时的边框 */
:deep(.el-input.is-focus .el-input__wrapper),
:deep(.el-textarea__inner:focus) {
  outline: none;
  box-shadow: none !important;
}

@media print {
  .print-hide-row {
    display: none !important;
  }
}
</style>
