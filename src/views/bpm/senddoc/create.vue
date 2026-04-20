<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <ContentWrap title="发文申请信息">
        <template #header>
          <el-button
            v-if="!formData.processInstanceId"
            type="primary"
            @click="handleOpenDialog"
            :loading="formLoading"
          >
            <Icon icon="ep:promotion" class="mr-5px" /> 发送
          </el-button>
          <el-button
            v-if="!formData.processInstanceId"
            type="success"
            @click="handleSave"
            :loading="formLoading"
          >
            <Icon icon="ep:document-checked" class="mr-5px" /> 保存草稿
          </el-button>
          <el-button v-else type="primary" @click="handleSave" :loading="formLoading">
            <Icon icon="ep:document-checked" class="mr-5px" /> 保存修改
          </el-button>
        </template>

        <el-form
          ref="formRef"
          :model="formData"
          :rules="formRules"
          label-width="0"
          v-loading="formLoading"
        >
          <div class="oa-container" id="printDivTag">
            <div class="doc-title">义乌市自然资源和规划局发文拟稿单</div>

            <table class="oa-table">
              <colgroup>
                <col style="width: 15%" />
                <col style="width: 20%" />
                <col style="width: 15%" />
                <col style="width: 20%" />
                <col style="width: 15%" />
                <col style="width: 15%" />
              </colgroup>
              <tbody>
                <!-- 标题 -->
                <tr>
                  <td class="label-cell"><span class="text-red-500 mr-5px">*</span>标 题</td>
                  <td colspan="5" class="input-cell">
                    <el-form-item prop="subject" class="mb-0 w-full h-full">
                      <el-input
                        v-model="formData.subject"
                        placeholder="请输入公文标题"
                        style="text-align: center"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <!-- 发文字号、秘密/紧急 -->
                <tr>
                  <td class="label-cell" rowspan="2"
                    ><span class="text-red-500 mr-5px">*</span>发文字号</td
                  >
                  <td class="input-cell" rowspan="2" colspan="2">
                    <div
                      style="display: flex; align-items: center; justify-content: center; gap: 4px"
                    >
                      <el-form-item prop="sendDocNumber" style="width: 130px">
                        <el-select v-model="formData.sendDocNumber" placeholder="">
                          <el-option
                            v-for="dict in getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)"
                            :key="dict.value"
                            :label="dict.label"
                            :value="dict.label"
                          />
                        </el-select>
                      </el-form-item>
                      <span>〔</span>
                      <el-form-item prop="year" style="width: 80px">
                        <el-date-picker
                          v-model="formData.year"
                          type="year"
                          value-format="YYYY"
                          placeholder=""
                          :clearable="false"
                        />
                      </el-form-item>
                      <span>〕</span>
                      <el-form-item prop="docSequence" style="width: 80px">
                        <el-input v-model="formData.docSequence" placeholder="" />
                      </el-form-item>
                      <span>号</span>
                    </div>
                  </td>
                  <td class="label-cell">秘密等级</td>
                  <td class="input-cell" colspan="2">
                    <el-form-item prop="secretDegree" class="mb-0">
                      <el-select
                        v-model="formData.secretDegree"
                        placeholder="请选择"
                        style="width: 100%"
                      >
                        <el-option label="无" value="" />
                        <el-option
                          v-for="dict in getStrDictOptions(DICT_TYPE.BPM_DEGREE_OF_SECRECY)"
                          :key="dict.value"
                          :label="dict.label"
                          :value="dict.value"
                        />
                      </el-select>
                    </el-form-item>
                  </td>
                </tr>
                <tr>
                  <td class="label-cell">紧急程度</td>
                  <td class="input-cell" colspan="2">
                    <el-form-item prop="urgencyDegree" class="mb-0">
                      <el-select
                        v-model="formData.urgencyDegree"
                        placeholder="请选择"
                        style="width: 100%"
                      >
                        <el-option
                          v-for="dict in getStrDictOptions(DICT_TYPE.BPM_EMERGENCY_DEGREE)"
                          :key="dict.value"
                          :label="dict.label"
                          :value="dict.value"
                        />
                      </el-select>
                    </el-form-item>
                  </td>
                </tr>

                <!-- 附件区域 -->
                <tr class="print-hide-row">
                  <td class="label-cell">附 件</td>
                  <td colspan="5" class="input-cell">
                    <el-form-item prop="attachFilePath" class="mb-0">
                      <UploadFile v-model="formData.attachFilePath" />
                    </el-form-item>
                  </td>
                </tr>

                <!-- 拟稿区域 -->
                <tr>
                  <td class="label-cell">拟 稿</td>
                  <td
                    colspan="5"
                    class="input-cell"
                    style="
                      position: relative;
                      height: 100px;
                      padding-bottom: 40px !important;
                      vertical-align: top;
                    "
                  >
                    <el-form-item prop="sendDocDraft" class="mb-2">
                      <el-input
                        v-model="formData.sendDocDraft"
                        type="textarea"
                        :rows="3"
                        placeholder="请输入内容"
                      />
                    </el-form-item>

                    <div
                      class="flex justify-between items-center px-2"
                      style="
                        position: absolute;
                        right: 8px;
                        bottom: 8px;
                        left: 8px;
                        font-size: 13px;
                        color: #666;
                      "
                    >
                      <div class="flex items-center gap-1">
                        <span>拟稿人：</span>
                        <el-form-item prop="draftPerson" style="width: 100px">
                          <el-input
                            v-model="formData.draftPerson"
                            placeholder="拟稿人"
                            size="small"
                          />
                        </el-form-item>
                      </div>
                      <div class="flex items-center gap-1">
                        <span>拟稿单位：</span>
                        <el-form-item prop="sendDept" style="width: 150px">
                          <el-input v-model="formData.sendDept" placeholder="部门" size="small" />
                        </el-form-item>
                      </div>
                      <div class="flex items-center gap-1">
                        <span>拟稿时间：</span>
                        <el-form-item prop="draftDate" style="width: 130px">
                          <el-date-picker
                            v-model="formData.draftDate"
                            type="date"
                            value-format="x"
                            placeholder="时间"
                            size="small"
                            style="width: 100%"
                          />
                        </el-form-item>
                      </div>
                    </div>
                  </td>
                </tr>

                <!-- 合法性审查 -->
                <tr style="height: 35px">
                  <td class="label-cell" rowspan="2">合法性审查</td>
                  <td class="label-cell" style="text-align: center; background-color: transparent"
                    >姓名</td
                  >
                  <td
                    class="label-cell"
                    style="text-align: center; background-color: transparent"
                    colspan="2"
                    >日期</td
                  >
                  <td
                    class="label-cell"
                    style="text-align: center; background-color: transparent"
                    colspan="2"
                    >意见</td
                  >
                </tr>
                <tr style="height: 35px">
                  <td class="data-text"></td>
                  <td class="data-text" colspan="2"></td>
                  <td class="data-text" colspan="2"></td>
                </tr>

                <!-- 文字格式审查 -->
                <tr style="height: 35px">
                  <td class="label-cell" rowspan="2">文字格式审查</td>
                  <td class="label-cell" style="text-align: center; background-color: transparent"
                    >姓名</td
                  >
                  <td
                    class="label-cell"
                    style="text-align: center; background-color: transparent"
                    colspan="2"
                    >日期</td
                  >
                  <td
                    class="label-cell"
                    style="text-align: center; background-color: transparent"
                    colspan="2"
                    >意见</td
                  >
                </tr>
                <tr style="height: 35px">
                  <td class="data-text"></td>
                  <td class="data-text" colspan="2"></td>
                  <td class="data-text" colspan="2"></td>
                </tr>

                <!-- 分管领导审阅 -->
                <tr style="height: 35px">
                  <td class="label-cell" rowspan="2">分管领导审阅</td>
                  <td class="label-cell" style="text-align: center; background-color: transparent"
                    >姓名</td
                  >
                  <td
                    class="label-cell"
                    style="text-align: center; background-color: transparent"
                    colspan="2"
                    >日期</td
                  >
                  <td
                    class="label-cell"
                    style="text-align: center; background-color: transparent"
                    colspan="2"
                    >意见</td
                  >
                </tr>
                <tr style="height: 35px">
                  <td class="data-text"></td>
                  <td class="data-text" colspan="2"></td>
                  <td class="data-text" colspan="2"></td>
                </tr>

                <!-- 机关信息 -->
                <tr>
                  <td class="label-cell">主送机关</td>
                  <td colspan="5" class="input-cell">
                    <el-form-item prop="primarySendDept" class="mb-0">
                      <el-input
                        v-model="formData.primarySendDept"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入主送机关"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">抄送机关</td>
                  <td colspan="5" class="input-cell">
                    <el-form-item prop="copySendDept" class="mb-0">
                      <el-input
                        v-model="formData.copySendDept"
                        type="textarea"
                        :rows="2"
                        placeholder="请输入抄送机关"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <!-- 属性 -->
                <tr>
                  <td class="label-cell">公开方式</td>
                  <td class="input-cell" colspan="2">
                    <el-form-item prop="inforelease" class="mb-0">
                      <el-radio-group v-model="formData.inforelease">
                        <el-radio label="1">主动公开</el-radio>
                        <el-radio label="2">依申请</el-radio>
                        <el-radio label="3">不公开</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </td>
                  <td class="label-cell">不公开理由</td>
                  <td class="input-cell" colspan="2">
                    <el-form-item prop="noreleasecause" class="mb-0">
                      <el-input
                        v-model="formData.noreleasecause"
                        placeholder="理由 (仅限不公开)"
                        :disabled="formData.inforelease !== '3'"
                      />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">规范性文件</td>
                  <td class="input-cell" colspan="5">
                    <el-form-item prop="isNormativeDocument" class="mb-0">
                      <el-radio-group v-model="formData.isNormativeDocument">
                        <el-radio :label="1">是</el-radio>
                        <el-radio :label="2">否</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">发文日期</td>
                  <td class="input-cell" colspan="2">
                    <el-form-item prop="sendTime" class="mb-0">
                      <el-date-picker
                        v-model="formData.sendTime"
                        type="date"
                        value-format="x"
                        placeholder="发文日期"
                        style="width: 100%"
                      />
                    </el-form-item>
                  </td>
                  <td class="label-cell">份 数</td>
                  <td class="input-cell" colspan="2">
                    <el-form-item prop="signPrintCount" class="mb-0">
                      <el-input
                        v-model.number="formData.signPrintCount"
                        type="number"
                        placeholder=""
                      />
                    </el-form-item>
                  </td>
                </tr>

                <tr>
                  <td class="label-cell">打 字</td>
                  <td class="input-cell" colspan="2">
                    <el-form-item prop="typist" class="mb-0">
                      <el-input v-model="formData.typist" placeholder="" />
                    </el-form-item>
                  </td>
                  <td class="label-cell">校 对</td>
                  <td class="input-cell" colspan="2">
                    <el-form-item prop="proofreader" class="mb-0">
                      <el-input v-model="formData.proofreader" placeholder="" />
                    </el-form-item>
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
    title="发送发文申请"
    :show-reason="false"
    :process-definition-id="processDefinitionId"
    :activity-id="startUserNodeId"
    @submit="submitProcess"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, unref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useMessage } from '@/hooks/web/useMessage'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'
