<template>
  <div id="printDivTag" v-loading="detailLoading">
    <div class="oa-container">
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
            <td class="label-cell">标 题</td>
            <td colspan="5" class="data-text" style="font-size: 16px; font-weight: bold; text-align: center;">
              {{ detailData.subject }}
            </td>
          </tr>

          <!-- 发文字号、秘密/紧急 -->
          <tr>
            <td class="label-cell" rowspan="2">发文字号</td>
            <td class="data-text" rowspan="2" colspan="2" style="text-align: center; letter-spacing: 1px;">
               {{ detailData.sendDocNumber || '' }}<span v-if="detailData.year">〔{{ detailData.year }}〕</span><span v-if="detailData.docSequence">{{ detailData.docSequence }}号</span>
            </td>
            <td class="label-cell">秘密等级</td>
            <td class="data-text" colspan="2" style="text-align: center;">
              <dict-tag
                v-if="detailData.secretDegree"
                :type="DICT_TYPE.BPM_DEGREE_OF_SECRECY"
                :value="detailData.secretDegree"
              />
            </td>
          </tr>
          <tr>
            <td class="label-cell">紧急程度</td>
            <td class="data-text" colspan="2" style="text-align: center;">
              <dict-tag
                v-if="detailData.urgencyDegree !== undefined"
                :type="DICT_TYPE.BPM_EMERGENCY_DEGREE"
                :value="detailData.urgencyDegree"
              />
            </td>
          </tr>

          <!-- 附件区（紧接其后） -->
          <tr class="print-hide-row" v-if="fileList.length > 0">
            <td class="label-cell" style="border-top: 1px solid #d71920">附 件</td>
            <td colspan="5" class="data-text" style="border-top: 1px solid #d71920">
              <div class="flex flex-col gap-1">
                <div
                  v-for="(file, index) in fileList"
                  :key="index"
                  class="flex items-center"
                >
                  <span class="mr-3">{{ file.name }}</span>
                  <el-button link type="primary" size="small" @click="handlePreview(file)" class="mr-2">预览</el-button>
                  <el-button link type="primary" size="small" @click="handleDownload(file)">下载</el-button>
                </div>
              </div>
            </td>
          </tr>

          <!-- 拟稿区 -->
          <tr>
            <td class="label-cell">拟 稿</td>
            <td
              colspan="5"
              class="data-text"
              style="position: relative; height: 80px; padding-bottom: 35px; vertical-align: top;"
            >
              <div class="mb-2" style="padding: 5px;">
                <div style="white-space: pre-wrap">{{ detailData.sendDocDraft }}</div>
              </div>

              <div
                class="flex justify-between items-center"
                style="
                  position: absolute;
                  right: 8px;
                  bottom: 8px;
                  left: 8px;
                  font-size: 14px;
                  color: #000;
                  background-color: transparent;
                "
              >
                <span>办理人：<span class="data-text">{{ detailData.draftPerson }}</span></span>
                <span>所属部门：<span class="data-text">{{ detailData.sendDept }}</span></span>
                <span>办理日期：<span class="data-text">{{ formatDateExact(detailData.draftDate) }}</span></span>
              </div>
            </td>
          </tr>

          <!-- 审查环节预留展示位 -->
          <!-- 合法性审查 -->
          <tr style="height: 35px;">
            <td class="label-cell" rowspan="2">合法性审查</td>
            <td class="label-cell" style="text-align: center; background-color: transparent;">姓名</td>
            <td class="label-cell" style="text-align: center; background-color: transparent;" colspan="2">日期</td>
            <td class="label-cell" style="text-align: center; background-color: transparent;" colspan="2">意见</td>
          </tr>
          <tr style="height: 35px;">
            <td class="data-text"></td>
            <td class="data-text" colspan="2"></td>
            <td class="data-text" colspan="2"></td>
          </tr>
          
          <!-- 文字格式审查 -->
          <tr style="height: 35px;">
            <td class="label-cell" rowspan="2">文字格式审查</td>
            <td class="label-cell" style="text-align: center; background-color: transparent;">姓名</td>
            <td class="label-cell" style="text-align: center; background-color: transparent;" colspan="2">日期</td>
            <td class="label-cell" style="text-align: center; background-color: transparent;" colspan="2">意见</td>
          </tr>
          <tr style="height: 35px;">
            <td class="data-text"></td>
            <td class="data-text" colspan="2"></td>
            <td class="data-text" colspan="2"></td>
          </tr>

          <!-- 分管领导审阅 -->
          <tr style="height: 35px;">
            <td class="label-cell" rowspan="2">分管领导审阅</td>
            <td class="label-cell" style="text-align: center; background-color: transparent;">姓名</td>
            <td class="label-cell" style="text-align: center; background-color: transparent;" colspan="2">日期</td>
            <td class="label-cell" style="text-align: center; background-color: transparent;" colspan="2">意见</td>
          </tr>
          <tr style="height: 35px;">
            <td class="data-text"></td>
            <td class="data-text" colspan="2"></td>
            <td class="data-text" colspan="2"></td>
          </tr>

          <template v-for="(block, idx) in nodeBlocks" :key="idx">
            <tr>
              <td class="label-cell" :rowspan="(isEditable(block.keywords) ? (block.list.length + 1) : Math.max(1, block.list.length)) + 1">{{ block.title }}</td>
              <td class="label-cell min-h-cell" style="text-align: center; background-color: transparent;">姓名</td>
              <td class="label-cell min-h-cell" style="text-align: center; background-color: transparent;" colspan="2">日期</td>
              <td class="label-cell min-h-cell" style="text-align: center; background-color: transparent;" colspan="2">意见</td>
            </tr>
            <!-- 已有的办理记录 -->
            <tr v-for="(info, i) in block.list" :key="'item-' + idx + '-' + i">
              <td class="data-text min-h-cell" style="text-align: center;">{{ info.assigneeUser?.nickname }}</td>
              <td class="data-text min-h-cell" style="text-align: center;" colspan="2">{{ formatDateExact(info.endTime) }}</td>
              <td class="data-text min-h-cell" colspan="2">{{ info.comment }}</td>
            </tr>
            <!-- 当前正在处理激活的行（直接获取当前登录人回显） -->
            <tr v-if="isEditable(block.keywords)">
              <td class="data-text min-h-cell" style="text-align: center;">{{ userStore.getUser.nickname }}</td>
              <td class="data-text min-h-cell" style="text-align: center;" colspan="2">{{ formatDateExact(new Date().getTime()) }}</td>
              <td class="data-text min-h-cell" colspan="2" style="padding: 0;">
                <el-input
                  v-model="currentOpinion"
                  type="textarea"
                  :rows="2"
                  :placeholder="`请输入${block.title}意见`"
                  class="w-full h-full"
                />
              </td>
            </tr>
            <!-- 无数据且非当前处理人时做占位空行 -->
            <tr v-if="block.list.length === 0 && !isEditable(block.keywords)">
              <td class="data-text min-h-cell" style="text-align: center;"></td>
              <td class="data-text min-h-cell" style="text-align: center;" colspan="2"></td>
              <td class="data-text min-h-cell" colspan="2"></td>
            </tr>
          </template>




          <!-- 机关信息 -->
          <tr>
            <td class="label-cell">主送机关</td>
            <td colspan="5" class="data-text bg-white">{{ detailData.primarySendDept }}</td>
          </tr>
          <tr>
            <td class="label-cell">抄送机关</td>
            <td colspan="5" class="data-text bg-white">{{ detailData.copySendDept }}</td>
          </tr>

          <!-- 属性与附注 -->
          <tr>
            <td class="label-cell">公开方式</td>
            <td class="data-text" colspan="2" style="text-align: center;">
              <!-- 公开方式展示文字 -->
              <span v-if="detailData.inforelease === '1'">主动公开</span>
              <span v-else-if="detailData.inforelease === '2'">依申请公开</span>
              <span v-else-if="detailData.inforelease === '3'">不公开</span>
            </td>
            <td class="label-cell" colspan="1">不公开理由</td>
            <td class="data-text" colspan="2">{{ detailData.noreleasecause }}</td>
          </tr>

          <tr>
            <td class="label-cell">是否属于<br />规范性文件</td>
            <td class="data-text" colspan="5" style="text-align: center;">
              <span v-if="detailData.isNormativeDocument === 1">是</span>
              <span v-else-if="detailData.isNormativeDocument === 2">否</span>
            </td>
          </tr>

          <tr>
            <td class="label-cell">发文日期</td>
            <td class="data-text" colspan="2" style="text-align: center;">{{ formatDate(detailData.sendTime) }}</td>
            <td class="label-cell" colspan="1">份数</td>
            <td class="data-text" colspan="2" style="text-align: center;">
              <el-input 
                v-if="isEditable('打字')" 
                v-model.number="detailData.signPrintCount" 
                placeholder="请输入份数"
                type="number"
              />
              <span v-else>{{ detailData.signPrintCount }}</span>
            </td>
          </tr>
          
          <tr>
            <td class="label-cell">打字</td>
            <td class="data-text" colspan="2" style="text-align: center;">
              <el-input 
                v-if="isEditable('打字')" 
                v-model="detailData.typist" 
                placeholder="请输入打字员"
              />
              <span v-else>{{ detailData.typist || (typistList.length > 0 ? typistList[typistList.length - 1].assigneeUser?.nickname : '') }}</span>
            </td>
            <td class="label-cell" colspan="1">校对</td>
            <td class="data-text" colspan="2" style="text-align: center;">
              <el-input 
                v-if="isEditable('校对')" 
                v-model="detailData.proofreader" 
                placeholder="请输入校对人"
              />
              <span v-else>{{ detailData.proofreader || (proofreaderList.length > 0 ? proofreaderList[proofreaderList.length - 1].assigneeUser?.nickname : '') }}</span>
            </td>
          </tr>
        </tbody>
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
import dayjs from 'dayjs'
import * as ConfigApi from '@/api/infra/config'
import { ElMessage } from 'element-plus'

