<template>
  <div id="printDivTag" v-loading="detailLoading">
    <div class="oa-container">
      <div class="doc-title">义乌市自然资源和规划局发文拟稿单</div>

      <table class="oa-table">
        <tr>
          <td class="label-cell">标 题</td>
          <td colspan="3" class="data-text" style="font-size: 16px; font-weight: bold">
            {{ detailData.subject }}
          </td>
        </tr>

        <tr>
          <td class="label-cell">发文字号</td>
          <td class="data-text">
            {{ formatSendDocNumber(detailData.sendDocNumber) }}
          </td>
          <td class="label-cell" style="width: 100px">秘密等级</td>
          <td class="data-text" style="width: 25%">
            {{ detailData.secretDegree }}
          </td>
        </tr>

        <tr>
          <td class="label-cell">紧急程度</td>
          <td colspan="3" class="data-text">
            <dict-tag :type="DICT_TYPE.BPM_EMERGENCY_DEGREE" :value="detailData.urgencyDegree" />
          </td>
        </tr>

        <tr>
          <td class="label-cell">拟 稿</td>
          <td
            colspan="3"
            class="data-text"
            style="position: relative; height: 150px; padding-bottom: 30px"
          >
            <div class="mb-2">
              <span class="font-bold">【发文内容】：</span>
              <div style="white-space: pre-wrap">{{ detailData.sendDocDraft }}</div>
            </div>

            <div
              class="flex justify-between items-center"
              style="
                position: absolute;
                right: 8px;
                bottom: 5px;
                left: 8px;
                font-size: 12px;
                color: #333;
              "
            >
              <span
                >办理人：<span class="data-text">{{ detailData.draftPerson }}</span></span
              >
              <span
                >所属部门：<span class="data-text">{{ detailData.sendDept }}</span></span
              >
              <span
                >办理日期：<span class="data-text">{{
                  formatDate(detailData.draftDate)
                }}</span></span
              >
            </div>
          </td>
        </tr>

        <tr class="print-hide-row">
          <td class="label-cell" style="border-top: 1px solid #d71920">附 件</td>
          <td colspan="3" class="data-text" style="border-top: 1px solid #d71920">
            <div v-if="fileList.length > 0">
              <div
                v-for="(file, index) in fileList"
                :key="index"
                class="flex items-center gap-2 mb-1"
              >
                <span>{{ file.name }}</span>
                <el-button link type="primary" size="small" @click="handleDownload(file)"
                  >下载</el-button
                >
              </div>
            </div>
            <div v-else class="text-gray-400">无</div>
          </td>
        </tr>

        <tr v-if="hasNode('主办') || checkList.length > 0">
          <td class="label-cell">主办单位审核</td>
          <td colspan="3" class="data-text p-0">
            <div v-if="isEditable('主办')" class="p-2">
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="2"
                placeholder="请输入主办单位审核意见"
              />
            </div>
            <div v-for="(info, index) in checkList" :key="index" class="approval-item">
              <div class="flex justify-between items-center w-full">
                <div class="flex-1">{{ info.comment }}</div>
                <div class="text-right whitespace-nowrap ml-4">
                  <span class="mr-2">{{ info.assigneeUser?.nickname }}</span>
                  <span>{{ formatDate(info.endTime) }}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>

        <tr v-if="hasNode('法制') || legalList.length > 0">
          <td class="label-cell">法制机构审核</td>
          <td colspan="3" class="data-text p-0">
            <div v-if="isEditable('法制')" class="p-2">
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="2"
                placeholder="请输入法制机构审核意见"
              />
            </div>
            <div v-for="(info, index) in legalList" :key="index" class="approval-item">
              <div class="flex justify-between items-center w-full">
                <div class="flex-1">{{ info.comment }}</div>
                <div class="text-right whitespace-nowrap ml-4">
                  <span class="mr-2">{{ info.assigneeUser?.nickname }}</span>
                  <span>{{ formatDate(info.endTime) }}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>

        <tr v-if="hasNode('办公室') || formatList.length > 0">
          <td class="label-cell">办公室意见</td>
          <td colspan="3" class="data-text p-0">
            <div v-if="isEditable('办公室')" class="p-2">
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="2"
                placeholder="请输入办公室意见"
              />
            </div>
            <div v-for="(info, index) in formatList" :key="index" class="approval-item">
              <div class="flex justify-between items-center w-full">
                <div class="flex-1">{{ info.comment }}</div>
                <div class="text-right whitespace-nowrap ml-4">
                  <span class="mr-2">{{ info.assigneeUser?.nickname }}</span>
                  <span>{{ formatDate(info.endTime) }}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>

        <tr v-if="hasNode('分管') || leaderReviewList.length > 0">
          <td class="label-cell">分管领导审阅</td>
          <td colspan="3" class="data-text p-0">
            <div v-if="isEditable('分管')" class="p-2">
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="2"
                placeholder="请输入审阅意见"
              />
            </div>
            <div v-for="(info, index) in leaderReviewList" :key="index" class="approval-item">
              <div class="flex justify-between items-center w-full">
                <div class="flex-1">{{ info.comment }}</div>
                <div class="text-right whitespace-nowrap ml-4">
                  <span class="mr-2">{{ info.assigneeUser?.nickname }}</span>
                  <span>{{ formatDate(info.endTime) }}</span>
                </div>
              </div>
            </div>
          </td>
        </tr>

        <tr>
          <td class="label-cell">局长签发</td>
          <td
            colspan="3"
            class="data-text"
            style="position: relative; height: 120px; padding-bottom: 30px"
          >
            <div class="w-full h-full">
              <div v-if="isEditable('局长') || isEditable('签发')">
                <el-input
                  v-model="currentOpinion"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入签发意见"
                  class="no-border-input"
                />
              </div>
              <div v-else>
                <div
                  v-for="(info, index) in ensureMinRows(signerList, 1)"
                  :key="index"
                  class="mb-1"
                >
                  {{ info.comment }}
                </div>
              </div>
            </div>

            <div
              class="flex items-center justify-end"
              style="position: absolute; right: 8px; bottom: 5px"
            >
              <span style="margin-right: 5px">签发人：</span>
              <span
                class="data-text"
                style="
                  display: inline-block;
                  min-width: 60px;
                  text-align: center;
                  border-bottom: 1px solid #333;
                "
              >
                {{
                  signerList.length > 0
                    ? signerList[signerList.length - 1].assigneeUser?.nickname
                    : detailData.issuedName
                }}
              </span>
              <span style="margin-left: 15px">日期：</span>
              <span
                class="data-text"
                style="
                  display: inline-block;
                  min-width: 80px;
                  text-align: center;
                  border-bottom: 1px solid #333;
                "
              >
                {{
                  signerList.length > 0 ? formatDate(signerList[signerList.length - 1].endTime) : ''
                }}
              </span>
            </div>
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dateUtil } from '@/utils/dateUtil'
import { SendDocApi } from '@/api/bpm/senddoc'
import { propTypes } from '@/utils/propTypes'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'BpmSendDocDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined),
  taskId: propTypes.string.def(undefined),
  currentNode: propTypes.object.def({}),
  activityNodes: propTypes.array.def([])
})

