<template>
  <!-- 列表 -->
  <ContentWrap>
    <el-table
        row-key="id"
        v-loading="loading"
        :data="list"
        :stripe="true"
        :show-overflow-tooltip="true"
    >
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column
        label="裁定判决日期"
        align="center"
        prop="cdpjRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="建议函日期"
        align="center"
        prop="jyhRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="建议函内容" align="center" prop="jyhNr" />
      <el-table-column
        label="转业务科室日期"
        align="center"
        prop="zksRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="判决结果" align="center" prop="pjJg" />
      <el-table-column label="裁定结果" align="center" prop="cdJg" />
      <el-table-column label="行政赔偿（单位：元）" align="center" prop="xzPc" />
      <el-table-column label="执行情况" align="center" prop="zxQk" />
      <el-table-column label="装订人" align="center" prop="zdr" />
      <el-table-column
        label="装订日期"
        align="center"
        prop="zdRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="装订情况" align="center" prop="zdQk" />
      <el-table-column label="移交人" align="center" prop="yjr" />
      <el-table-column
        label="移交日期"
        align="center"
        prop="yjRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="移交情况" align="center" prop="yjQk" />
      <el-table-column
        label="开庭日期"
        align="center"
        prop="ktRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="创建时间"
        align="center"
        prop="createTime"
        :formatter="dateFormatter"
        width="180px"
      />
    </el-table>
  </ContentWrap>
</template>
<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { isEmpty } from '@/utils/is'
import { XzssApi, XzssKz } from '@/api/bpm/xzss'

const props = defineProps<{
  xmGuid?: number // 备用主键（主表的关联字段）
}>()
const loading = ref(false) // 列表的加载中
const list = ref([]) // 列表的数据

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await XzssApi.getXzssKzByXmGuid(props.xmGuid)
    if (!data) {
      return
    }
    list.value.push(data)
  } finally {
    loading.value = false
  }
}


/** 初始化 **/
onMounted(() => {
  getList()
})
</script>