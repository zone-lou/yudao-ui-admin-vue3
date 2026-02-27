<template>
  <div id="printDivTag">
    <div class="oa-container">
      <div class="doc-title">义乌市自然资源和规划局收文阅办单</div>

      <div class="meta-info">
        <span
          >收文号：<span class="meta-input">{{ detailData.receiveDocNumber }}</span></span
        >
        <span
          >收文日期：<span class="meta-input">{{ formatDate(detailData.receiveTime) }}</span></span
        >
        <span>
          紧急程度：
          <span class="meta-input">
            <dict-tag :type="DICT_TYPE.BPM_EMERGENCY_DEGREE" :value="detailData.urgencyDegree" />
          </span>
        </span>
      </div>

      <table class="oa-table">
        <tr>
          <td class="label-cell">来文机关</td>
          <td class="data-text">
            <dict-tag
              :type="DICT_TYPE.BPM_AGENCY_NAME"
              :value="formatCommaData(detailData.sendDept)"
            />
          </td>
          <td class="label-cell" style="width: 90px">来文号</td>
          <td class="data-text" style="width: 20%">
            <span>{{ formatSendDocNumber(detailData.sendDocNumber) }}</span>
          </td>
        </tr>

        <tr>
          <td class="label-cell">标 题</td>
          <td colspan="3" class="data-text" style="font-weight: bold">
            {{ detailData.subject }}
          </td>
        </tr>

        <!-- 附件列表行 (始终显示，无附件显示暂无) -->
        <tr>
          <td class="label-cell">收文附件</td>
          <td colspan="3" class="data-text">
            <div v-if="fileList.length > 0">
              <div v-for="(file, index) in fileList" :key="index" style="margin-bottom: 5px">
                <span>{{ file.name }}</span>
                <el-button
                  link
                  type="primary"
                  size="small"
                  @click="handlePreview(file)"
                  class="ml-2"
                >
                  预览
                </el-button>
                <el-button link type="primary" size="small" @click="handleDownload(file)">
                  下载
                </el-button>
              </div>
            </div>
            <div v-else class="text-gray-400">无</div>
          </td>
        </tr>

        <!-- 拟办意见 -->
        <tr>
          <td class="label-cell" rowspan="2">拟办意见</td>
          <td colspan="3" class="h-80 data-text">
            <div v-if="isEditable('拟办') || isEditable('发起')" class="w-full h-full">
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="3"
                placeholder="请输入拟办意见"
                class="w-full h-full"
                style="border: none"
              />
            </div>
            <div v-else>
              <div v-for="(info, index) in ensureMinRows(nibanList, 3)" :key="index">
                {{ info.comment }}
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="signature-row">
            <div class="flex items-center">
              <span style="margin-right: 5px">办理人：</span>
              <span class="data-text" style="display: inline-block; min-width: 60px">
                {{ nibanList.length > 0 ? nibanList[0].assigneeUser?.nickname : '' }}
              </span>
              <span style="margin-left: 15px">办理日期：</span>
              <span class="data-text" style="display: inline-block; min-width: 80px">
                {{ nibanList.length > 0 ? formatDate(nibanList[0].endTime) : '' }}
              </span>
            </div>
          </td>
        </tr>

        <!-- 局长批示 -->
        <tr>
          <td class="label-cell" rowspan="2">局长批示</td>
          <td colspan="3" class="h-80 data-text">
            <div v-if="isEditable('局长') || isEditable('主要领导')" class="w-full h-full">
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="3"
                placeholder="请输入局长批示"
                class="w-full h-full"
              />
            </div>
            <div v-else>
              <div
                v-for="(info, index) in ensureMinRows(directorList, 3)"
                :key="index"
                class="mb-5px"
              >
                <div>{{ info.comment }}</div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="signature-row">
            <div class="flex items-center">
              <span style="margin-right: 5px">办理人：</span>
              <span class="data-text" style="display: inline-block; min-width: 60px">
                {{
                  directorList.length > 0
                    ? directorList[directorList.length - 1].assigneeUser?.nickname
                    : ''
                }}
              </span>
              <span style="margin-left: 15px">办理日期：</span>
              <span class="data-text" style="display: inline-block; min-width: 80px">
                {{
                  directorList.length > 0
                    ? formatDate(directorList[directorList.length - 1].endTime)
                    : ''
                }}
              </span>
            </div>
          </td>
        </tr>

        <!-- 监督监管 -->
        <tr>
          <td class="label-cell">监督监管</td>
          <td colspan="3" style="padding: 4px">
            <div class="compact-row">
              <div class="check-item">
                <span class="checkbox-mock">{{
                  detailData.zhubandate || detailData.xiebandate ? '✔' : ''
                }}</span>
                <span>进行监督监管</span>
              </div>

              <div class="check-item">
                <span>主办科室办结日期：</span>
                <span class="date-text data-text">{{ formatDate(detailData.zhubandate) }}</span>
              </div>

              <div class="check-item">
                <span>协办科室办结日期：</span>
                <span class="date-text data-text">{{ formatDate(detailData.xiebandate) }}</span>
              </div>
            </div>
          </td>
        </tr>

        <!-- 办件办理情况 -->
        <tr>
          <td class="label-cell">办件办理情况</td>
          <td colspan="3" class="h-80 data-text">
            <div
              v-for="(info, index) in ensureMinRows(otherOpinionList, 3)"
              :key="index"
              class="mb-5px"
            >
              <div>
                <span class="font-bold" v-if="info.name">【{{ info.name }}】</span>
                <span
                  v-if="(info.name || '').includes('主办')"
                  style="margin-right: 4px; font-weight: bold; color: red"
                  >*</span
                >
                <span v-if="info.assigneeUser">{{ info.assigneeUser?.nickname }}:</span>
                {{ info.comment }}
                <span class="text-xs text-gray-400 ml-2" v-if="info.endTime">{{
                  formatDate(info.endTime)
                }}</span>
              </div>
            </div>
          </td>
        </tr>
        <!-- 领导意见 -->
        <tr>
          <td class="label-cell">领导意见</td>
          <td colspan="2" class="center-text label-cell" style="background: none">意 见</td>
          <td class="center-text label-cell" style="background: none">日 期</td>
        </tr>
        <tr v-if="isEditable('领导意见')">
          <td class="center-text data-text" style="height: 35px">
            {{ userStore.getUser.nickname }}
          </td>
          <td colspan="2" class="data-text" style="padding: 4px 8px; text-align: left">
            <el-input
              v-model="currentOpinion"
              type="textarea"
              :rows="2"
              placeholder="请输入领导意见"
            />
          </td>
          <td class="center-text data-text">
            {{ formatDate(new Date()) }}
          </td>
        </tr>
        <tr
          v-for="(info, index) in ensureMinRows(leaderOpinionList, isEditable('领导意见') ? 0 : 3)"
          :key="'leader-' + index"
        >
          <td class="center-text data-text" style="height: 35px">
            {{ info.assigneeUser?.nickname || info.name || '' }}
          </td>
          <td colspan="2" class="data-text" style="padding: 4px 8px; text-align: left">
            {{ info.comment }}
          </td>
          <td class="center-text data-text">
            {{ formatDate(info.endTime) }}
          </td>
        </tr>
        <!-- 分管领导批示 -->
        <tr>
          <td class="label-cell">分管领导批示</td>
          <td colspan="2" class="center-text label-cell" style="background: none">意 见</td>
          <td class="center-text label-cell" style="background: none">日 期</td>
        </tr>
        <tr v-if="isEditable('分管领导') || isEditable('局领导')">
          <td class="center-text data-text" style="height: 35px">
            {{ userStore.getUser.nickname }}
          </td>
          <td colspan="2" class="data-text" style="padding: 4px 8px; text-align: left">
            <el-input
              v-model="currentOpinion"
              type="textarea"
              :rows="2"
              placeholder="请输入您的意见"
            />
          </td>
          <td class="center-text data-text">
            {{ formatDate(new Date()) }}
          </td>
        </tr>
        <tr
          v-for="(info, index) in ensureMinRows(
            deputyLeaderList,
            isEditable('分管领导') || isEditable('局领导') ? 0 : 3
          )"
          :key="'deputy-' + index"
        >
          <td class="center-text data-text" style="height: 35px">
            {{ info.assigneeUser?.nickname || info.name || '' }}
          </td>
          <td colspan="2" class="data-text" style="padding: 4px 8px; text-align: left">
            {{ info.comment }}
          </td>
          <td class="center-text data-text">
            {{ formatDate(info.endTime) }}
          </td>
        </tr>

        <!-- 阅办者 -->
        <tr>
          <td class="label-cell">阅办者</td>
          <td colspan="2" class="center-text label-cell" style="background: none">意 见</td>
          <td class="center-text label-cell" style="background: none">日 期</td>
        </tr>
        <tr
          v-if="
            isEditable('阅办') ||
            isEditable('科室') ||
            isEditable('办公室转发') ||
            isEditable('主办') ||
            isEditable('协办')
          "
        >
          <td class="center-text data-text" style="height: 35px">
            {{ userStore.getUser.nickname }}
          </td>
          <td colspan="2" class="data-text" style="padding: 4px 8px; text-align: left">
            <el-input
              v-model="currentOpinion"
              type="textarea"
              :rows="2"
              placeholder="请输入您的意见"
            />
          </td>
          <td class="center-text data-text">
            {{ formatDate(new Date()) }}
          </td>
        </tr>
        <tr
          v-for="(info, index) in ensureMinRows(
            readerList,
            isEditable('阅办') ||
              isEditable('科室') ||
              isEditable('办公室转发') ||
              isEditable('主办') ||
              isEditable('协办')
              ? 0
              : 3
          )"
          :key="'reader-' + index"
        >
          <td class="center-text data-text" style="height: 35px">
            <span
              v-if="(info.name || '').includes('主办')"
              style="margin-right: 4px; font-weight: bold; color: red"
              >*</span
            >
            {{ info.assigneeUser?.nickname || info.name || '' }}
          </td>
          <td colspan="2" class="data-text" style="padding: 4px 8px; text-align: left">
            {{ info.comment }}
          </td>
          <td class="center-text data-text">
            {{ formatDate(info.endTime) }}
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getIntDictOptions, getStrDictOptions, DICT_TYPE } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import * as ReceiveDocApi from '@/api/bpm/receivedoc'
import { addComment } from '@/api/bpm/task'
import { dateUtil } from '@/utils/dateUtil'
import { Base64 } from 'js-base64'
import { propTypes } from '@/utils/propTypes'
import { useUserStore } from '@/store/modules/user'

