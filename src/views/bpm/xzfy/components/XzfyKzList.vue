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
        label="复议决定日期"
        align="center"
        prop="fyjdRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="复议结果：0撤销，1维持" align="center" prop="fyJg" />
      <el-table-column
        label="转业务科室日期"
        align="center"
        prop="zksRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="意见书文号" align="center" prop="yjsWh" />
      <el-table-column
        label="意见书日期"
        align="center"
        prop="yjsRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="行政赔偿，单位：元" align="center" prop="xzPc" />
      <el-table-column label="执行情况" align="center" prop="zxQk" />
      <el-table-column label="是否装订：0否，1是" align="center" prop="sfZd" />
      <el-table-column label="装订人" align="center" prop="zdr" />
      <el-table-column
        label="装订日期"
        align="center"
        prop="zdRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="是否移交：0否，1是" align="center" prop="sfYj" />
      <el-table-column label="移交人" align="center" prop="yjr" />
      <el-table-column
        label="移交日期"
        align="center"
        prop="yjRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="备注" align="center" prop="bz" />
      <el-table-column label="意见书内容" align="center" prop="yjsNr" />
      <el-table-column
        label="听证日期"
        align="center"
        prop="tzRq"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="流程实例的编号" align="center" prop="processInstanceId" />
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
import { XzfyApi, XzfyKz } from '@/api/bpm/xzfy'

const props = defineProps<{
  xmGuid?: number // 备用主键（主表的关联字段）
}>()
const loading = ref(false) // 列表的加载中
const list = ref([]) // 列表的数据

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await XzfyApi.getXzfyKzByXmGuid(props.xmGuid)
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