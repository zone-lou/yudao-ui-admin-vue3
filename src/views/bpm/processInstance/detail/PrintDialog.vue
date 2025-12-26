<script setup lang="ts">
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { getDictDataPage } from '@/api/system/dict/dict.data'
import { useUserStore } from '@/store/modules/user'
import { formatDate } from '@/utils/formatTime'
import { dateUtil } from '@/utils/dateUtil'
import { DICT_TYPE, getDictLabel } from '@/utils/dict'
import { decodeFields } from '@/utils/formCreate'

const userStore = useUserStore()

const visible = ref(false)
const loading = ref(false)

const printData = ref()
const userName = computed(() => userStore.user.nickname ?? '')
const printTime = ref(formatDate(new Date(), 'YYYY-MM-DD HH:mm'))
const formFields = ref()
const printDataMap = ref({})

const isCustomTemplate = ref(false)
const customTemplateHtml = ref('')

/** 通用模板渲染器 */
const renderTemplate = (templateStr: string, data: any) => {
  if (!templateStr) return ''
  return templateStr.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
    const val = data[key]
    return val !== undefined && val !== null ? val : ''
  })
}

/** 统一日期格式，带上时间 */
const formatD = (val: any) => (val ? dateUtil(val).format('YYYY-MM-DD HH:mm') : '')

/** 构建动态表格区域 */
const buildDynamicSectionHtml = (title: string, tasks: any[], minRows = 3) => {
  const rowCount = Math.max(tasks.length, minRows)
  let html = ''

  // 表头
  html += `
    <tr>
        <td class="label-cell">${title}</td>
        <td colspan="2" class="center-text label-cell" style="background: none;">意 见</td>
        <td class="center-text label-cell" style="background: none;">日 期</td>
    </tr>
  `

  // 数据行
  for (let i = 0; i < rowCount; i++) {
    const task = tasks[i]

    const name = task?.approveName || ''
    const content = task?.content || ''
    const date = task?.approveDate ? formatD(task.approveDate) : ''

    html += `
      <tr>
          <td class="center-text data-text" style="height: 35px;">${name}</td>
          <td colspan="2" class="data-text" style="text-align: left; padding: 4px 8px;">${content}</td>
          <td class="center-text data-text">${date}</td>
      </tr>
    `
  }

  return html
}