defineOptions({ name: 'BpmReceiveDocDetail' })
const userStore = useUserStore()

// 注入任务信息
const props = defineProps({
  id: propTypes.number.def(undefined),
  processInstance: propTypes.object.def({}),
  activityNodes: propTypes.array.def([]),
  taskId: propTypes.string.def(undefined), // 当前任务ID
  currentNode: propTypes.object.def({}) // 当前节点信息
})

const { query } = useRoute()
const message = useMessage()

const detailLoading = ref(false)
const detailData = ref({
  receiveDocNumber: '',
  sendDocNumber: '',
  sendDept: '',
  receiveTime: undefined,
  subject: '',
  urgencyDegree: undefined,
  docClass: undefined,
  docSecondClass: undefined,
  zhubandate: undefined,
  xiebandate: undefined,
  attachFilePath: '',
  remark: '',
  issupervise: false
})
const fileList = ref<any[]>([])
const currentOpinion = ref('') // 当前正在填写的审批意见

// 审批意见分类
const nibanList = ref<any[]>([]) // 拟办
const directorList = ref<any[]>([]) // 局长
const deputyLeaderList = ref<any[]>([]) // 分管领导
const leaderOpinionList = ref<any[]>([]) // 领导意见
const readerList = ref<any[]>([]) // 阅办者
const otherOpinionList = ref<any[]>([]) // 其他

