<template>
  <div class="oa-container">
    <div class="doc-title">义乌市自然资源和规划局因公外出审批单</div>

    <table class="oa-table">
      <colgroup>
        <col width="130px" />
        <col width="35%" />
        <col width="130px" />
        <col />
      </colgroup>
      <tr>
        <td class="label-cell">申请人</td>
        <td class="input-cell">{{ startUser }}</td>
        <td class="label-cell">所在科室</td>
        <td class="input-cell">{{ deptName }}</td>
      </tr>

      <tr>
        <td class="label-cell">外出类型</td>
        <td class="input-cell">{{ leaveType }}</td>
        <td class="label-cell">申请日期</td>
        <td class="input-cell">{{ applyDate }}</td>
      </tr>

      <tr>
        <td class="label-cell">开始时间 从</td>
        <td class="input-cell">{{ startTime }}</td>
        <td class="label-cell">时段</td>
        <td class="input-cell">{{ startSession }}</td>
      </tr>

      <tr>
        <td class="label-cell">结束时间 至</td>
        <td class="input-cell">{{ endTime }}</td>
        <td class="label-cell">时段</td>
        <td class="input-cell">{{ endSession }}</td>
      </tr>

      <tr>
        <td class="label-cell">外出天数</td>
        <td class="input-cell" colspan="3">{{ leaveDays }} 天</td>
      </tr>

      <tr class="print-hide-row">
        <td class="label-cell">附件列表</td>
        <td class="input-cell" colspan="3">
          <div v-if="fileList.length > 0">
            <div v-for="(file, index) in fileList" :key="index" style="margin-bottom: 2px">
              <el-link type="primary" @click="handlePreview(file)" :underline="false">
                {{ file.name }}
              </el-link>
            </div>
          </div>
          <span v-else>无</span>
        </td>
      </tr>

      <tr>
        <td class="label-cell">外出事由</td>
        <td
          colspan="3"
          class="input-cell h-reason"
          style="padding: 10px; text-align: left; vertical-align: top"
        >
          {{ reason }}
        </td>
      </tr>

      <tr>
        <td class="label-cell" rowspan="2">科室(单位)负责人意见</td>
        <td
          colspan="3"
          class="input-cell h-large"
          style="padding: 10px; text-align: left; vertical-align: top"
        >
          {{ deptHeadContent }}
        </td>
      </tr>
      <tr>
        <td colspan="3" class="signature-row">
          <span class="sig-item"
            >办理人：<span class="sig-line">{{ deptHeadHandler }}</span></span
          >
          <span class="sig-item"
            >日期：<span class="sig-line">{{ deptHeadDate }}</span></span
          >
        </td>
      </tr>

      <tr>
        <td class="label-cell" rowspan="2">办公室意见</td>
        <td
          colspan="3"
          class="input-cell h-large"
          style="padding: 10px; text-align: left; vertical-align: top"
        >
          {{ officeContent }}
        </td>
      </tr>
      <tr>
        <td colspan="3" class="signature-row">
          <span class="sig-item"
            >办理人：<span class="sig-line">{{ officeHandler }}</span></span
          >
          <span class="sig-item"
            >日期：<span class="sig-line">{{ officeDate }}</span></span
          >
        </td>
      </tr>

      <tr>
        <td class="label-cell" rowspan="2">局分管领导意见</td>
        <td
          colspan="3"
          class="input-cell h-large"
          style="padding: 10px; text-align: left; vertical-align: top"
        >
          {{ deputyLeaderContent }}
        </td>
      </tr>
      <tr>
        <td colspan="3" class="signature-row">
          <span class="sig-item"
            >办理人：<span class="sig-line">{{ deputyLeaderHandler }}</span></span
          >
          <span class="sig-item"
            >日期：<span class="sig-line">{{ deputyLeaderDate }}</span></span
          >
        </td>
      </tr>

      <tr>
        <td class="label-cell" rowspan="2">局主要领导意见</td>
        <td
          colspan="3"
          class="input-cell h-large"
          style="padding: 10px; text-align: left; vertical-align: top"
        >
          {{ mainLeaderContent }}
        </td>
      </tr>
      <tr>
        <td colspan="3" class="signature-row">
          <span class="sig-item"
            >办理人：<span class="sig-line">{{ mainLeaderHandler }}</span></span
          >
          <span class="sig-item"
            >日期：<span class="sig-line">{{ mainLeaderDate }}</span></span
          >
        </td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { dateUtil } from '@/utils/dateUtil'
import { TimeExplainApi } from '@/api/bpm/timeexplain'
import { propTypes } from '@/utils/propTypes'
import { useUserStore } from '@/store/modules/user'
import { Base64 } from 'js-base64'

defineOptions({ name: 'BpmTimeExplainDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined),
  activityNodes: propTypes.array.def([])
})

const { query } = useRoute()
const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref(userStore.user.dept?.name || '')

const detailLoading = ref(false)
const detailData = ref<any>({})
const fileList = ref<any[]>([])

// Template data fields
const startUser = computed(() => detailData.value.nickname || userStore.user.nickname)
const leaveType = computed(() => '因公外出')
const applyDate = computed(() => formatDate(detailData.value.checkDate))
const startTime = computed(() => formatDate(detailData.value.checkBegin))
const startSession = computed(() => getPeriod(detailData.value.checkBegin))
const endTime = computed(() => formatDate(detailData.value.checkEnd))
const endSession = computed(() => getPeriod(detailData.value.checkEnd))
const leaveDays = computed(() => detailData.value.days)
const reason = computed(() => detailData.value.reason)
const fileNames = computed(() => fileList.value.map((f) => f.name).join('、'))

