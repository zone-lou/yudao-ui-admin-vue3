<template>
  <div v-loading="detailLoading">
    <el-descriptions title="基础信息" :column="2" border size="large" class="mb-20px">
      <el-descriptions-item label="公文标题" :span="2">
        {{ detailData.subject }}
      </el-descriptions-item>
      <el-descriptions-item label="发文字号">
        {{ formatSendDocNumber(detailData.sendDocNumber) }}
      </el-descriptions-item>
      <el-descriptions-item label="发文日期">
        {{ formatDate(detailData.sendTime) }}
      </el-descriptions-item>
      <el-descriptions-item label="文件类型">
        {{ formatDocType(detailData.docType) }}
      </el-descriptions-item>
      <el-descriptions-item label="紧急程度">
        <dict-tag :type="DICT_TYPE.BPM_EMERGENCY_DEGREE" :value="detailData.urgencyDegree" />
      </el-descriptions-item>
      <el-descriptions-item label="机密程度">
        {{ detailData.secretDegree }}
      </el-descriptions-item>
      <el-descriptions-item label="公文性质">
        {{ detailData.docProperty }}
      </el-descriptions-item>
      <el-descriptions-item label="拟稿人">
        {{ detailData.draftPerson }}
      </el-descriptions-item>
      <el-descriptions-item label="拟稿时间">
        {{ formatDate(detailData.draftDate) }}
      </el-descriptions-item>
      <el-descriptions-item label="联系电话">
        {{ detailData.contactPhone }}
      </el-descriptions-item>
      <el-descriptions-item label="发文单位">
        {{ detailData.sendDept }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="机关单位" :column="1" border size="large" class="mb-20px">
      <el-descriptions-item label="主送机关">
        {{ detailData.primarySendDept }}
      </el-descriptions-item>
      <el-descriptions-item label="抄送机关">
        {{ detailData.copySendDept }}
      </el-descriptions-item>
      <el-descriptions-item label="抄报机关">
        {{ detailData.reportSendDept }}
      </el-descriptions-item>
      <el-descriptions-item label="联合发文单位">
        {{ detailData.uniondepts }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="内容与附件" :column="1" border size="large" class="mb-20px">
      <el-descriptions-item label="发文草稿内容">
        {{ detailData.sendDocDraft }}
      </el-descriptions-item>
      <el-descriptions-item label="附件">
        <div v-if="fileList.length > 0">
          <el-table :data="fileList" border style="width: 100%" size="small">
            <el-table-column label="文件名" prop="name" show-overflow-tooltip />
            <el-table-column label="操作" width="100" align="center">
              <template #default="scope">
                <el-button link type="primary" @click="handleDownload(scope.row)">下载</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <span v-else>无</span>
      </el-descriptions-item>
      <el-descriptions-item label="备注">
        {{ detailData.remark }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions title="审批与办理" :column="2" border size="large" class="mb-20px">
      <el-descriptions-item label="签发人">
        {{ detailData.issuedName }}
      </el-descriptions-item>
      <el-descriptions-item label="校对人">
        {{ detailData.proofreader }}
      </el-descriptions-item>
      <el-descriptions-item label="签印份数">
        {{ detailData.signPrintCount }}
      </el-descriptions-item>
      <el-descriptions-item label="保管期限">
        {{ detailData.keepTerm }}
      </el-descriptions-item>
      <el-descriptions-item label="是否规范性文件">
        {{
          detailData.isNormativeDocument === 1
            ? '是'
            : detailData.isNormativeDocument === 2
              ? '否'
              : ''
        }}
      </el-descriptions-item>
      <el-descriptions-item label="是否重要">
        {{ formatBoolean(detailData.ifimportant) }}
      </el-descriptions-item>
      <el-descriptions-item label="发送状态">
        {{ formatSendStatus(detailData.sendStatus) }}
      </el-descriptions-item>
    </el-descriptions>
  </div>
</template>

<script setup lang="ts">
import { dateUtil } from '@/utils/dateUtil'
import { SendDocApi } from '@/api/bpm/senddoc'
import { propTypes } from '@/utils/propTypes'
import { DICT_TYPE, getStrDictOptions } from '@/utils/dict'

defineOptions({ name: 'BpmSendDocDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined)
})

const { query } = useRoute()
const detailLoading = ref(false)
const detailData = ref<any>({})
const fileList = ref<any[]>([])

/** 获取详情数据 */
const getInfo = async (id?: number) => {
  const rawId = id || props.id || query.id
  if (!rawId || rawId === 'null' || rawId === 'undefined') {
    return
  }

  const queryId = Number(rawId)
  if (isNaN(queryId)) {
    console.error('Invalid ID:', rawId)
    return
  }

  detailLoading.value = true
  try {
    const res = await SendDocApi.getSendDoc(queryId)
    detailData.value = res || {}
    processFileList(res.attachFilePath)
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    detailLoading.value = false
  }
}

/** 附件处理 */
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
      return { name, url }
    })
    .filter(Boolean)
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

const formatSendDocNumber = (val: any) => {
  if (val === undefined || val === null || val === '') return val
  const strVal = String(val)
  // 如果是数字（历史字典键值），进行匹配转换
  if (/^\d+$/.test(strVal)) {
    const dicts = getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)
    const dict = dicts.find((d) => String(d.value) === strVal)
    if (dict) {
      return dict.label
    }
  }
  return val
}

/** 格式化日期 */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

/** 格式化布尔值 (0否, 1是) */
const formatBoolean = (val: any) => {
  if (val === 1) return '是'
  if (val === 0) return '否'
  return ''
}

/** 格式化文件类型 */
const formatDocType = (val: any) => {
  if (val === 1) return '党务'
  if (val === 2) return '政务'
  return val
}

/** 格式化发送状态 */
const formatSendStatus = (val: any) => {
  const map: Record<number, string> = {
    0: '拟发',
    1: '已发',
    2: '退回'
  }
  return map[val] || val
}

defineExpose({ open: getInfo })

onMounted(() => {
  getInfo()
})
</script>

<style scoped>
:deep(.el-descriptions__label) {
  font-weight: bold;
  color: #606266;
  background-color: #f5f7fa;
}
</style>