/** 判断当前节点是否可编辑 */
const isEditable = (keyword: string) => {
  // 如果没有任务ID，说明不在审批中，只读
  if (!props.taskId) return false
  const nodeName = props.currentNode?.name || ''
  return nodeName.indexOf(keyword) !== -1
}

/** 暴露给父组件的方法：获取当前填写的意见 */
const getOpinion = () => {
  return currentOpinion.value
}

/** 确保列表至少有 minRows 行空数据 */
const ensureMinRows = (list: any[], minRows: number) => {
  const res = [...list]
  if (res.length < minRows) {
    const emptyCount = minRows - res.length
    for (let i = 0; i < emptyCount; i++) {
      res.push({ comment: '', isPlaceholder: true })
    }
  }
  return res
}

/** 获取详情 */
const getInfo = async () => {
  const queryId = props.id || query.id
  if (!queryId) {
    return
  }
  detailLoading.value = true
  try {
    const data = await ReceiveDocApi.ReceiveDocApi.getReceiveDoc(queryId)
    detailData.value = data

    // 附件处理增强
    if (data.attachFilePath) {
      try {
        const parsed = JSON.parse(data.attachFilePath)
        if (Array.isArray(parsed)) {
          fileList.value = parsed
        } else {
          fileList.value = [
            { name: data.attachFilePath.split('/').pop(), url: data.attachFilePath }
          ]
        }
      } catch (e) {
        const paths = data.attachFilePath.split(',')
        fileList.value = paths
          .filter((path: string) => path && path.trim())
          .map((path: string) => ({
            name: path.split('/').pop(),
            url: path
          }))
      }
    } else {
      fileList.value = []
    }

    // 处理审批意见
    processActivityNodes()
  } finally {
    detailLoading.value = false
  }
}