import * as DefinitionApi from '@/api/bpm/definition'
import { SendDocApi } from '@/api/bpm/senddoc'

// 引入弹窗组件及常量
import ProcessSendDialog from '@/components/ProcessSendDialog/index.vue'
import { NodeId } from '@/components/SimpleProcessDesignerV2/src/consts'

defineOptions({ name: 'BpmSendDocCreate' })

const message = useMessage()
const { delView } = useTagsViewStore()
const { push, currentRoute } = useRouter()
const route = useRoute()
const userStore = useUserStore()

// ===== 弹窗控制 =====
const sendDialogRef = ref()
const startUserNodeId = NodeId.START_USER_NODE_ID
const processDefinitionId = ref('')
const processDefineKey = 'send_doc' // 发文流程 Key

const formLoading = ref(false)
const formRef = ref()

// 表单数据
const formData = ref({
  id: undefined,
  processInstanceId: undefined, // 流程实例ID (如果存在则代表流程已发起)
  subject: '',
  sendDocNumber: '',
  year: new Date().getFullYear().toString(),
  docSequence: '',
  sendTime: undefined as number | undefined,
  urgencyDegree: '',
  secretDegree: '',
  draftPerson: '',
  draftDate: undefined as number | undefined,
  sendDept: '',
  primarySendDept: '',
  copySendDept: '',
  sendDocDraft: '',
  attachFilePath: [] as string[],
  isNormativeDocument: 2,
  inforelease: '1',
  noreleasecause: '',
  signPrintCount: undefined as number | undefined,
  typist: '',
  proofreader: ''
})

