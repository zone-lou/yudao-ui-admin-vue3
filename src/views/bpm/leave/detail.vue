<template>
  <el-descriptions :column="2" border style="margin-right: 20px" size="large">
    <el-descriptions-item label="申请人" label-align="center" align="center" width="150px">
      {{ nickname }}
    </el-descriptions-item>
    <el-descriptions-item label="所在科室" label-align="center" align="center" width="150px">
      {{ detailData.deptName }}
    </el-descriptions-item>
    <el-descriptions-item label="请假类型" label-align="center" align="center" width="150px">
      <dict-tag :type="DICT_TYPE.BPM_LEAVE_TYPE" :value="detailData.qxjType" />
    </el-descriptions-item>
    <el-descriptions-item label="申请日期" label-align="center" align="center" width="150px">
      {{ formatDate(detailData.applyDate) }}
    </el-descriptions-item>
    <el-descriptions-item label="请假开始从" label-align="center" align="center" width="150px">
      {{ formatDate(detailData.qxjStartDate) }}
    </el-descriptions-item>
    <el-descriptions-item label="时段" label-align="center" align="center" width="150px">
      {{ getPeriod(detailData.qxjStartDate) }}
    </el-descriptions-item>

    <el-descriptions-item label="请假结束至" label-align="center" align="center" width="150px">
      {{ formatDate(detailData.qxjEndDate) }}
    </el-descriptions-item>

    <el-descriptions-item label="时段" label-align="center" align="center" width="150px">
      {{ getPeriod(detailData.qxjEndDate) }}
    </el-descriptions-item>
    <el-descriptions-item label="请假天数" label-align="center" align="center" width="150px">
      {{ detailData.totalTs }}
    </el-descriptions-item>
    <el-descriptions-item
      label="请假事由"
      label-align="center"
      align="center"
      width="150px"
      :span="2"
    >
      {{ detailData.sjReason }}
    </el-descriptions-item>
  </el-descriptions>

  <!--独立的文件列表区域 -->
  <div v-if="fileList.length > 0" class="file-section">
    <h3 class="file-section-title">
      <el-icon name="Document" />
      附件列表
    </h3>

    <el-table :data="fileList" border style="width: 100%">
      <el-table-column prop="name" label="文件名称" width="700" show-overflow-tooltip>
        <template #default="{ row }">
          <el-link type="primary" @click="previewFile(row.path)" :underline="false">
            {{ row.name }}
          </el-link>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="文件大小" width="120">
        <template #default="{ row }">
          {{ formatFileSize(row.size) }}
        </template>
      </el-table-column>
      <el-table-column prop="type" label="文件类型" width="120">
        <template #default="{ row }">
          <el-tag :type="getFileTagType(row.type)">
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-link type="primary" @click="downloadFile(row.path)" :underline="false">
            下载
          </el-link>
        </template>
      </el-table-column>
    </el-table>
  </div>

  <!-- 文件预览对话框 -->
  <el-dialog
    v-model="previewDialogVisible"
    :title="previewFileName"
    width="80%"
    top="5vh"
    destroy-on-close
  >
    <div class="preview-container">
      <iframe
        v-if="previewDialogVisible && previewUrl"
        :src="previewUrl"
        class="preview-iframe"
        frameborder="0"
      ></iframe>
      <div v-else class="preview-loading">
        <el-icon name="Loading" class="is-loading" />
        <span>正在加载文件预览...</span>
      </div>
    </div>
  </el-dialog>
</template>
<script setup lang="ts">
import { DICT_TYPE } from '@/utils/dict'
import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as LeaveApi from '@/api/bpm/leave'
import { useUserStore } from '@/store/modules/user'
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'LeaveDetail' })
const userStore = useUserStore()
const nickname = computed(() => userStore.user.nickname)
const deptName = ref('')

const { query } = useRoute() // 查询参数

const props = defineProps({
  id: propTypes.number.def(undefined)
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
  } finally {
    detailLoading.value = false
  }
}
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
  const res = userStore.user.dept
    ? userStore.user.dept.name
    : userStore.user.depts?.map((d: any) => d.name).join('、') || ''
  deptName.value = res
})
</script>
<style scoped lang="scss">
@keyframes rotating {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

.file-section {
  padding: 15px;
  margin-top: 20px;
  border-radius: 4px;

  .file-section-title {
    display: flex;
    margin-bottom: 15px;
    font-size: 16px;
    font-weight: bold;
    color: white;
    align-items: center;
  }
}

.preview-container {
  height: 600px;
  overflow: hidden;
  border: 1px solid #ebeef5;
  border-radius: 4px;

  .preview-iframe {
    width: 100%;
    height: 100%;
  }

  .preview-loading {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    color: #606266;

    .el-icon {
      margin-bottom: 10px;
      font-size: 24px;
      animation: rotating 2s linear infinite;
    }
  }
}
// 添加PDF预览的特殊样式
:deep(.preview-iframe) {
  // 确保PDF能正确显示
  &::after {
    position: absolute;
    inset: 0;
    display: block;
    background: var(--el-bg-color) no-repeat center/contain;
    content: '';
  }
}
</style>
