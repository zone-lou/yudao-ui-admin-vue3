<template>
  <div v-loading="detailLoading">
    <el-descriptions title="基本信息" :column="2" border size="large" class="mb-20px">
      <el-descriptions-item label="原告" label-align="center" align="center">
        {{ detailData.sqr }}
      </el-descriptions-item>
      <el-descriptions-item label="被告" label-align="center" align="center">
        {{ detailData.bsqr }}
      </el-descriptions-item>
      <el-descriptions-item label="第三人" label-align="center" align="center">
        {{ detailData.dsr }}
      </el-descriptions-item>
      <el-descriptions-item label="土地坐落" label-align="center" align="center">
        {{ detailData.tdZl }}
      </el-descriptions-item>
      <el-descriptions-item label="来文号" label-align="center" align="center">
        {{ detailData.swWh }}
      </el-descriptions-item>
      <el-descriptions-item label="来文机关" label-align="center" align="center">
        {{ detailData.swJg }}
      </el-descriptions-item>
      <el-descriptions-item label="复议案号" label-align="center" align="center">
        {{ detailData.fyAh }}
      </el-descriptions-item>
      <el-descriptions-item label="上一审案号" label-align="center" align="center">
        {{ detailData.ssAh }}
      </el-descriptions-item>
      <el-descriptions-item label="后一审案号" label-align="center" align="center" :span="2">
        {{ detailData.hysAh }}
      </el-descriptions-item>
      <el-descriptions-item label="收文日期" label-align="center" align="center">
        {{ formatDate(detailData.swRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="办理时限" label-align="center" align="center">
        {{ formatDate(detailData.zhubandate) }}
      </el-descriptions-item>

      <el-descriptions-item label="诉讼类型" label-align="center" align="center">
        {{ formatSsLx(detailData.ssLx) }}
      </el-descriptions-item>
      <el-descriptions-item label="送法院日期" label-align="center" align="center">
        {{ formatDate(detailData.sfyjgRq) }}
      </el-descriptions-item>

      <el-descriptions-item label="案件类别" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS1" :value="detailData.lb1" />
      </el-descriptions-item>
      <el-descriptions-item label="案件分类" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS2" :value="detailData.lb2" />
      </el-descriptions-item>
      <el-descriptions-item label="涉及事项" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS3" :value="detailData.lb3" />
      </el-descriptions-item>
      <el-descriptions-item label="案件类型" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS4" :value="detailData.lb4" />
      </el-descriptions-item>
      <el-descriptions-item label="诉讼类别" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_XZSS_CLASS5" :value="detailData.lb5" />
      </el-descriptions-item>

      <el-descriptions-item label="复议请求" label-align="center" align="center" :span="2">
        {{ detailData.ssNr }}
      </el-descriptions-item>
      <el-descriptions-item label="诉讼内容" label-align="center" align="center" :span="2">
        {{ detailData.ssnr }}
      </el-descriptions-item>

      <el-descriptions-item label="承办人" label-align="center" align="center">
        {{ detailData.cbr }}
      </el-descriptions-item>
      <el-descriptions-item label="承办日期" label-align="center" align="center">
        {{ formatDate(detailData.cbRq) }}
      </el-descriptions-item>

      <el-descriptions-item label="上诉人" label-align="center" align="center">
        {{ detailData.ssr }}
      </el-descriptions-item>
      <el-descriptions-item label="被上诉人" label-align="center" align="center">
        {{ detailData.bssr }}
      </el-descriptions-item>
      <el-descriptions-item label="再审申请人" label-align="center" align="center">
        {{ detailData.zssqr }}
      </el-descriptions-item>
      <el-descriptions-item label="再审被申请人" label-align="center" align="center">
        {{ detailData.zsbsqr }}
      </el-descriptions-item>

      <el-descriptions-item label="监督监管" label-align="center" align="center">
        {{ formatBoolean(detailData.issupervise) }}
      </el-descriptions-item>
      <el-descriptions-item label="寄件提醒" label-align="center" align="center">
        {{ formatBoolean(detailData.mailTip) }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      title="行政诉讼拓展信息"
      :column="2"
      border
      size="large"
      class="mb-20px"
      v-if="detailData.xzssKz || detailData.xzsskz"
    >
      <el-descriptions-item label="裁定判决日期" label-align="center" align="center">
        {{ formatDate(getKzData().cdpjRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="建议函日期" label-align="center" align="center">
        {{ formatDate(getKzData().jyhRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="建议函内容" label-align="center" align="center" :span="2">
        {{ getKzData().jyhNr }}
      </el-descriptions-item>
      <el-descriptions-item label="转业务科室" label-align="center" align="center">
        {{ formatDate(getKzData().zksRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="开庭日期" label-align="center" align="center">
        {{ formatDate(getKzData().ktRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="判决结果" label-align="center" align="center">
        {{ getKzData().pjJg }}
      </el-descriptions-item>
      <el-descriptions-item label="裁定结果" label-align="center" align="center">
        {{ getKzData().cdJg }}
      </el-descriptions-item>
      <el-descriptions-item label="行政赔偿" label-align="center" align="center">
        {{ getKzData().xzPc ? getKzData().xzPc + ' 元' : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="执行情况" label-align="center" align="center">
        {{ getKzData().zxQk }}
      </el-descriptions-item>
      <el-descriptions-item label="装订人" label-align="center" align="center">
        {{ getKzData().zdr }}
      </el-descriptions-item>
      <el-descriptions-item label="装订日期" label-align="center" align="center">
        {{ formatDate(getKzData().zdRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="装订情况" label-align="center" align="center" :span="2">
        {{ getKzData().zdQk }}
      </el-descriptions-item>
      <el-descriptions-item label="移交人" label-align="center" align="center">
        {{ getKzData().yjr }}
      </el-descriptions-item>
      <el-descriptions-item label="移交日期" label-align="center" align="center">
        {{ formatDate(getKzData().yjRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="移交情况" label-align="center" align="center" :span="2">
        {{ getKzData().yjQk }}
      </el-descriptions-item>
      <el-descriptions-item label="备注" label-align="center" align="center" :span="2">
        {{ getKzData().bz }}
      </el-descriptions-item>
    </el-descriptions>

    <div class="mt-20px">
      <h4 style="margin-bottom: 10px; font-weight: bold; color: #303133">相关文书列表</h4>
      <el-table :data="docList" border style="width: 100%">
        <el-table-column label="序号" type="index" width="60" align="center" />
        <el-table-column label="文书名称" prop="docName" align="center" />
        <el-table-column label="收文日期" align="center">
          <template #default="{ row }">
            {{ formatDate(row.docDate) }}
          </template>
        </el-table-column>
        <el-table-column label="主要内容" prop="docContent" align="center" show-overflow-tooltip />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { dateUtil } from '@/utils/dateUtil'
import { XzssApi } from '@/api/bpm/xzss'
import { propTypes } from '@/utils/propTypes'
import { DICT_TYPE } from '@/utils/dict'

defineOptions({ name: 'BpmXzssDetail' })

const props = defineProps({
  id: propTypes.number.def(undefined)
})

const { query } = useRoute()
const detailLoading = ref(false)
const detailData = ref<any>({})
const docList = ref<any[]>([])

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
    const res = await XzssApi.getXzss(queryId)
    detailData.value = res || {}

    // 解析动态表格数据
    if (res.otherRelatedInfo) {
      try {
        docList.value = JSON.parse(res.otherRelatedInfo)
      } catch (e) {
        console.warn('解析文书列表失败', e)
        docList.value = []
      }
    } else {
      docList.value = []
    }
  } catch (error) {
    console.error('获取详情失败', error)
  } finally {
    detailLoading.value = false
  }
}

/** 辅助函数：获取扩展表数据 */
const getKzData = () => {
  return detailData.value.xzssKz || detailData.value.xzsskz || {}
}

/** 格式化日期 */
const formatDate = (val: any) => {
  if (!val) return ''
  return dateUtil(val).format('YYYY-MM-DD')
}

/** 格式化布尔值 */
const formatBoolean = (val: any) => {
  if (val === 1) return '是'
  if (val === 0) return '否'
  return ''
}

/** 格式化诉讼类型 */
const formatSsLx = (val: any) => {
  const map: Record<number, string> = {
    1: '一审',
    2: '二审',
    3: '再审'
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
