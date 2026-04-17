<template>
  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="auto"
    >
      <el-row :gutter="20">
        <el-col :span="6">
          <el-form-item label="申请人" prop="userName">
            <el-input
              v-model="queryParams.userName"
              placeholder="请输入申请人"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            /> </el-form-item
        ></el-col>
        <el-col :span="6">
          <el-form-item label="参会科室" prop="deptName">
            <el-input
              v-model="queryParams.deptName"
              placeholder="请输入申请部门"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            /> </el-form-item
        ></el-col>
        <el-col :span="6">
          <el-form-item label="会议时间" prop="startDate">
            <el-date-picker
              v-model="queryParams.startDate"
              value-format="YYYY-MM-DD HH:mm:ss"
              type="daterange"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :default-time="[new Date('1 00:00:00'), new Date('1 23:59:59')]"
              class="!w-240px"
            /> </el-form-item
        ></el-col>
        <el-col :span="6">
          <el-form-item label="会议地点" prop="venue">
            <el-input
              v-model="queryParams.venue"
              placeholder="请输入会议地点"
              clearable
              @keyup.enter="handleQuery"
              class="!w-240px"
            />
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
    <el-col :span="24" class="text-right" style="margin-top: 10px">
      <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" />查询</el-button>
      <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
    </el-col>
  </ContentWrap>

  <!-- 列表 -->
  <ContentWrap>
    <el-table
      row-key="id"
      v-loading="loading"
      :data="list"
      :stripe="true"
      :show-overflow-tooltip="true"
      @selection-change="handleRowCheckboxChange"
    >
      <el-table-column type="selection" width="55" />
      <!--      <el-table-column label="申请人" align="center" prop="userName" />-->
      <!--      <el-table-column label="申请人部门" align="center" prop="deptName" />-->

      <el-table-column label="会议名称" align="center" prop="title" />
      <el-table-column label="提议内容" align="center" prop="content" />
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="会议地点" align="center" prop="venue" />
      <el-table-column label="我局参会科室" align="center" prop="offerUnit" />
      <el-table-column label="我局参会人员" align="center" prop="offerPerson" />
      <el-table-column
        label="申请日期"
        align="center"
        prop="applyDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column
        label="会议时间"
        align="center"
        prop="startDate"
        :formatter="dateFormatter"
        width="180px"
      />
      <el-table-column label="办理状态" align="center" prop="status">
        <template #default="scope">
          <div class="flex items-center justify-center">
            <dict-tag
              class="ml-2"
              :type="DICT_TYPE.BPM_TASK_STATUS"
              :value="scope.row.status !== null ? scope.row.status : 0"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" min-width="120px">
        <template #default="scope">
          <el-button
            link
            type="primary"
            @click="openForm('update', scope.row.id)"
            v-hasPermi="['bpm:confflow:update']"
          >
            编辑
          </el-button>
          <el-button
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            v-if="!['4', '5', 4, 5].includes(scope.row.status)"
            v-hasPermi="['bpm:confflow:delete']"
          >
            作废
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <Pagination
      :total="total"
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />
  </ContentWrap>

  <!-- 表单弹窗：添加/修改 -->
  <ConfflowForm ref="formRef" @success="getList" />
</template>

<script setup lang="ts">
import { dateFormatter } from '@/utils/formatTime'
import { ConfflowApi, Confflow } from '@/api/bpm/confflow'
import ConfflowForm from './ConfflowForm.vue'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'
import { DICT_TYPE } from '@/utils/dict'

/** 会议报告单 列表 */
defineOptions({ name: 'Confflow' })

const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const list = ref<Confflow[]>([]) // 列表的数据
const total = ref(0) // 列表的总页数
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  userId: undefined,
  userName: undefined,
  deptId: undefined,
  deptName: undefined,
  applyDate: [],
  startDate: [],
  content: undefined,
  remark: undefined,
  venue: undefined
})
const queryFormRef = ref() // 搜索的表单

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ConfflowApi.getConfflowPage(queryParams)
    list.value = data.list
    total.value = data.total
  } finally {
    loading.value = false
  }
}

const { handleInvalidate: handleDelete } = useBpmInvalidate(ConfflowApi.deleteConfflow, getList)

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

/** 添加/修改操作 */
const formRef = ref()
const openForm = (type: string, id?: number) => {
  formRef.value.open(type, id)
}

const checkedIds = ref<number[]>([])
const handleRowCheckboxChange = (records: Confflow[]) => {
  checkedIds.value = records.map((item) => item.id!)
}

/** 初始化 **/
onMounted(() => {
  getList()
})
</script>
