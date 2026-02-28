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

  <!-- 文件预览对话框 -->
  <el-dialog
    v-model="previewDialogVisible"
    :title="previewFileName"
    width="80%"
    top="5vh"
    destroy-on-close
    append-to-body
  >
    <div class="preview-container">
      <iframe
        v-if="previewDialogVisible && previewUrl"
        :src="previewUrl"
        class="preview-iframe"
        frameborder="0"
      ></iframe>
      <div v-else class="preview-loading">
        <el-icon class="is-loading"><Loading /></el-icon>
        <span>正在加载文件预览...</span>
      </div>
    </div>
  </el-dialog>
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

defineOptions({ name: 'LeaveDetail' })
const userStore = useUserStore()
const deptName = ref('')

// Template data fields
const startUser = computed(() => detailData.value.nickname || userStore.user.nickname)
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

// 文件预览相关
const previewDialogVisible = ref(false)
const previewUrl = ref('')
const previewFileName = ref('')

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

  // 提取文件扩展名
  const ext = fileName.split('.').pop()?.toLowerCase() || ''

  // 根据扩展名判断文件类型
  let fileType = '未知'
  let size = 0

  // 这里应该从后端获取实际文件大小，但当前API可能没有提供
  // 作为示例，我们假设所有文件都是1MB
  size = 1024 * 1024 // 1MB

  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
    fileType = '图片'
  } else if (ext === 'pdf') {
    fileType = 'PDF'
  } else if (['doc', 'docx'].includes(ext)) {
    fileType = 'Word'
  } else if (['xls', 'xlsx'].includes(ext)) {
    fileType = 'Excel'
  } else if (['ppt', 'pptx'].includes(ext)) {
    fileType = 'PPT'
  } else if (ext === 'txt') {
    fileType = '文本'
  }

  return {
    name: fileName,
    path: filePath,
    type: fileType,
    size: size
  }
}

//获取文件完整URL
const getFileUrl = (filePath: string) => {
  if (!filePath) return ''

  const cleanPath = filePath.trim()
  if (!cleanPath) return ''

  // 如果已经是完整URL，直接返回
  if (cleanPath.startsWith('http')) {
    return cleanPath
  }

  // 清理路径中的特殊字符
  const safePath = encodeURIComponent(cleanPath)

  // 否则拼接基础路径
  return `/api/infra/file/get/${safePath}?preview=true`
}

//预览文件
const previewFile = (file: any) => {
  // 检查文件对象是否有效
  if (!file) {
    ElMessage.error('文件对象不存在')
    return
  }

  // 检查文件路径是否存在且为字符串
  if (!file.path || typeof file.path !== 'string') {
    console.warn('文件路径无效:', file)
    ElMessage.error('文件路径无效，无法预览')
    return
  }

  const filePath = file.path.trim()
  if (!filePath) {
    ElMessage.error('文件路径为空，无法预览')
    return
  }

  // 安全提取文件名
  let fileName = '未知文件'
  try {
    const parts = filePath.split('/')
    fileName = parts[parts.length - 1] || '附件'
  } catch (e) {
    console.error('文件名解析错误:', e, '路径:', filePath)
    fileName = '附件'
  }

  const ext = fileName.split('.').pop()?.toLowerCase() || ''

  // 特殊处理PDF文件
  if (ext === 'pdf') {
    previewFileName.value = fileName
    previewUrl.value = getFileUrl(filePath)
    previewDialogVisible.value = true
    return
  }

  // 处理图片文件
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp'].includes(ext)) {
    previewFileName.value = fileName
    previewUrl.value = getFileUrl(filePath)
    previewDialogVisible.value = true
    return
  }

  // 对于其他文件类型，尝试使用Google Docs Viewer
  const supportedByGoogleDocs = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt']
  if (supportedByGoogleDocs.includes(ext)) {
    const fileUrl = encodeURIComponent(getFileUrl(filePath))
    previewFileName.value = fileName
    previewUrl.value = `https://docs.google.com/gview?url=${fileUrl}&embedded=true`
    previewDialogVisible.value = true
    return
  }

  // 不支持预览的文件类型
  ElMessage.warning(`该文件类型(${ext.toUpperCase()})不支持在线预览，请下载后查看`)
}

//下载文件
const downloadFile = (filePath: string) => {
  const url = getFileUrl(filePath)
  const link = document.createElement('a')
  link.href = url
  link.download = filePath.split('/').pop() || 'file'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

//格式化文件大小
const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

//获取文件标签类型
const getFileTagType = (fileType: string) => {
  switch (fileType) {
    case 'PDF':
      return 'danger'
    case 'Word':
    case 'Excel':
    case 'PPT':
      return 'primary'
    case '图片':
      return 'success'
    case '文本':
      return 'info'
    default:
      return ''
  }
}

/** 获得数据 */
const getInfo = async () => {
  detailLoading.value = true
  try {
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
defineExpose({ open: getInfo }) // 提供 open 方法，用于打开弹窗

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

  // 获取部门名称
  const res = (userStore.user as any).dept
    ? (userStore.user as any).dept.name
    : (userStore.user as any).depts?.map((d: any) => d.name).join('、') || ''
  deptName.value = res
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

.preview-container {
  display: flex;
  height: 600px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  flex-direction: column;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  flex: 1;
}

.preview-loading {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #606266;
}

.preview-loading .el-icon {
  margin-bottom: 10px;
  font-size: 24px;
  animation: rotating 2s linear infinite;
}

/* PDF preview fix */
:deep(.preview-iframe)::after {
  position: absolute;
  inset: 0;
  display: block;
  background: var(--el-bg-color) no-repeat center/contain;
  content: '';
}
</style>
