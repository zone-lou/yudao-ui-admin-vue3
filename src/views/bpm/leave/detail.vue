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
      <tbody>
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
              <div v-for="(file, index) in fileList" :key="index" style="margin-bottom: 5px">
                <span>{{ file.name }}</span>
                <el-button link type="primary" size="small" @click="previewFile(file)" class="ml-2">
                  预览
                </el-button>
                <el-button link type="primary" size="small" @click="handleDownload(file)">
                  下载
                </el-button>
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
            <div
              v-if="isEditable('科室') || isEditable('负责人')"
              class="w-full h-full print-hide-row"
            >
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="1"
                placeholder="请输入科室(单位)负责人意见"
                class="w-full h-full"
                style="border: none"
              />
            </div>
            <div v-else>
              <div v-for="(info, index) in ensureMinRows(deptHeadList, 1)" :key="index">
                {{ info.comment }}
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td colspan="3" class="signature-row">
            <span class="sig-item"
              >办理人：<span class="sig-line">{{
                deptHeadList.length > 0
                  ? deptHeadList[deptHeadList.length - 1].assigneeUser?.nickname
                  : ''
              }}</span></span
            >
            <span class="sig-item"
              >日期：<span class="sig-line">{{
                deptHeadList.length > 0
                  ? formatDate(deptHeadList[deptHeadList.length - 1].endTime)
                  : ''
              }}</span></span
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
            <div v-if="isEditable('办公室')" class="w-full h-full print-hide-row">
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="1"
                placeholder="请输入办公室意见"
                class="w-full h-full"
              />
            </div>
            <div v-else>
              <div
                v-for="(info, index) in ensureMinRows(officeList, 1)"
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
            <span class="sig-item"
              >办理人：<span class="sig-line">{{
                officeList.length > 0
                  ? officeList[officeList.length - 1].assigneeUser?.nickname
                  : ''
              }}</span></span
            >
            <span class="sig-item"
              >日期：<span class="sig-line">{{
                officeList.length > 0 ? formatDate(officeList[officeList.length - 1].endTime) : ''
              }}</span></span
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
            <div
              v-if="isEditable('分管') || isEditable('局领导')"
              class="w-full h-full print-hide-row"
            >
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="1"
                placeholder="请输入局分管领导意见"
                class="w-full h-full"
              />
            </div>
            <div v-else>
              <div
                v-for="(info, index) in ensureMinRows(deputyLeaderList, 1)"
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
            <span class="sig-item"
              >办理人：<span class="sig-line">{{
                deputyLeaderList.length > 0
                  ? deputyLeaderList[deputyLeaderList.length - 1].assigneeUser?.nickname
                  : ''
              }}</span></span
            >
            <span class="sig-item"
              >日期：<span class="sig-line">{{
                deputyLeaderList.length > 0
                  ? formatDate(deputyLeaderList[deputyLeaderList.length - 1].endTime)
                  : ''
              }}</span></span
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
            <div
              v-if="isEditable('主要领导') || isEditable('局长')"
              class="w-full h-full print-hide-row"
            >
              <el-input
                v-model="currentOpinion"
                type="textarea"
                :rows="1"
                placeholder="请输入局主要领导意见"
                class="w-full h-full"
              />
            </div>
            <div v-else>
              <div
                v-for="(info, index) in ensureMinRows(mainLeaderList, 1)"
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
            <span class="sig-item"
              >办理人：<span class="sig-line">{{
                mainLeaderList.length > 0
                  ? mainLeaderList[mainLeaderList.length - 1].assigneeUser?.nickname
                  : ''
              }}</span></span
            >
            <span class="sig-item"
              >日期：<span class="sig-line">{{
                mainLeaderList.length > 0
                  ? formatDate(mainLeaderList[mainLeaderList.length - 1].endTime)
                  : ''
              }}</span></span
            >
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as LeaveApi from '@/api/bpm/leave'
import { useUserStore } from '@/store/modules/user'
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
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

const { query } = useRoute() // 查询参数

const props = defineProps({
  id: propTypes.oneOfType([Number, String]).def(undefined),
  processInstance: propTypes.object.def({}),
  activityNodes: propTypes.array.def([]),
  taskId: propTypes.string.def(undefined), // 当前任务ID
  currentNode: propTypes.object.def({}) // 当前节点信息
})

const detailLoading = ref(false) // 表单的加载中
const detailData = ref<any>({}) // 详情数据
const queryId = query.id as unknown as number
const currentOpinion = ref('') // 当前正在填写的办理意见