defineOptions({ name: 'BpmSendDocDetail' })

const props = defineProps({
  id: propTypes.oneOfType([Number, String]).def(undefined),
  taskId: propTypes.string.def(undefined),
  currentNode: propTypes.object.def({}),
  activityNodes: propTypes.array.def([])
})

const { query } = useRoute()
const userStore = useUserStore()
const detailLoading = ref(false)
const detailData = ref<any>({ openMethod: 1 })
const fileList = ref<any[]>([])
const currentOpinion = ref('')

const fileViewBaseUrl = ref('')
const externalPrefix = ref('')
const internalPrefix = ref('')

// 审批意见列表
const checkList = ref<any[]>([])        // 核稿
const legalList = ref<any[]>([])        // 合法性审查
const formatList = ref<any[]>([])       // 文字格式审查
const leaderReviewList = ref<any[]>([]) // 分管领导审阅
const signerList = ref<any[]>([])       // 局长签发
const typistList = ref<any[]>([])       // 打字人员
const proofreaderList = ref<any[]>([])  // 校对人员

const nodeBlocks = computed(() => [
  { title: '核稿', keywords: ['主办', '核稿'], list: checkList.value },
  { title: '合法性审查', keywords: ['法治', '合法'], list: legalList.value },
  { title: '文字格式审查', keywords: ['办公室', '格式', '文字'], list: formatList.value },
  { title: '分管领导审阅', keywords: ['分管', '审阅'], list: leaderReviewList.value }
])

