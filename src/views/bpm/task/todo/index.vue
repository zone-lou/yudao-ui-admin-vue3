<template>
  <!--  <doc-alert title="审批通过、不通过、驳回" url="https://doc.iocoder.cn/bpm/task-todo-done/" />-->
  <!--  <doc-alert title="审批加签、减签" url="https://doc.iocoder.cn/bpm/sign/" />-->
  <!--  <doc-alert-->
  <!--    title="审批转办、委派、抄送"-->
  <!--    url="https://doc.iocoder.cn/bpm/task-delegation-and-cc/"-->
  <!--  />-->
  <!--  <doc-alert title="审批加签、减签" url="https://doc.iocoder.cn/bpm/sign/" />-->

  <ContentWrap>
    <div class="flex justify-between items-start">
      <div class="flex gap-2">
<!--        <el-button type="success" plain @click="handleDone">-->
<!--          <Icon icon="ep:check" class="mr-5px" /> 办结-->
<!--        </el-button>-->
        <el-button type="primary" @click="handleBatchDone">
          <Icon icon="ep:finished" class="mr-5px" /> 批量办结
        </el-button>
      </div>

      <el-form ref="queryFormRef" :inline="true" :model="queryParams" class="-mb-15px">
        <el-form-item prop="processDefinitionKey">
          <el-select
            v-model="queryParams.processDefinitionKey"
            placeholder="请选择流程定义"
            clearable
            @change="handleQuery"
            class="!w-390px"
          >
            <el-option
              v-for="item in processDefinitionList"
              :key="item.key"
              :label="item.name"
              :value="item.key"
            />
          </el-select>
        </el-form-item>

        <el-form-item prop="name">
          <el-input
            v-model="queryParams.name"
            class="!w-200px"
            clearable
            placeholder="请输入任务名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>

        <el-form-item>
          <el-button @click="handleQuery">
            <Icon class="mr-5px" icon="ep:search" />
            搜索
          </el-button>
        </el-form-item>

        <el-form-item>
          <el-popover
            :visible="showPopover"
            persistent
            :width="400"
            :show-arrow="false"
            placement="bottom-end"
          >
            <template #reference>
              <el-button @click="showPopover = !showPopover">
                <Icon icon="ep:plus" class="mr-5px" />高级筛选
              </el-button>
            </template>
            <el-form-item label="发起时间" prop="createTime">
              <el-date-picker
                v-model="queryParams.createTime"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
                class="!w-full"
              />
            </el-form-item>

            <el-form-item label="办件名称" prop="processInstanceName">
              <el-input v-model="queryParams.processInstanceName" placeholder="请输入办件名称" />
            </el-form-item>

            <el-form-item label="紧急程度" prop="urgencyDegree">
              <el-select
                v-model="queryParams.urgencyDegree"
                placeholder="请选择紧急程度"
                clearable
                class="!w-full"
              >
                <el-option
                  v-for="dict in getDictOptions(DICT_TYPE.BPM_EMERGENCY_DEGREE)"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="办件编号" prop="processInstanceId">
              <el-input v-model="queryParams.processInstanceId" placeholder="请输入办件编号" />
            </el-form-item>

            <el-form-item label="来文单位" prop="sendingUnit">
              <el-input v-model="queryParams.sendingUnit" placeholder="请输入来文单位" />
            </el-form-item>

            <el-form-item label="环节时限" prop="dueDate">
              <el-date-picker
                v-model="queryParams.dueDate"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                start-placeholder="开始"
                end-placeholder="结束"
                class="!w-full"
              />
            </el-form-item>

            <el-form-item label="办结时限" prop="processDeadline">
              <el-date-picker
                v-model="queryParams.processDeadline"
                value-format="YYYY-MM-DD HH:mm:ss"
                type="daterange"
                start-placeholder="开始"
                end-placeholder="结束"
                class="!w-full"
              />
            </el-form-item>
            <el-form-item class="font-bold" label-position="top">
              <div class="flex justify-end w-full">
                <el-button @click="resetQuery">清空</el-button>
                <el-button @click="showPopover = false">取消</el-button>
                <el-button type="primary" @click="handleQuery">确认</el-button>
              </div>
            </el-form-item>
          </el-popover>
        </el-form-item>
      </el-form>
    </div>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" />
      <!-- 1. 标签 (超时标识) -->
      <el-table-column label="chaosh" width="100" align="center">
        <template #header>
          <el-icon><Clock /></el-icon>
        </template>
        <template #default="scope">
          <div
            :style="{
              color: getTimeoutStatus(scope.row).color,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }"
          >
            <el-icon style="margin-right: 5px">
              <Clock />
            </el-icon>
          </div>
        </template>
      </el-table-column>

      <!-- 2. 紧急程度 -->
      <el-table-column label="紧急程度" align="center" width="100">
        <template #default="scope">
          <dict-tag
            v-if="scope.row.urgencyDegree"
            :type="DICT_TYPE.BPM_EMERGENCY_DEGREE"
            :value="scope.row.urgencyDegree"
          />
        </template>
      </el-table-column>

      <!-- 3. 办件名称 (绑定 processInstance.name) -->
      <el-table-column align="center" label="办件名称" prop="processInstance.name" width="250" />

      <!-- 4. 办件编号 (已移除) -->
      <el-table-column align="center" label="办件编号" prop="processInstanceId" width="250" />
      <!-- 5. 当前环节 (任务名称) -->
      <el-table-column align="center" label="当前环节" prop="name" width="150" />

      <!-- 6. 办件类型 (绑定 taskName) -->
      <el-table-column align="center" label="办件类型" prop="taskName" width="180" />

      <!-- 7. 开始日期 (流程发起时间) -->
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="开始日期"
        prop="processInstance.createTime"
        width="180"
      />

      <!-- 8. 办结时限 (流程截止时间 - 暂无字段，使用占位或 hidden) -->
      <el-table-column label="办结时限" width="180" align="center">
        <template #default="scope">
          {{ formatProcessDeadline(scope.row) }}
        </template>
      </el-table-column>

      <!-- 9. 环节时限 (任务截止时间) -->
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="环节时限"
        prop="dueDate"
        width="180"
      />

      <!-- 10. 状态 -->
      <el-table-column label="状态" align="center" width="220">
        <template #default="scope">
          <span>待办</span>

          <span v-if="isTaskOverdue(scope.row)" style="color: #f56c6c; font-weight: bold">
            ，已超期
          </span>

          <span v-if="isProcessOverdue(scope.row)" style="color: #f56c6c; font-weight: bold">
            ，办件已超期
          </span>
        </template>
      </el-table-column>

      <el-table-column align="center" label="操作" fixed="right" width="80">
        <template #default="scope">
          <el-button link type="primary" @click="handleAudit(scope.row)">办理</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      v-model:limit="queryParams.pageSize"
      v-model:page="queryParams.pageNo"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script lang="ts" setup>
