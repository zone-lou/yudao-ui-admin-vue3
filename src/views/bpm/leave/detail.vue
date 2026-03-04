<template>
  <div class="oa-container">
    <div class="doc-title">义乌市自然资源和规划局请假审批单</div>

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
        <td class="label-cell">请假类型</td>
        <td class="input-cell">{{ leaveType }}</td>
        <td class="label-cell">申请日期</td>
        <td class="input-cell">{{ applyDate }}</td>
      </tr>

      <tr>
        <td class="label-cell">请假开始 从</td>
        <td class="input-cell">{{ startTime }}</td>
        <td class="label-cell">时段</td>
        <td class="input-cell">{{ startSession }}</td>
      </tr>

      <tr>
        <td class="label-cell">请假结束 至</td>
        <td class="input-cell">{{ endTime }}</td>
        <td class="label-cell">时段</td>
        <td class="input-cell">{{ endSession }}</td>
      </tr>

      <tr>
        <td class="label-cell">请假天数</td>
        <td class="input-cell" colspan="3">{{ leaveDays }} 天</td>
      </tr>

      <tr class="print-hide-row">
        <td class="label-cell">附件列表</td>
        <td class="input-cell" colspan="3">
          <div v-if="fileList.length > 0">
            <div v-for="(file, index) in fileList" :key="index" style="margin-bottom: 2px">
              <el-link type="primary" @click="previewFile(file)" :underline="false">
                {{ file.name }}
              </el-link>
            </div>
          </div>
          <span v-else>无</span>
        </td>
      </tr>

      <tr>
        <td class="label-cell">请假事由</td>
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
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateUtil } from '@/utils/dateUtil'
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as LeaveApi from '@/api/bpm/leave'
import { useUserStore } from '@/store/modules/user'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Base64 } from 'js-base64'
import * as ConfigApi from '@/api/infra/config'

defineOptions({ name: 'LeaveDetail' })

const userStore = useUserStore()
const deptName = computed(() => {
  if (detailData.value.deptName) return detailData.value.deptName
  if (props.activityNodes && props.activityNodes.length > 0) {
    for (const node of props.activityNodes as any[]) {
      if (node.tasks && node.tasks.length > 0) {
        for (const task of node.tasks) {
          if (task.assigneeUser && task.assigneeUser.deptName) {
            return task.assigneeUser.deptName
          }
        }
      }
    }
  }
  return ''
})

// Template data fields
const startUser = computed(() => {
  if (detailData.value.nickname) return detailData.value.nickname
  if (detailData.value.nickName) return detailData.value.nickName
  if (props.activityNodes && props.activityNodes.length > 0) {
    for (const node of props.activityNodes as any[]) {
      if (node.tasks && node.tasks.length > 0) {
        for (const task of node.tasks) {
          if (task.assigneeUser && task.assigneeUser.nickname) {
            return task.assigneeUser.nickname
          }
        }
      }
    }
  }
  return ''
})
const leaveType = computed(() => {
  if (!detailData.value.qxjType) return ''
  const dict = getIntDictOptions(DICT_TYPE.BPM_LEAVE_TYPE).find(
    (d) => d.value === detailData.value.qxjType
  )
  return dict ? dict.label : detailData.value.qxjType
})
const applyDate = computed(() => formatDate(detailData.value.applyDate))
const startTime = computed(() => formatDate(detailData.value.qxjStartDate))
const startSession = computed(() => getPeriod(detailData.value.qxjStartDate))
const endTime = computed(() => formatDate(detailData.value.qxjEndDate))
const endSession = computed(() => getPeriod(detailData.value.qxjEndDate))
const leaveDays = computed(() => detailData.value.totalTs)
const reason = computed(() => detailData.value.sjReason)
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

const { query } = useRoute() // 查询参数

const props = defineProps({
  id: propTypes.number.def(undefined),
  activityNodes: propTypes.array.def([])
})

const detailLoading = ref(false) // 表单的加载中
const detailData = ref<any>({}) // 详情数据
const queryId = query.id as unknown as number

// 动态获取的文件服务基地址
const fileViewBaseUrl = ref('')

// 处理文件列表
const fileList = computed(() => {
  const path = detailData.value.filepath
  if (!path) return []

  // 处理字符串格式（逗号分隔）
  if (typeof path === 'string') {
    return path.split(',').filter(Boolean).map(processFilePath)
  }

  // 处理数组格式（兼容旧数据）
  if (Array.isArray(path)) {
    return path.map(processFilePath)
  }

  return []
})

// 处理文件路径，提取文件名、大小等信息
const processFilePath = (filePath: string) => {
  // 从文件路径中提取文件名
  const parts = filePath.split('/')
  const fileName = parts[parts.length - 1] || '附件'

  return {
    name: decodeURIComponent(fileName),
    path: filePath
  }
}

// 预览文件已被 handlePreview 接管
// 获取文件完整URL (原逻辑已废弃)

//预览文件
const previewFile = (file: any) => {
  if (!file || !file.path) {
    ElMessage.error('无效的文件')
    return
  }

  let fullUrl = file.path.trim()
  if (!fullUrl) {
    ElMessage.error('文件路径为空，无法预览')
    return
  }

  if (fullUrl.startsWith('/')) {
    fullUrl = window.location.origin + fullUrl
  }

  const kkBaseUrl = fileViewBaseUrl.value || 'http://192.168.50.239:8012/onlinePreview?url='
  const encodedUrl = Base64.encode(fullUrl)
  const previewUrl = `${kkBaseUrl}${encodeURIComponent(encodedUrl)}`

  window.open(previewUrl, '_blank')
}

// 文件类型标识已被清理

/** 获得数据 */
const getInfo = async () => {
  detailLoading.value = true
  try {
    fileViewBaseUrl.value = await ConfigApi.getConfigKey('url.fileview.address')
    detailData.value = await LeaveApi.leaveApi.getleave(props.id || queryId)
    console.log(detailData)
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
defineExpose({ open: getInfo })

// 新增：根据时间戳判断上午/下午
const getPeriod = (val: any) => {
  if (!val) return ''
  const date = new Date(val)
  const hours = date.getHours()
  return hours < 12 ? '上午' : '下午'
}

/** 初始化 **/
onMounted(() => {
  getInfo()
})
</script>
<style scoped>
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@media print {
  .print-hide-row {
    display: none !important;
  }
}

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

  /* 下面这行改为 none，去除下划线 */
  border-bottom: none;
}

/* 隐藏已废弃的预览专用 CSS */
</style>
