

<template>

  <el-descriptions :column="2" border style="margin-right: 20px" size="large">
    <el-descriptions-item
    label="申请人"
    label-align="center"
    align="center"
    width="150px">
      {{nickname}}
    </el-descriptions-item>
    <el-descriptions-item
      label="所在科室"
      label-align="center"
      align="center"
      width="150px">
      {{deptName}}
    </el-descriptions-item>
    <el-descriptions-item
      label="请假类型"
      label-align="center"
      align="center"
      width="150px">
      <dict-tag :type="DICT_TYPE.BPM_LEAVE_TYPE" :value="detailData.qxjType " />
    </el-descriptions-item>
    <el-descriptions-item
      label="申请日期"
      label-align="center"
      align="center"
      width="150px">
      {{detailData.applyDate}}
    </el-descriptions-item>
    <el-descriptions-item
      label="请假开始从"
      label-align="center"
      align="center"
      width="150px">
      {{new Date(detailData.qxjStartDate).toLocaleDateString()}}
    </el-descriptions-item>
    <el-descriptions-item
      label="时段"
      label-align="center"
      align="center"
      width="150px">
      {{new Date(detailData.qxjStartDate).toLocaleDateString()}}
    </el-descriptions-item>
    <el-descriptions-item
      label="请假结束至"
      label-align="center"
      align="center"
      width="150px">
      {{new Date(detailData.qxjEndDate).toLocaleDateString()}}
    </el-descriptions-item>
    <el-descriptions-item
      label="时段"
      label-align="center"
      align="center"
      width="150px">
      {{new Date(detailData.qxjEndDate).toLocaleDateString()}}
    </el-descriptions-item>
    <el-descriptions-item
      label="请假天数"
      label-align="center"
      align="center"
      width="150px">
      {{detailData.totalTs}}
    </el-descriptions-item>
    <el-descriptions-item
      label="上传附件"
      label-align="center"
      align="center"
      width="150px">
      {{detailData.totalTs}}
    </el-descriptions-item>
    <el-descriptions-item
      label="请假事由"
      label-align="center"
      align="center"
      width="150px"
      :span="2">
      {{detailData.sjReason}}
    </el-descriptions-item>
  </el-descriptions>
</template>
<script setup lang="ts">
import {DICT_TYPE} from "@/utils/dict";
// import { formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import * as LeaveApi from '@/api/bpm/leave'
import {useUserStore} from "@/store/modules/user";
defineOptions({ name: 'LeaveDetail' })
const userStore = useUserStore()
const nickname = computed(()=>userStore.user.nickname)
const deptName = ref('')

const { query } = useRoute() // 查询参数

const props = defineProps({
  id: propTypes.number.def(undefined)
})

const detailLoading = ref(false) // 表单的加载中
const detailData = ref<any>({}) // 详情数据
const queryId = query.id as unknown as number



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

/** 初始化 **/
onMounted(() => {
  getInfo()
})
</script>
<style scoped lang="scss">

</style>