/** 分类处理审批节点意见 */
const processActivityNodes = () => {
  if (!props.activityNodes || props.activityNodes.length === 0) return

  // 清空
  nibanList.value = []
  directorList.value = []
  deputyLeaderList.value = []
  leaderOpinionList.value = []
  readerList.value = []
  otherOpinionList.value = []

  const userId = userStore.getUser.id
  props.activityNodes.forEach((node: any) => {
    // 遍历任务
    if (node.tasks && node.tasks.length > 0) {
      node.tasks.forEach((task: any) => {
        // 状态 1 为处理中，2 为通过/结束
        if (task.status === 1) {
          // 如果是当前用户的待办任务，则将草稿意见赋值给 currentOpinion
          if (task.assigneeUser?.id === userId && task.reason) {
            currentOpinion.value = task.reason
          }
          // 处理中的任务不展示在历史记录中
          return
        }

        if (task.reason) {
          // 只要有 reason 就展示
          const name = node.name || ''
          const info = {
            name: name,
            comment: task.reason,
            assigneeUser: task.assigneeUser,
            endTime: node.endTime || task.endTime // 优先使用节点的结束时间，或者任务的结束时间
          }

          if (name.includes('拟办') || name.includes('发起')) {
            nibanList.value.push(info)
          } else if (name.includes('局长') || name.includes('主要领导')) {
            directorList.value.push(info)
          } else if (name.includes('分管领导') || name.includes('局领导')) {
            deputyLeaderList.value.push(info)
          } else if (name.includes('领导意见')) {
            leaderOpinionList.value.push(info)
          } else if (
            name.includes('阅办') ||
            name.includes('科室') ||
            name.includes('办公室转发') ||
            name.includes('主办') ||
            name.includes('协办')
          ) {
            readerList.value.push(info)
          } else {
            otherOpinionList.value.push(info)
          }
        }
      })
    }
  })
}

// 监听 activityNodes 变化
watch(
  () => props.activityNodes,
  () => {
    processActivityNodes()
  },
  { immediate: true }
)

const formatSendDocNumber = (val: any) => {
  if (val === undefined || val === null || val === '') return val
  const strVal = String(val)
  if (/^\d+$/.test(strVal)) {
    const dicts = getStrDictOptions(DICT_TYPE.BPM_DOC_NUM_TYPE)
    const dict = dicts.find((d) => String(d.value) === strVal)
    if (dict) {
      const year = new Date().getFullYear()
      return `${dict.label}[${year}]号`
    }
  }
  return val
}