const { query } = useRoute()
const userStore = useUserStore()
const detailLoading = ref(false)
const detailData = ref<any>({})
const fileList = ref<any[]>([])
const currentOpinion = ref('')

// 审批意见列表（变量名保持不变，但业务含义已更新）
const checkList = ref<any[]>([]) // 对应：主办单位审核
const legalList = ref<any[]>([]) // 对应：法制机构审核
const formatList = ref<any[]>([]) // 对应：办公室意见
const leaderReviewList = ref<any[]>([]) // 对应：分管领导审阅
const signerList = ref<any[]>([]) // 对应：局长签发

// 这里为了显示所有行，暂时返回 true，您也可以根据 checkList.length > 0 控制
const hasNode = (keyword: string) => true

const isEditable = (keyword: string) => {
  if (!props.taskId) return false
  const nodeName = props.currentNode?.name || ''
  return nodeName.indexOf(keyword) !== -1
}

const getOpinion = () => currentOpinion.value

const ensureMinRows = (list: any[], minRows: number) => {
  const res = [...list]
  if (res.length < minRows) {
    // 仅用于占位
  }
  return res
}

/** 核心修改：匹配流程节点名称到对应的显示区域 */
const processActivityNodes = () => {
  if (!props.activityNodes || props.activityNodes.length === 0) return

  checkList.value = []
  legalList.value = []
  formatList.value = []
  leaderReviewList.value = []
  signerList.value = []

  const userId = userStore.getUser.id

  props.activityNodes.forEach((node: any) => {
    if (node.tasks && node.tasks.length > 0) {
      node.tasks.forEach((task: any) => {
        // 处理中的任务，回显草稿
        if (task.status === 1) {
          if (task.assigneeUser?.id === userId && task.reason) {
            currentOpinion.value = task.reason
          }
          return
        }

        // 已办结的任务，进行归档展示
        if (task.reason) {
          const name = node.name || ''
          const info = {
            name: name,
            comment: task.reason,
            assigneeUser: task.assigneeUser,
            endTime: node.endTime || task.endTime
          }

          // 1. 主办单位审核 (兼容 '核稿' 旧数据)
          if (name.includes('主办') || name.includes('核稿')) {
            checkList.value.push(info)
          }
          // 2. 法制机构审核 (兼容 '合法' 或 '法制')
          else if (name.includes('法制') || name.includes('合法')) {
            legalList.value.push(info)
          }
          // 3. 办公室意见 (兼容 '办公室' 或 '格式')
          else if (name.includes('办公室') || name.includes('格式') || name.includes('文字')) {
            formatList.value.push(info)
          }
          // 4. 分管领导审阅
          else if (name.includes('分管') || name.includes('审阅')) {
            leaderReviewList.value.push(info)
          }
          // 5. 局长签发 (兼容 '局长' 或 '签发')
          else if (name.includes('局长') || name.includes('签发')) {
            signerList.value.push(info)
          }
        }
      })
    }
  })
}