const formRules = computed(() => ({
  subject: [{ required: true, message: '公文标题不能为空', trigger: 'blur' }],
  sendDocNumber: [{ required: true, message: '发文字号代字不能为空', trigger: 'change' }],
  year: [{ required: true, message: '年份不能为空', trigger: 'change' }],
  docSequence: [{ required: true, message: '序号不能为空', trigger: 'blur' }]
}))

/** 数据构建与格式化处理 */
const buildRequestData = () => {
  const data = { ...formData.value } as any

  // 格式化处理公开理由：如果非不公开，则清空不公开理由
  if (data.inforelease !== '3') {
    data.noreleasecause = undefined
  }

  // 对发送后端的富文本草稿进行 Base64 编码 (后端接收类型为 byte[])
  if (data.sendDocDraft) {
    data.sendDocDraft = window.btoa(unescape(encodeURIComponent(data.sendDocDraft)))
  }

  return data
}

/** 唤起发送弹窗 */
const handleOpenDialog = async () => {
  try {
    if (!formRef.value) return
    const valid = await formRef.value.validate()
    if (!valid) return
    if (!processDefinitionId.value) {
      message.error('流程代号加载中，请稍后重试')
      return
    }
    // 校验通过，唤起选人弹窗
    sendDialogRef.value.open({})
  } catch (err) {
    console.error('流程跳转校验失败:', err)
  }
}

