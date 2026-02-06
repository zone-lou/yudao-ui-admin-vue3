<template>
  <el-table :data="tasks" border header-cell-class-name="table-header-gray" style="width: 100%">
    <el-table-column label="环节名称" prop="name" width="250" align="center" fixed />
    <el-table-column label="办理人员" width="100" align="center">
      <template #default="scope">
        {{ scope.row.assigneeUser?.nickname || scope.row.ownerUser?.nickname }}
      </template>
    </el-table-column>
    <el-table-column align="center" label="办理状态" prop="status" width="100">
      <template #default="scope">
        <dict-tag :type="DICT_TYPE.BPM_TASK_STATUS" :value="scope.row.status" />
      </template>
    </el-table-column>
    <el-table-column
      :formatter="dateFormatter"
      align="center"
      label="开始时间"
      prop="createTime"
      width="200"
    />
    <el-table-column
      :formatter="dateFormatter"
      align="center"
      label="结束时间"
      prop="endTime"
      width="200"
    />
    <el-table-column
      :formatter="dateFormatter"
      align="center"
      label="办理时限"
      prop="dueDate"
      width="200"
    />
    <el-table-column align="center" label="转入环节" prop="reason" width="200">
      <template #default="scope">
        <el-button type="primary" link icon="ep:back" @click="handleTrace(scope.row, 1)">
          转入环节
        </el-button>
      </template>
    </el-table-column>
    <el-table-column align="center" label="转出环节" prop="reason" width="200">
      <template #default="scope">
        <el-button
          v-if="scope.row.endTime"
          type="primary"
          link
          icon="ep:right"
          @click="handleTrace(scope.row, 2)"
        >
          转出环节
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <Dialog :title="traceType === 1 ? '转入环节' : '转出环节'" v-model="traceVisible" width="1200px">
    <div v-loading="traceLoading">
      <el-table :data="traceNodeList" border style="width: 100%">
        <el-table-column prop="taskName" label="环节名称" align="center" />
        <el-table-column
          prop="taskName"
          :label="traceType === 1 ? '转入条件' : '转出条件'"
          align="center"
        >
          <template #default="scope">
            <span v-if="traceType === 1"> 转{{ currentClickedTaskName }} </span>
            <span v-else> 转{{ scope.row.taskName }} </span>
          </template>
        </el-table-column>
        <el-table-column prop="assigneeName" label="办理人员" align="center" width="120" />
        <el-table-column prop="status" label="办理状态" align="center" width="120">
          <template #default="scope">
            <dict-tag :type="DICT_TYPE.BPM_TASK_STATUS" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" align="center" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="endTime" label="结束时间" align="center" width="180">
          <template #default="scope">
            {{ formatDate(scope.row.endTime) }}
          </template>
        </el-table-column>
      </el-table>

      <div
        v-if="traceType === 1 && traceNodeList.length === 0"
        class="text-center py-6 text-gray-500"
      >
        <Icon icon="ep:flag" class="mr-1" /> 当前为流程起始节点 (发起点)
      </div>

      <div
        v-if="traceType === 2 && traceNodeList.length === 0"
        class="text-center py-6 text-gray-500"
      >
        <Icon icon="ep:circle-check" class="mr-1" /> 流程已结束或无后续任务
      </div>
    </div>
  </Dialog>

  <!-- 弹窗：表单 -->
  <Dialog title="表单详情" v-model="taskFormVisible" width="600">
    <form-create
      ref="fApi"
      v-model="taskForm.value"
      :option="taskForm.option"
      :rule="taskForm.rule"
    />
  </Dialog>
</template>
<script lang="ts" setup>
import { dateFormatter, formatDate } from '@/utils/formatTime'
import { propTypes } from '@/utils/propTypes'
import { DICT_TYPE } from '@/utils/dict'
import type { ApiAttrs } from '@form-create/element-ui/types/config'
import * as TaskApi from '@/api/bpm/task'

defineOptions({ name: 'BpmProcessInstanceTaskList' })

const props = defineProps({
  loading: propTypes.bool.def(false), // 是否加载中
  id: propTypes.string // 流程实例的编号
})
const tasks = ref([]) // 流程任务的数组
const traceVisible = ref(false)
const traceLoading = ref(false)
const traceType = ref(1) // 1=前置, 2=后置
const traceData = ref<any>({})
const traceNodeList = ref<any[]>([])
const currentClickedTaskName = ref('')
/** 点击查看来源或去向 */
const handleTrace = async (row: any, type: number) => {
  traceType.value = type
  currentClickedTaskName.value = row.name
  traceVisible.value = true
  traceLoading.value = true
  traceNodeList.value = [] // 先清空

  try {
    // 调用我们在前一步封装的 API (记得确认 import 路径)
    const data = await TaskApi.getTaskTrace(row.id, type, props.id)
    traceData.value = data
    console.log(data)
    // 根据类型决定表格显示哪个列表
    if (type === 1) {
      traceNodeList.value = data.previousTasks || []
    } else {
      traceNodeList.value = data.nextTasks || []
    }
  } catch (error) {
    console.error(error)
  } finally {
    traceLoading.value = false
  }
}

/** 查看表单 */
const fApi = ref<ApiAttrs>() // form-create 的 API 操作类
const taskForm = ref({
  rule: [],
  option: {},
  value: {}
}) // 流程任务的表单详情
const taskFormVisible = ref(false)
// const handleFormDetail = async (row: any) => {
//   // 设置表单
//   setConfAndFields2(taskForm, row.formConf, row.formFields, row.formVariables)
//   // 弹窗打开
//   taskFormVisible.value = true
//   // 隐藏提交、重置按钮，设置禁用只读
//   await nextTick()
//   fApi.value.fapi.btn.show(false)
//   fApi.value?.fapi?.resetBtn.show(false)
//   fApi.value?.fapi?.disabled(true)
// }

/** 只有 loading 完成时，才去加载流程列表 */
watch(
  () => props.loading,
  async (value) => {
    if (value) {
      tasks.value = await TaskApi.getTaskListByProcessInstanceId(props.id)
    }
  }
)
</script>