import { dateFormatter } from '@/utils/formatTime'
import * as TaskApi from '@/api/bpm/task'
import { CategoryApi, CategoryVO } from '@/api/bpm/category'
import * as DefinitionApi from '@/api/bpm/definition'
import dayjs from 'dayjs'
import { DICT_TYPE, getDictOptions } from '@/utils/dict'
import { Clock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

defineOptions({ name: 'BpmTodoTask' })
const selectionList = ref<any[]>([])

const { push } = useRouter() // 路由

const handleSelectionChange = (val: any[]) => {
  selectionList.value = val
}

const handleBatchDone = async () => {
  if (selectionList.value.length === 0) {
    ElMessage.warning('请选择要办结的任务')
    return
  }

  // 提取 ID 列表
  const ids = selectionList.value.map((item) => item.id)

  try {
    // 弹出输入原因框
    const { value } = await ElMessageBox.prompt('请输入批量办结的原因', '批量办结', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /\S/, // 非空校验
      inputErrorMessage: '原因不能为空',
      inputValue: '批量办结' // 默认值
    })

    // 调用接口
    await TaskApi.batchApproveTaskIfEnd({
      ids: ids,
      reason: value
    })

    ElMessage.success('批量办结成功')
    // 刷新列表
    await getList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error(error)
    }
  }
}
/** 获取超时状态 */
const getTimeoutStatus = (row: any) => {
  // 如果没有截止日期，视为普通待办
  if (!row.dueDate) {
    return {
      label: '待办',
      type: 'primary',
      color: '#67C23A' // Element Plus Primary Blue
    }
  }

  const now = dayjs()
  const due = dayjs(row.dueDate)

  if (due.isBefore(now)) {
    // 场景：已超时
    return {
      label: '超时',
      type: 'danger',
      color: '#F56C6C' // Element Plus Danger Red
    }
  } else if (due.diff(now, 'day', true) <= 1) {
    // 场景：临期（1天内）
    return {
      label: '临期',
      type: 'warning',
      color: '#E6A23C' // Element Plus Warning Orange
    }
  } else {
    // 场景：正常
    return {
      label: '待办',
      type: 'primary',
      color: '#67C23A' // Element Plus Primary Blue (或者用 #606266 显示黑色)
    }
  }
}

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const processDefinitionList = ref<any[]>([]) // 流程定义列表
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  category: undefined,
  processDefinitionKey: '',
  processInstanceName: '', // 办件名称
  processInstanceId: '', // 办件编号
  urgencyDegree: undefined, // 紧急程度
  sendingUnit: '', // 来文单位
  createTime: [],
  dueDate: [], // 环节时限 (任务截止)
  processDeadline: [] // 办结时限 (流程截止)
})
const queryFormRef = ref() // 搜索的表单
const categoryList = ref<CategoryVO[]>([]) // 流程分类列表
const showPopover = ref(false) // 高级筛选是否展示