/** 弹窗确认发送流程 */
const submitProcess = async (submitData: { nextNodeAssignees: any; variables: any }) => {
  formLoading.value = true
  try {
    const data = buildRequestData()

    // 绑定流程变量及下一步处理人
    data.nextNodeAssignees = submitData.nextNodeAssignees
    if (submitData.variables && Object.keys(submitData.variables).length > 0) {
      data.processVariablesStr = JSON.stringify(submitData.variables)
    }

    if (!data.id) {
      await SendDocApi.createSendDoc(data)
      message.success('发文申请发起成功')
    } else {
      await SendDocApi.updateSendDoc(data)
      message.success('发文更新并发送成功')
    }

    if (sendDialogRef.value) {
      sendDialogRef.value.close()
    }

    setTimeout(() => {
      delView(unref(currentRoute))
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

/** 保存草稿或修改 (不启动流程) */
const handleSave = async () => {
  // 保存草稿时，可以根据业务需求选择只校验部分必填项，此处统一做完整校验
  try {
    await formRef.value.validate()
  } catch (e) {
    return
  }

  formLoading.value = true
  try {
    const data = buildRequestData()
    if (data.id) {
      await SendDocApi.updateSendDoc(data)
      message.success('保存修改成功')
    } else {
      await SendDocApi.createSendDoc(data)
      message.success('保存草稿成功')
    }

    // 返回到发文列表
    setTimeout(() => {
      delView(unref(currentRoute))
      push('/bpm/OAdoc/send-doc')
    }, 200)
  } finally {
    formLoading.value = false
  }
}

/** 初始化 */
onMounted(async () => {
  try {
    // 获取流程定义 ID (供弹窗组件使用)
    const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
      undefined,
      processDefineKey
    )
    if (!processDefinitionDetail) {
      message.error(`发文流程(${processDefineKey})未配置，请检查！`)
      return
    }
    processDefinitionId.value = processDefinitionDetail.id
  } catch (error) {
    console.error('初始化流程定义失败:', error)
  }

  // 预填当前用户为拟稿人
  if (userStore.user.nickname) {
    formData.value.draftPerson = userStore.user.nickname
  }
  const anyUser = userStore.user as any
  if (anyUser.dept?.name) {
    formData.value.sendDept = anyUser.dept.name
  } else if (anyUser.deptName) {
    formData.value.sendDept = anyUser.deptName
  }
  formData.value.draftDate = Date.now() // 默认当前时间

  // 获取草稿或流转中数据回显
  const queryId = route.query.id
  if (queryId) {
    formLoading.value = true
    try {
      const detail = await SendDocApi.getSendDoc(Number(queryId))
      Object.assign(formData.value, detail)

      // 回显处理字典对应关系
      if (formData.value.sendDocNumber && /^\d+$/.test(String(formData.value.sendDocNumber))) {
        const dicts = getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)
        const dict = dicts.find((d) => String(d.value) === String(formData.value.sendDocNumber))
        if (dict) {
          formData.value.sendDocNumber = dict.label
        }
      }

      // Base64 解码，因为后端存储的是 byte[] 返回给前端是 Base64
      if (formData.value.sendDocDraft) {
        try {
          formData.value.sendDocDraft = decodeURIComponent(
            escape(window.atob(formData.value.sendDocDraft))
          )
        } catch (e) {}
      }
    } finally {
      formLoading.value = false
    }
  }
})
</script>

<style lang="scss" scoped>
@media print {
  .print-hide-row {
    display: none !important;
  }
}

.oa-container {
  width: 100%;
  padding: 10px 20px;
  margin: 0 auto;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
}

.doc-title {
  margin-bottom: 20px;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #d71920;
  text-align: center;
}

.oa-table {
  width: 100%;
  border: 2px solid #d71920;
  border-collapse: collapse;
  table-layout: fixed;
}

.oa-table td {
  padding: 4px 6px;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
  vertical-align: middle;
  border: 1px solid #d71920;
}

.label-cell {
  width: 120px;
  font-weight: bold;
  color: #d71920;
  text-align: center;
  white-space: nowrap;
  background-color: #fffbfc;
}

.center-text {
  text-align: center;
}

.min-h-cell {
  height: 35px;
}

.input-cell {
  padding: 4px 8px !important;
  overflow: visible; /* 防止 el-form-item__error 被截断 */
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
  position: absolute !important;
  top: -20px !important;
  left: 0 !important;
  z-index: 1000 !important;
  padding: 2px 8px !important;
  font-family: Arial, 'PingFang SC', 'Microsoft YaHei', sans-serif !important;
  font-size: 11px !important;
  font-weight: normal !important;
  line-height: 1.2 !important;
  color: #fff !important;
  white-space: nowrap !important;
  pointer-events: none;
  background: #f56c6c !important;
  border-radius: 4px !important;
  box-shadow: 0 2px 10px rgb(0 0 0 / 20%);
}

:deep(.el-form-item__error::after) {
  position: absolute;
  top: 100%;
  left: 10px;
  display: block;
  border-color: #f56c6c transparent transparent;
  border-style: solid;
  border-width: 4px 4px 0;
  content: '';
}

:deep(.oa-table) {
  .el-input.is-focus .el-input__wrapper,
  .el-textarea__inner:focus {
    outline: none;
    box-shadow: none !important;
  }
}
</style>