// Historical Opinions
const deptHeadContent = ref('')
const deptHeadHandler = ref('')
const deptHeadDate = ref('')

const officeContent = ref('')
const officeHandler = ref('')
const officeDate = ref('')

const deputyLeaderContent = ref('')
const deputyLeaderHandler = ref('')
const deputyLeaderDate = ref('')

const mainLeaderContent = ref('')
const mainLeaderHandler = ref('')
const mainLeaderDate = ref('')

/** 格式化日期 (兼容时间戳) */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

/** * 新增：根据时间戳计算时段 (上午/下午)
 * 逻辑：12点之前为上午，12点及以后为下午
 */
const getPeriod = (val: any) => {
  if (!val) return ''
  const date = new Date(val)
  const hours = date.getHours()
  return hours < 12 ? '上午' : '下午'
}

/** 获取详情数据 */
const getInfo = async () => {
  const queryId = props.id || (query.id as unknown as number)
  if (!queryId) return

  detailLoading.value = true
  try {
    const res = await TimeExplainApi.getTimeExplain(queryId)
    detailData.value = res || {}
    processFileList(res.filepath)
    processActivityNodes()
  } finally {
    detailLoading.value = false
  }
}

/** 分类处理审批节点意见 */
const processActivityNodes = () => {
  if (!props.activityNodes || props.activityNodes.length === 0) return

  props.activityNodes.forEach((node: any) => {
    if (node.tasks && node.tasks.length > 0) {
      node.tasks.forEach((task: any) => {
        if (task.reason) {
          const name = node.name || ''
          const info = {
            comment: task.reason,
            assigneeUser: task.assigneeUser,
            endTime: node.endTime || task.endTime
          }
          const setOpinion = (contentRef, handlerRef, dateRef) => {
            contentRef.value = info.comment
            handlerRef.value = info.assigneeUser?.nickname
            dateRef.value = formatDate(info.endTime)
          }

          if (name.includes('科室负责人') || name.includes('单位负责人')) {
            setOpinion(deptHeadContent, deptHeadHandler, deptHeadDate)
          } else if (name.includes('办公室')) {
            setOpinion(officeContent, officeHandler, officeDate)
          } else if (name.includes('分管领导')) {
            setOpinion(deputyLeaderContent, deputyLeaderHandler, deputyLeaderDate)
          } else if (name.includes('主要领导')) {
            setOpinion(mainLeaderContent, mainLeaderHandler, mainLeaderDate)
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

/** 处理附件列表 */
const processFileList = (pathStr: string | undefined) => {
  if (!pathStr) {
    fileList.value = []
    return
  }
  const paths = Array.isArray(pathStr) ? pathStr : pathStr.split(',')

  fileList.value = paths
    .map((url) => {
      if (!url) return null
      const rawName = url.substring(url.lastIndexOf('/') + 1)
      const name = decodeURIComponent(rawName)
      return {
        name,
        url,
        size: 0
      }
    })
    .filter(Boolean)
}

/** 文件大小格式化 */
const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/** 预览文件 */
const handlePreview = (file: any) => {
  if (!file || !file.url) return

  // 1. 基础配置
  const kkBaseUrl = 'http://192.168.50.239:8012'
  let fullUrl = file.url

  if (fullUrl.startsWith('/')) {
    fullUrl = window.location.origin + fullUrl
  }

  // 2. Base64 编码
  const encodedUrl = Base64.encode(fullUrl)

  // 3. 拼接并打开
  const previewUrl = `${kkBaseUrl}/onlinePreview?url=${encodeURIComponent(encodedUrl)}`
  window.open(previewUrl, '_blank')
}

/** 下载文件 */
const handleDownload = (file: any) => {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = file.url
  link.setAttribute('download', file.name)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

defineExpose({ open: getInfo })

onMounted(() => {
  getInfo()
})
</script>

<style scoped>
.oa-container {
  width: 100%;
  max-width: 900px;
  padding: 20px;
  margin: 0 auto;
  font-family: SimSun, 'Songti SC', serif;
  background-color: #fff;
}

.doc-title {
  margin-bottom: 25px;
  font-size: 26px;
  font-weight: bold;
  letter-spacing: 1px;
  color: #b1351e;
  text-align: center;
}

.oa-table {
  width: 100%;
  font-size: 14px;
  border: 1px solid #8cb4e0;
  border-collapse: collapse;
}

.oa-table td {
  padding: 6px 10px;
  line-height: 1.4;
  color: #333;
  vertical-align: middle;
  border: 1px solid #8cb4e0;
}

.label-cell {
  font-weight: bold;
  color: #333;
  text-align: center;
  white-space: nowrap;
  background-color: #dbe9f8;
}

.input-cell {
  min-height: 24px;
  background-color: #fff;
}

.h-large {
  height: 100px;
}

.h-reason {
  height: 120px;
}

.signature-row {
  padding: 5px 20px;
  color: #555;
  text-align: right;
  background-color: #fff;
}

.sig-item {
  display: inline-block;
  margin-left: 30px;
}

.sig-line {
  display: inline-block;
  min-width: 80px;
  padding-left: 5px;
  text-align: left;
  border-bottom: none;
}

@media print {
  .print-hide-row {
    display: none !important;
  }
}
</style>