/** 准备打印数据 */
const preparePrintData = (rawData: any) => {
  console.log('【打印调试】原始业务数据 (rawData):', rawData)
  const data = { ...rawData }

  // ==================== 【通用】 基础字段 ====================
  data.createTime = formatD(rawData.createTime)
  data.applyDate = rawData.createTime ? dateUtil(rawData.createTime).format('YYYY-MM-DD') : ''
  data.startUser = printData.value.processInstance?.startUser?.nickname || ''
  data.deptName = rawData.deptName || printData.value.processInstance?.startUser?.deptName || ''
  data.printUser = userName.value
  data.printDate = formatD(new Date())

  // ==================== 【收文流程】 专属逻辑 ====================
  // 1. 时间格式化
  if (rawData.receiveTime) data.receiveTime = formatD(rawData.receiveTime)
  if (rawData.zhubandate) data.zhubandate = formatD(rawData.zhubandate)
  if (rawData.xiebandate) data.xiebandate = formatD(rawData.xiebandate)

  // 2. 字典回显
  if (rawData.urgencyDegree) {
    data.urgencyDegree = getDictLabel(DICT_TYPE.BPM_EMERGENCY_DEGREE, rawData.urgencyDegree)
  }
  if (rawData.sendDocNumber) {
    data.sendDocNumber = getDictLabel(DICT_TYPE.BPM_DOC_NUM_TYPE, rawData.sendDocNumber)
  }
  // 3. 来文单位 (多选处理)
  if (rawData.sendDept) {
    try {
      const arr =
        typeof rawData.sendDept === 'string'
          ? rawData.sendDept.split(',')
          : Array.isArray(rawData.sendDept)
            ? rawData.sendDept
            : [rawData.sendDept]
      data.sendDept = arr
        .map((v: any) => getDictLabel(DICT_TYPE.BPM_RECEICE_DOC_UNIT, v))
        .filter(Boolean)
        .join('、')
    } catch (err) {
      data.sendDept = rawData.sendDept
    }
  }

  // 4. 监督监管标记
  data.supervisionMark = rawData.zhubandate || rawData.xiebandate ? '✔' : ''

  // ==================== 【请假流程】 专属逻辑 ====================
  // 1. 请假类型
  if (rawData.qxjType) {
    data.leaveType = getDictLabel(DICT_TYPE.BPM_LEAVE_TYPE, rawData.qxjType)
  }

  // 2. 时间与时段 (将时间戳格式化)
  if (rawData.qxjStartDate) {
    data.startTime = dateUtil(rawData.qxjStartDate).format('YYYY-MM-DD')
  }
  data.startSession = rawData.startPeriod === 1 ? '上午' : '下午'

  if (rawData.qxjEndDate) {
    data.endTime = dateUtil(rawData.qxjEndDate).format('YYYY-MM-DD')
  }
  data.endSession = rawData.endPeriod === 1 ? '上午' : '下午'

  // 3. 其他字段
  if (rawData.totalTs) data.leaveDays = rawData.totalTs
  if (rawData.sjReason) data.reason = rawData.sjReason

  // 4. 附件名称处理 (请假通常用 filepath)
  if (rawData.filepath) {
    const pathStr = rawData.filepath
    const files =
      typeof pathStr === 'string' ? pathStr.split(',') : Array.isArray(pathStr) ? pathStr : []
    data.fileNames = files
      .map((f: string) => {
        return decodeURIComponent(f.substring(f.lastIndexOf('/') + 1))
      })
      .filter(Boolean)
      .join('，')
  } else {
    data.fileNames = '无'
  }

  // ==================== 【审批任务】 统一处理 ====================
  const tasks = printData.value.tasks || []

  // ----------------- A. 收文任务匹配 -----------------

  // A1. 主任拟办 (单条)
  const niBanTask = tasks.find((t: any) => t.name === '主任拟办' && t.approveName)
  if (niBanTask) {
    data.nibanContent = niBanTask.content || '同意'
    data.nibanHandler = niBanTask.approveName
    data.nibanDate = formatD(niBanTask.approveDate)
  } else {
    // 兼容旧数据或回显备注
    data.nibanContent = rawData.remark || ''
    data.nibanHandler = ''
    data.nibanDate = ''
  }

  // A2. 局长批示 (单条)
  const directorTask = tasks.find((t: any) => t.name === '局长批示' && t.approveName)
  if (directorTask) {
    data.directorContent = directorTask.content || '同意'
    data.directorHandler = directorTask.approveName
    data.directorDate = formatD(directorTask.approveDate)
  } else {
    data.directorContent = ''
    data.directorHandler = ''
    data.directorDate = ''
  }

  // A3. 列表类 (动态表格)
  const leaderTasks = tasks.filter((t: any) => t.name === '局领导批示' && t.approveName)
  data.leaderSectionHtml = buildDynamicSectionHtml('分管领导批示', leaderTasks, 3)

  const opinionTasks = tasks.filter((t: any) => t.name === '领导意见' && t.approveName)
  data.leaderOpinionHtml = buildDynamicSectionHtml('领导意见', opinionTasks, 3)

  const readerNames = ['主办科室', '协办科室', '办公室转发']
  const readerTasks = tasks.filter((t: any) => readerNames.includes(t.name) && t.approveName)
  data.readerSectionHtml = buildDynamicSectionHtml('阅办者', readerTasks, 3)

  // ----------------- B. 请假任务匹配 -----------------

  // B1. 科室负责人
  const deptHeadTask =
    tasks.find((t: any) => t.name.includes('科室') && t.name.includes('负责人') && t.approveName) ||
    tasks.find((t: any) => t.name === '部门经理' && t.approveName)
  if (deptHeadTask) {
    data.deptHeadContent = deptHeadTask.content || '同意'
    data.deptHeadHandler = deptHeadTask.approveName
    data.deptHeadDate = formatD(deptHeadTask.approveDate)
  }

  // B2. 办公室
  const officeTask = tasks.find((t: any) => t.name.includes('办公室') && t.approveName)
  if (officeTask) {
    data.officeContent = officeTask.content || '已核实'
    data.officeHandler = officeTask.approveName
    data.officeDate = formatD(officeTask.approveDate)
  }

  // B3. 分管领导
  const deputyLeaderTask = tasks.find((t: any) => t.name.includes('分管领导') && t.approveName)
  if (deputyLeaderTask) {
    data.deputyLeaderContent = deputyLeaderTask.content || '同意'
    data.deputyLeaderHandler = deputyLeaderTask.approveName
    data.deputyLeaderDate = formatD(deputyLeaderTask.approveDate)
  }

  // B4. 主要领导
  const mainLeaderTask = tasks.find((t: any) => t.name.includes('主要领导') && t.approveName)
  if (mainLeaderTask) {
    data.mainLeaderContent = mainLeaderTask.content || '同意'
    data.mainLeaderHandler = mainLeaderTask.approveName
    data.mainLeaderDate = formatD(mainLeaderTask.approveDate)
  }

  return data
}