const isEditable = (keywords: string | string[]) => {
  if (!props.taskId) return false
  const nodeName = props.currentNode?.name || ''
  if (Array.isArray(keywords)) {
    return keywords.some((k) => nodeName.includes(k))
  }
  return nodeName.includes(keywords)
}


const getOpinion = () => {
  // 只有在表格内有输入框的环节，才返回当前的 currentOpinion
  // 如果当前环节名称匹配 nodeBlocks 中的任何关键词，说明表内有框
  const hasInTableInput = nodeBlocks.value.some(block => isEditable(block.keywords))
  if (hasInTableInput) {
    return currentOpinion.value
  }
  // 对于打字和校对环节，默认返回“通过”，防止弹出意见输入框或提示未填写
  if (isEditable(['打字', '校对'])) {
    return '通过'
  }
  return undefined
}

/** 提取当前表单中可能被修改的额外业务数据 */
const getFormValues = () => {
  const values: any = {}
  if (isEditable('打字')) {
    values.signPrintCount = Number(detailData.value.signPrintCount)
    // 打字员默认当前人
    if (!detailData.value.typist) {
      values.typist = userStore.getUser.nickname
    }
  }
  if (isEditable('校对')) {
    values.proofreader = detailData.value.proofreader
  }
  return values
}



const processActivityNodes = () => {
  if (!props.activityNodes || props.activityNodes.length === 0) return

  checkList.value = []
  legalList.value = []
  formatList.value = []
  leaderReviewList.value = []
  signerList.value = []
  typistList.value = []
  proofreaderList.value = []

  const userId = userStore.getUser.id

  props.activityNodes.forEach((node: any) => {
    if (node.tasks && node.tasks.length > 0) {
      node.tasks.forEach((task: any) => {
        // 处理中的回显
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

          if (name.includes('主办') || name.includes('核稿')) {
            checkList.value.push(info)
          } else if (name.includes('法治') || name.includes('法制') || name.includes('合法')) {
            legalList.value.push(info)
          } else if (name.includes('办公室') || name.includes('格式') || name.includes('文字')) {
            formatList.value.push(info)
          } else if (name.includes('分管') || name.includes('副局') || name.includes('审阅')) {
            leaderReviewList.value.push(info)
          } else if (name.includes('签发') || name.includes('局长')) {
            signerList.value.push(info)
          } else if (name.includes('打字')) {
            typistList.value.push(info)
          } else if (name.includes('校对')) {
            proofreaderList.value.push(info)
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
    fileViewBaseUrl.value = await ConfigApi.getConfigKey('url.fileview.address')
    externalPrefix.value = await ConfigApi.getConfigKey('url.external.prefix')
    internalPrefix.value = await ConfigApi.getConfigKey('url.internal.prefix')
    const res = await SendDocApi.getSendDoc(queryId)
    if (!res) {
      ElMessage.error('未找到相关发文详情')
      detailLoading.value = false
      return
    }
    // 防止接口不存在导致 radio 无默认值
    if (!res.inforelease) res.inforelease = '1'
    if (res.sendDocDraft) {
      try {
        res.sendDocDraft = decodeURIComponent(escape(window.atob(res.sendDocDraft)))
      } catch (e) {}
    }
    detailData.value = res
    
    // 如果是打字或校对环节，且字段为空，则自动预填当前登录人名
    if (isEditable('打字') && !detailData.value.typist) {
      detailData.value.typist = userStore.getUser.nickname
    }
    if (isEditable('校对') && !detailData.value.proofreader) {
      detailData.value.proofreader = userStore.getUser.nickname
    }

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

const DIRECT_RENDER_EXTENSIONS = [
  'pdf', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'ico', 'webp', 'svg', 'tif', 'tiff',
  'mp4', 'webm', 'mkv', 'avi', 'flv', 'mov', 'wmv', 
  'mp3', 'wav', 'flac', 'ogg', 'aac',
  'txt', 'json', 'xml', 'md', 'java', 'js', 'css', 'html', 'sql'
]

const handlePreview = (file: any) => {
  let fullUrl = file.url || file.path;
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
  const previewUrl = `${kkBaseUrl}${encodeURIComponent(encodedUrl)}`

  window.open(previewUrl, '_blank')
}

const formatSendDocNumber = (val: any) => {
  if (!val) return ''
  const strVal = String(val)
  if (/^\d+$/.test(strVal)) {
    const dicts = getStrDictOptions(DICT_TYPE.BPM_SENDDOC_SIGN)
    const dict = dicts.find((d) => String(d.value) === strVal)
    if (dict) return `〔 2025 〕 ${dict.label} 号`
  }
  return val
}

const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY年MM月DD日')
}

const formatDateExact = (val: any) => {
  if (!val) return ''
  return dayjs(val).format('YYYY年MM月DD日 HH时mm分')
}



onMounted(() => {
  getInfo()
})

defineExpose({
  open: getInfo,
  getOpinion,
  getFormValues
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
  margin: 0 auto;
  font-family: SimSun, 'Songti SC', STSong, serif;
  background-color: #fff;
}

/* stylelint-disable-next-line selector-id-pattern */
#printDivTag .doc-title {
  margin-bottom: 20px;
  font-size: 26px;
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
  padding: 4px 6px;
  font-size: 14px;
  line-height: 1.4;
  color: #000;
  vertical-align: middle;
  border: 1px solid #d71920;
}

/* 之前为“姓名、日期、意见”加的特供最小高度，避免因为统一 padding 导致过扁 */
#printDivTag .oa-table td.min-h-cell {
  height: 40px;
}

/* stylelint-disable-next-line selector-id-pattern */
#printDivTag .label-cell {
  font-weight: bold;
  color: #d71920;
  text-align: center;
  white-space: nowrap;
  background-color: #fffbfc; /* 回归收文的浅粉红色背景，去除纯绿等色块 */
}

/* stylelint-disable-next-line selector-id-pattern */
#printDivTag .data-text {
  font-family: SimSun, 'Songti SC', STSong, serif;
  font-size: 14px !important;
  color: #000;
  word-break: break-all;
  border-bottom: none !important;
}

.signature-line {
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

:deep(.el-radio__input.is-disabled .el-radio__inner) {
  background-color: #fff;
  border-color: #c0c4cc;
}
:deep(.el-radio__input.is-disabled.is-checked .el-radio__inner::after) {
  background-color: #409eff;
}
:deep(.el-radio__input.is-disabled + .el-radio__label) {
  color: #000;
}


</style>
