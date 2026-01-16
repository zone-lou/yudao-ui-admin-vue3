<template>
  <!--  <doc-alert title="审批通过、不通过、驳回" url="https://doc.iocoder.cn/bpm/task-todo-done/" />-->
  <!--  <doc-alert title="审批加签、减签" url="https://doc.iocoder.cn/bpm/sign/" />-->
  <!--  <doc-alert-->
  <!--    title="审批转办、委派、抄送"-->
  <!--    url="https://doc.iocoder.cn/bpm/task-delegation-and-cc/"-->
  <!--  />-->
  <!--  <doc-alert title="审批加签、减签" url="https://doc.iocoder.cn/bpm/sign/" />-->

  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      ref="queryFormRef"
      :inline="true"
      :model="queryParams"
      class="-mb-15px"
      label-width="68px"
    >
      <el-form-item label="" prop="name">
        <el-input
          v-model="queryParams.name"
          class="!w-240px"
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
      <el-form-item label="" prop="category" class="absolute right-130px">
        <el-select
          v-model="queryParams.category"
          placeholder="请选择流程分类"
          clearable
          class="!w-155px"
          @change="handleQuery"
        >
          <el-option
            v-for="category in categoryList"
            :key="category.code"
            :label="category.name"
            :value="category.code"
          />
        </el-select>
      </el-form-item>
      <!-- 高级筛选 -->
      <el-form-item class="absolute right-0">
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
          <el-form-item
            label="所属流程"
            class="font-bold"
            label-position="top"
            prop="processDefinitionKey"
          >
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
          <el-form-item label="发起时间" class="font-bold" label-position="top" prop="createTime">
            <el-date-picker
              v-model="queryParams.createTime"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="w-240px!"
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
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table v-loading="loading" :data="list">
      <!-- 1. 标签 (超时标识) -->
      <el-table-column label="标签" width="100" align="center">
        <template #default="scope">
          <el-tag :type="getTimeoutStatus(scope.row).type">
            {{ getTimeoutStatus(scope.row).label }}
          </el-tag>
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
          <el-tag v-else type="info">普通</el-tag>
        </template>
      </el-table-column>

      <!-- 3. 办件名称 (绑定 processInstance.name) -->
      <el-table-column
        align="center"
        label="办件名称"
        prop="processInstance.name"
        min-width="180"
      />

      <!-- 4. 办件编号 (已移除) -->

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
      <!-- <el-table-column label="办结时限" width="180" align="center" /> -->

      <!-- 9. 环节时限 (任务截止时间) -->
      <el-table-column
        :formatter="dateFormatter"
        align="center"
        label="环节时限"
        prop="dueDate"
        width="180"
      />

      <!-- 10. 状态 -->
      <el-table-column label="状态" align="center" width="100">
        <template #default="scope">
          <dict-tag :type="DICT_TYPE.BPM_TASK_STATUS" :value="scope.row.status" />
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
import { DICT_TYPE } from '@/utils/dict'

defineOptions({ name: 'BpmTodoTask' })

const { push } = useRouter() // 路由

/** 获取超时状态 */
const getTimeoutStatus = (row: any) => {
  if (!row.dueDate) {
    return { label: '待办', type: 'primary' }
  }
  const now = dayjs()
  const due = dayjs(row.dueDate)

  if (due.isBefore(now)) {
    return { label: '超时', type: 'danger' }
  } else if (due.diff(now, 'day', true) <= 3) {
    return { label: '临期', type: 'warning' }
  } else {
    return { label: '待办', type: 'primary' }
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
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const categoryList = ref<CategoryVO[]>([]) // 流程分类列表
const showPopover = ref(false) // 高级筛选是否展示

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
