<script setup lang="ts">
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
// 【修改点1】引入 getDictDataPage (分页接口)，而不是不存在的 type 接口
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

/** 辅助：格式化日期 */
const formatD = (val: any) => (val ? dateUtil(val).format('YYYY-MM-DD') : '')

/** 准备打印数据 */
const preparePrintData = (rawData: any) => {
  console.log('【打印调试】原始业务数据 (rawData):', rawData)
  const data = { ...rawData }

  data.receiveTime = formatD(rawData.receiveTime)
  data.createTime = formatD(rawData.createTime)
  data.zhubandate = formatD(rawData.zhubandate)
  data.xiebandate = formatD(rawData.xiebandate)

  if (rawData.urgencyDegree) {
    data.urgencyDegree = getDictLabel(DICT_TYPE.BPM_EMERGENCY_DEGREE, rawData.urgencyDegree)
  }
  if (rawData.sendDocNumber) {
    data.sendDocNumber = getDictLabel(DICT_TYPE.BPM_DOC_NUM_TYPE, rawData.sendDocNumber)
  }

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
      console.error('【打印调试】处理来文单位出错:', err)
      data.sendDept = rawData.sendDept
    }
  }

  data.supervisionMark = rawData.zhubandate || rawData.xiebandate ? '✔' : ''
  data.printUser = userName.value
  data.printDate = formatD(new Date())

  return data
}

const open = async (id: string) => {
  loading.value = true
  isCustomTemplate.value = false
  customTemplateHtml.value = ''

  try {
    console.log('【打印调试】开始获取打印数据, ID:', id)
    printData.value = await ProcessInstanceApi.getProcessInstancePrintData(id)

    // 1. 获取 Key
    const processDefKey =
      printData.value.processDefinitionKey ||
      printData.value.processInstance?.processDefinition?.key ||
      printData.value.processInstance?.processDefinitionKey

    console.log('【打印调试】获取到的流程Key:', processDefKey)

    if (!processDefKey) {
      fallbackToDefault()
      return
    }

    // 2. 【核心修改】改用 getDictDataPage 获取字典数据
    console.log('【打印调试】正在调用 getDictDataPage 获取字典...')
    // 这里使用 pageSize: 100 确保能查到（通常一个类型的字典不会超过100个）
    const dictResp = await getDictDataPage({
      pageNo: 1,
      pageSize: 100,
      dictType: DICT_TYPE.BPM_PRINT_CLASS
    })

    // 注意：getDictDataPage 返回结构通常是 { list: [...], total: ... }
    const dictList = dictResp?.list || []
    console.log('【打印调试】API返回的字典列表:', dictList)

    // 3. 匹配字典项
    // 注意类型转换，防止 1 == '1' 问题
    const matchDict = dictList.find((d: any) => d.value == processDefKey)
    console.log('【打印调试】匹配到的字典项:', matchDict)

    // 4. 渲染模板
    if (matchDict && matchDict.remark) {
      console.log('【打印调试】获取到模板，长度:', matchDict.remark.length)
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
      console.warn('【打印调试】字典项中没有 remark 字段，或未找到匹配项')
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