const getProcessDeadline = (row: any) => {
  const createTime = row.processInstance?.createTime
  // 假设 completionTime 字段在 processInstance 中 (请根据实际后端返回字段调整，如 row.completionTime)
  const completionHours = row.completionTime

  if (!createTime || !completionHours) {
    return null // 如果没有数据，返回空
  }

  // 将字符串数字转换为数字，并增加对应的小时数
  return dayjs(createTime).add(Number(completionHours), 'hour')
}

/** 格式化显示办结时限 */
const formatProcessDeadline = (row: any) => {
  const deadline = getProcessDeadline(row)
  return deadline ? deadline.format('YYYY-MM-DD HH:mm:ss') : '--'
}

/** 判断当前环节任务是否超期 (环节时限) */
const isTaskOverdue = (row: any) => {
  if (!row.dueDate) return false
  const now = dayjs()
  const due = dayjs(row.dueDate)
  return now.isAfter(due)
}

/** 判断整个办件流程是否超期 (办结时限) */
const isProcessOverdue = (row: any) => {
  const deadline = getProcessDeadline(row)
  if (!deadline) return false

  const now = dayjs()
  return now.isAfter(deadline)
}

const handleDone = () => {
  // TODO: 实现办结逻辑
  console.log('点击了办结')
}

/** 查询任务列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await TaskApi.getTaskTodoPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.pageNo = 1
  showPopover.value = false
  getList()
}

/** 重置按钮操作 */
const resetQuery = () => {
  queryFormRef.value.resetFields()
  handleQuery()
}

/** 处理审批按钮 */
const handleAudit = (row: any) => {
  push({
    name: 'BpmProcessInstanceDetail',
    query: {
      id: row.processInstance.id,
      taskId: row.id
    }
  })
}

onActivated(() => {
  getList()
})

/** 初始化 **/
onMounted(async () => {
  await getList()
  categoryList.value = await CategoryApi.getCategorySimpleList()
  // 获取流程定义列表
  processDefinitionList.value = await DefinitionApi.getSimpleProcessDefinitionList()
})
</script>