const open = async (id: string) => {
  loading.value = true
  isCustomTemplate.value = false
  customTemplateHtml.value = ''

  try {
    printData.value = await ProcessInstanceApi.getProcessInstancePrintData(id)

    const processDefKey =
      printData.value.processDefinitionKey ||
      printData.value.processInstance?.processDefinition?.key ||
      printData.value.processInstance?.processDefinitionKey

    if (!processDefKey) {
      fallbackToDefault()
      return
    }

    // 获取字典
    const dictResp = await getDictDataPage({
      pageNo: 1,
      pageSize: 100,
      dictType: DICT_TYPE.BPM_PRINT_CLASS
    })
    const dictList = dictResp?.list || []

    // 匹配
    const matchDict = dictList.find((d: any) => d.value == processDefKey)

    // 渲染
    if (matchDict && matchDict.remark) {
      try {
        const rawData = printData.value.businessData || {}
        const formatData = preparePrintData(rawData)
        customTemplateHtml.value = renderTemplate(matchDict.remark, formatData)
        isCustomTemplate.value = true
      } catch (renderError) {
        console.error('【打印调试】渲染报错:', renderError)
        fallbackToDefault()
      }
    } else {
      fallbackToDefault()
    }
  } catch (e) {
    console.error('【打印调试】全局错误:', e)
    fallbackToDefault()
  } finally {
    loading.value = false
    visible.value = true
  }
}

const fallbackToDefault = () => {
  isCustomTemplate.value = false
  initPrintDataMap()
  parseFormFields()
}

defineExpose({ open })

const parseFormFields = () => {
  if (!printData.value) return
  const formFieldsObj = decodeFields(
    printData.value.processInstance.processDefinition?.formFields || []
  )
  const processVariables = printData.value.processInstance.formVariables
  let res: any = []
  for (const item of formFieldsObj) {
    const id = item['field']
    const name = item['title']
    const variable = processVariables[item['field']]
    let html = variable
    if (Array.isArray(variable)) html = variable.join(',')
    printDataMap.value[item['field']] = html
    res.push({ id, name, html })
  }
  formFields.value = res
}

const initPrintDataMap = () => {
  if (!printData.value?.processInstance) return
  printDataMap.value['startUser'] = printData.value.processInstance.startUser.nickname
  printDataMap.value['startTime'] = formatDate(printData.value.processInstance.startTime)
}

const getPrintTemplateHTML = () => {
  return printData.value?.printTemplateHtml || ''
}

const printObj = ref({
  id: 'printDivTag',
  popTitle: '&nbsp',
  extraHead: '',
  zIndex: 20003
})
</script>

<template>
  <el-dialog v-loading="loading" v-model="visible" :show-close="false" width="900px" top="5vh">
    <div class="print-dialog-scroll">
      <div id="printDivTag" style="word-break: break-all">
        <div v-if="isCustomTemplate" v-html="customTemplateHtml" class="custom-print-wrap"></div>
        <div v-else-if="printData?.printTemplateEnable" v-html="getPrintTemplateHTML()"></div>
        <div v-else>
          <h2 class="text-center">{{ printData?.processInstance?.name }}</h2>
          <table class="mt-20px w-100%" border="1" style="border-collapse: collapse">
            <tbody>
              <tr>
                <td class="p-5px w-25%">发起人</td>
                <td class="p-5px w-25%">{{ printData?.processInstance?.startUser?.nickname }}</td>
                <td class="p-5px w-25%">发起时间</td>
                <td class="p-5px w-25%">{{ formatDate(printData?.processInstance?.startTime) }}</td>
              </tr>
              <tr v-for="item in formFields" :key="item.id">
                <td class="p-5px w-20%">{{ item.name }}</td>
                <td class="p-5px w-80%" colspan="3"><div v-html="item.html"></div></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取 消</el-button>
        <el-button type="primary" v-print="printObj"> 打 印</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.print-dialog-scroll {
  max-height: 65vh;
  padding: 10px;
  overflow: hidden auto;
  border: 1px solid #eee;
}
</style>

<style>
@media print {
  @page {
    margin: 8mm;
    size: auto;
  }

  body,
  html,
  #app,
  .el-dialog {
    height: auto !important;
    overflow: visible !important;
  }

  .print-dialog-scroll {
    max-height: none !important;
    overflow: visible !important;
    border: none !important;
  }

  #printDivTag .oa-container {
    width: 100% !important;
    padding: 0 !important;
    box-shadow: none !important;
  }
}
</style>
