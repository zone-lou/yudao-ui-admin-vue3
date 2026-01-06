<template>
  <div v-loading="detailLoading">
    <el-descriptions title="基本信息" :column="2" border size="large" class="mb-20px">
      <el-descriptions-item label="申请人" label-align="center" align="center">
        {{ detailData.sqr }}
      </el-descriptions-item>
      <el-descriptions-item label="被申请人" label-align="center" align="center">
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
      <el-descriptions-item label="来文日期" label-align="center" align="center">
        {{ formatDate(detailData.swRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="办理时限" label-align="center" align="center">
        {{ formatDate(detailData.zhubandate) }}
      </el-descriptions-item>

      <el-descriptions-item label="类别一" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_XZFY_CLASS1" :value="detailData.lb1" />
      </el-descriptions-item>
      <el-descriptions-item label="类别二" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_XZFY_CLASS2" :value="detailData.lb2" />
      </el-descriptions-item>
      <el-descriptions-item label="类别三" label-align="center" align="center">
        <dict-tag :type="DICT_TYPE.BPM_XZFY_CLASS3" :value="detailData.lb3" />
      </el-descriptions-item>

      <el-descriptions-item label="复议请求" label-align="center" align="center" :span="2">
        {{ detailData.fyNr }}
      </el-descriptions-item>

      <el-descriptions-item label="承办人" label-align="center" align="center">
        {{ detailData.cbr }}
      </el-descriptions-item>
      <el-descriptions-item label="承办日期" label-align="center" align="center">
        {{ formatDate(detailData.cbRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="行政区" label-align="center" align="center">
        {{ detailData.xzq }}
      </el-descriptions-item>
      <el-descriptions-item label="监督监管" label-align="center" align="center">
        {{ formatBoolean(detailData.issupervise) }}
      </el-descriptions-item>
    </el-descriptions>

    <el-descriptions
      title="其他相关信息"
      :column="2"
      border
      size="large"
      class="mb-20px"
      v-if="detailData.xzfyKz || detailData.xzfykz"
    >
      <el-descriptions-item label="复议决定日期" label-align="center" align="center">
        {{ formatDate(getKzData().fyjdRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="复议结果" label-align="center" align="center">
        {{ formatFyJg(getKzData().fyJg) }}
      </el-descriptions-item>
      <el-descriptions-item label="转业务科室日期" label-align="center" align="center">
        {{ formatDate(getKzData().zksRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="听证日期" label-align="center" align="center">
        {{ formatDate(getKzData().tzRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="意见书文号" label-align="center" align="center">
        {{ getKzData().yjsWh }}
      </el-descriptions-item>
      <el-descriptions-item label="意见书日期" label-align="center" align="center">
        {{ formatDate(getKzData().yjsRq) }}
      </el-descriptions-item>
      <el-descriptions-item label="意见书内容" label-align="center" align="center" :span="2">
        {{ getKzData().yjsNr }}
      </el-descriptions-item>
      <el-descriptions-item label="行政赔偿" label-align="center" align="center">
        {{ getKzData().xzPc ? getKzData().xzPc + ' 元' : '' }}
      </el-descriptions-item>
      <el-descriptions-item label="执行情况" label-align="center" align="center">
        {{ getKzData().zxQk }}
      </el-descriptions-item>
      <el-descriptions-item label="是否移交" label-align="center" align="center">
        {{ formatBoolean(getKzData().sfYj) }}
      </el-descriptions-item>
      <el-descriptions-item label="是否装订" label-align="center" align="center">
        {{ formatBoolean(getKzData().sfZd) }}
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
import { XzfyApi } from '@/api/bpm/xzfy'
import { propTypes } from '@/utils/propTypes'
import { DICT_TYPE } from '@/utils/dict'

defineOptions({ name: 'BpmXzfyDetail' })

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
    const res = await XzfyApi.getXzfy(queryId)
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
  return detailData.value.xzfyKz || detailData.value.xzfykz || {}
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

/** 格式化复议结果 */
const formatFyJg = (val: any) => {
  if (val === 1) return '维持'
  if (val === 0) return '撤销'
  return val
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