const getInfo = async (id?: number) => {
  const rawId = id || props.id || query.id
  if (!rawId) return
  const queryId = Number(rawId)
  if (isNaN(queryId)) return

  detailLoading.value = true
  try {
    const res = await SendDocApi.getSendDoc(queryId)
    detailData.value = res || {}
    processFileList(res.attachFilePath)
    processActivityNodes()
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    detailLoading.value = false
  }
}

watch(
  () => props.activityNodes,
  () => processActivityNodes(),
  { immediate: true }
)

const processFileList = (pathStr: string | undefined) => {
  if (!pathStr) {
    fileList.value = []
    return
  }
  try {
    const parsed = JSON.parse(pathStr)
    if (Array.isArray(parsed)) {
      fileList.value = parsed
      return
    }
  } catch (e) {}

  const paths = Array.isArray(pathStr) ? pathStr : pathStr.split(',')
  fileList.value = paths
    .map((url) => {
      if (!url) return null
      const rawName = url.substring(url.lastIndexOf('/') + 1)
      const name = decodeURIComponent(rawName)
      return { name, url }
    })
    .filter(Boolean)
}

const handleDownload = (file: any) => {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = file.url
  link.setAttribute('download', file.name)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const formatSendDocNumber = (val: any) => {
  if (!val) return val
  const strVal = String(val)
  if (/^\d+$/.test(strVal)) {
    const dicts = getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)
    const dict = dicts.find((d) => String(d.value) === strVal)
    if (dict) return dict.label + '〔2025〕号'
  }
  return val
}

const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

defineExpose({ open: getInfo, getOpinion })

onMounted(() => {
  getInfo()
})
</script>

<style scoped>
@media print {
  .print-hide-row {
    display: none !important;
  }
}

/* stylelint-disable-next-line selector-id-pattern */
#printDivTag .oa-container {
  width: 100%;
  padding: 10px 20px;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
}

/* stylelint-disable-next-line selector-id-pattern */
#printDivTag .doc-title {
  font-size: 24px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #d71920;
  text-align: center;
}

/* stylelint-disable-next-line selector-id-pattern */
#printDivTag .oa-table {
  width: 100%;
  border: 2px solid #d71920;
  border-collapse: collapse;
  table-layout: fixed;
}

/* stylelint-disable-next-line selector-id-pattern */
#printDivTag .oa-table td {
  padding: 6px 8px;
  font-size: 14px;
  color: #000;
  vertical-align: middle;
  border: 1px solid #d71920;
}

/* stylelint-disable-next-line selector-id-pattern */
#printDivTag .label-cell {
  width: 120px;
  font-weight: bold;
  color: #d71920;
  text-align: center;
  background-color: #fffbfc;
}

/* stylelint-disable-next-line selector-id-pattern */
#printDivTag .data-text {
  font-family: SimSun, 'Songti SC', STSong, serif;
  color: #000;
}

.approval-item {
  padding: 4px 0;
  border-bottom: 1px dashed #e8e8e8;
}

.approval-item:last-child {
  border-bottom: none;
}

:deep(.el-textarea__inner) {
  padding: 0;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: transparent;
  border: none;
  box-shadow: none;
  resize: none;
}

/* 保持原有样式不变 */
</style>