const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

const formatCommaData = (val: any) => {
  if (Array.isArray(val)) return val
  if (typeof val === 'string' && val.indexOf(',') !== -1) {
    const arr = val.split(',')
    if (arr.every((i) => !isNaN(Number(i)))) {
      return arr.map(Number)
    }
    return arr
  }
  if (typeof val === 'string' && !isNaN(Number(val))) {
    return Number(val)
  }
  return val
}

const handlePreview = (file: any) => {
  if (!file || !file.url) return
  const kkBaseUrl = 'http://192.168.50.239:8012'
  let fullUrl = file.url
  const encodedUrl = Base64.encode(fullUrl)
  const previewUrl = `${kkBaseUrl}/onlinePreview?url=${encodeURIComponent(encodedUrl)}`
  window.open(previewUrl, '_blank')
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

const isSubmitted = ref(false) // Whether the task has been submitted

const processInstanceSuccess = () => {
  isSubmitted.value = true
}

defineExpose({ open: getInfo, getOpinion, processInstanceSuccess })

onMounted(() => {
  getInfo()
})

// onBeforeUnmount(async () => {
//   if (currentOpinion.value && props.taskId && !isSubmitted.value) {
//     try {
//       await addComment({
//         id: props.taskId,
//         reason: currentOpinion.value
//       })
//     } catch (e) {
//       console.error('Auto save draft failed', e)
//     }
//   }
// })
</script>

<style scoped>
/* --- 放入字典中的样式 (Style in Dictionary) --- */
#printDivTag .oa-container {
  width: 100%;
  padding: 10px 20px;
  margin: 0 auto;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
}

#printDivTag .doc-title {
  margin-bottom: 15px;
  font-size: 22px;
  font-weight: bold;
  letter-spacing: 2px;
  color: #d71920;
  text-align: center;
}

#printDivTag .meta-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
  font-size: 13px;
  color: #333;
  align-items: center;
}

#printDivTag .meta-input {
  display: inline-block;
  min-width: 80px;
  padding: 0 5px;
  font-family: SimHei, sans-serif;
  font-size: 12px !important;
  color: #000;
  text-align: left;
  text-decoration: none !important;
  border-bottom: none !important;
}

#printDivTag .data-text {
  font-family: SimHei, sans-serif;
  font-size: 12px !important;
  color: #000;
  word-break: break-all;
  border-bottom: none !important;
}

#printDivTag .oa-table {
  width: 100%;
  border: 2px solid #d71920;
  border-collapse: collapse;
  table-layout: fixed;
}

#printDivTag .oa-table td {
  padding: 4px 6px;
  font-size: 13.5px;
  line-height: 1.4;
  color: #000;
  vertical-align: middle;
  border: 1px solid #d71920;
}

#printDivTag .label-cell {
  width: 110px;
  font-weight: bold;
  color: #d71920;
  text-align: center;
  white-space: nowrap;
  background-color: #fffbfc;
}

#printDivTag .compact-row {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: flex-start;
  gap: 15px;
  flex-wrap: wrap;
}

#printDivTag .check-item {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

#printDivTag .checkbox-mock {
  position: relative;
  top: -1px;
  display: inline-flex;
  width: 14px;
  height: 14px;
  margin-right: 4px;
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
  vertical-align: middle;
  border: 1px solid #000;
  align-items: center;
  justify-content: center;
}

#printDivTag .date-text {
  display: inline-block;
  min-width: 60px;
  padding: 0 2px;
  text-align: center;
  text-decoration: none !important;
  border-bottom: none !important;
}

#printDivTag .h-80 {
  height: 80px;
  vertical-align: top;
}

#printDivTag .h-40 {
  height: 40px;
}

#printDivTag .h-35 {
  height: 35px;
}

#printDivTag .center-text {
  text-align: center;
}

#printDivTag .signature-row {
  height: 30px;
  padding-top: 2px;
  font-size: 12px;
  color: #333;
  vertical-align: bottom;
}
</style>