// 历史审批意见分类
const deptHeadList = ref<any[]>([]) // 科室(单位)负责人意见
const officeList = ref<any[]>([]) // 办公室意见
const deputyLeaderList = ref<any[]>([]) // 局分管领导意见
const mainLeaderList = ref<any[]>([]) // 局主要领导意见

/** 判断当前节点是否可编辑 */
const isEditable = (keyword: string) => {
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

/** 分类处理办理节点意见 */
const processActivityNodes = () => {
  if (!props.activityNodes || props.activityNodes.length === 0) return

  // 清空
  deptHeadList.value = []
  officeList.value = []
  deputyLeaderList.value = []
  mainLeaderList.value = []

  const userId = userStore.getUser.id
  props.activityNodes.forEach((node: any) => {
    // 新增：过滤掉“备案”性质的节点意见显示
    const nodeName = node.name || ''
    if (nodeName.includes('备案')) {
      return
    }

    if (node.tasks && node.tasks.length > 0) {
      node.tasks.forEach((task: any) => {
        // 状态 1 为处理中，2 为通过/结束
        if (task.status === 1) {
          if (task.assigneeUser?.id === userId && task.reason) {
            currentOpinion.value = task.reason
          }
          return
        }

        if (task.reason) {
          const name = node.name || ''
          const info = {
            name: name,
            comment: task.reason,
            assigneeUser: task.assigneeUser,
            endTime: node.endTime || task.endTime
          }

          if (name.includes('科室') || name.includes('负责人')) {
            deptHeadList.value.push(info)
          } else if (name.includes('办公室')) {
            officeList.value.push(info)
          } else if (name.includes('分管') || name.includes('局领导')) {
            deputyLeaderList.value.push(info)
          } else if (name.includes('主要领导') || name.includes('局长')) {
            mainLeaderList.value.push(info)
          } else {
            // 没有精准命中的就放入主要的里面兜底
            deptHeadList.value.push(info)
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

const DIRECT_RENDER_EXTENSIONS = [
  'pdf',
  'jpg', 'jpeg', 'png', 'gif', 'bmp', 'ico', 'webp', 'svg', 'tif', 'tiff',
  'mp4', 'webm', 'mkv', 'avi', 'flv', 'mov', 'wmv', 
  'mp3', 'wav', 'flac', 'ogg', 'aac',
  'txt', 'json', 'xml', 'md', 'java', 'js', 'css', 'html', 'sql'
]

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

  const fileName = file.name || fullUrl
  const ext = fileName.split('.').pop().toLowerCase()

  if (DIRECT_RENDER_EXTENSIONS.includes(ext)) {
    // 规定格式：走外网地址
    if (internalPrefix.value && externalPrefix.value && fullUrl.includes(internalPrefix.value)) {
      fullUrl = fullUrl.replace(internalPrefix.value, externalPrefix.value)
    }
  } else {
    // 规定格式外：交给后端去下载转换，走内网地址
    if (externalPrefix.value && internalPrefix.value && fullUrl.includes(externalPrefix.value)) {
      fullUrl = fullUrl.replace(externalPrefix.value, internalPrefix.value)
    }
  }
  const kkBaseUrl = fileViewBaseUrl.value || 'http://192.168.50.239:8012/onlinePreview?url='
  const encodedUrl = btoa(encodeURIComponent(fullUrl))

  window.open(previewUrl, '_blank')
}

/** 处理下载 */
const handleDownload = (file: any) => {
  const link = document.createElement('a')
  link.style.display = 'none'
  link.href = file.path
  link.setAttribute('download', file.name)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const externalPrefix = ref('') // 外网地址前缀
const internalPrefix = ref('') // 内网地址前缀

/** 获得数据 */
const getInfo = async () => {
  detailLoading.value = true
  try {
    fileViewBaseUrl.value = await ConfigApi.getConfigKey('url.fileview.address')
    externalPrefix.value = await ConfigApi.getConfigKey('url.external.prefix')
    internalPrefix.value = await ConfigApi.getConfigKey('url.internal.prefix')
    detailData.value = await LeaveApi.leaveApi.getleave(Number(props.id || queryId))
    // 获取数据后不必立刻掉 processActivityNodes，因为顶端已经配置了 immediate 的 watch 来响应
  } finally {
    detailLoading.value = false
  }
}

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

// 为外部开放必需的属性
defineExpose({
  open: getInfo,
  getOpinion
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
  font-size: 24px;
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
  text-align: left;
  vertical-align: top;
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

/* 强制使得表单的文本域撑满外层 td 单元格的高度 */
:deep(.h-large .el-textarea) {
  height: 100%;
}

:deep(.h-large .el-textarea__inner) {
  height: 100%;
  resize: none; /* 顺便去掉重置大小手柄以保持页面规整 */
}
</style>
