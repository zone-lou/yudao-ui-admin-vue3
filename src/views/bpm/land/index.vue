<template>
  <ContentWrap>
    <el-form :ref="setQueryFormRef" :model="queryParams" :inline="true" label-width="90px">
      <el-form-item label="项目名称" prop="projectName">
        <el-input
          v-model="queryParams.projectName"
          placeholder="请输入项目名称"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="坐落" prop="location">
        <el-input
          v-model="queryParams.location"
          placeholder="请输入坐落"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="发起人" prop="startUserName">
        <el-input
          v-model="queryParams.startUserName"
          placeholder="请输入发起人"
          clearable
          class="!w-240px"
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item label="办理状态" prop="status">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择办理状态"
          clearable
          class="!w-240px"
        >
          <el-option
            v-for="item in getBusinessStatusOptions()"
            :key="item.value"
            :label="item.label"
            :value="Number(item.value)"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="登记时间" prop="applyDate">
        <el-date-picker
          v-model="queryParams.applyDate"
          type="daterange"
          value-format="YYYY-MM-DD HH:mm:ss"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :default-time="[new Date('2000-01-01 00:00:00'), new Date('2000-01-01 23:59:59')]"
          :shortcuts="defaultShortcuts"
          class="!w-240px"
        />
      </el-form-item>
    </el-form>
    <div class="flex justify-end">
      <el-button @click="resetQuery"><Icon icon="ep:refresh" class="mr-5px" />重置</el-button>
      <el-button type="primary" :loading="loading" @click="handleQuery"
        ><Icon icon="ep:search" class="mr-5px" />搜索</el-button
      >
    </div>
  </ContentWrap>
  <ContentWrap>
    <el-table v-loading="loading" :data="list" row-key="id" border stripe show-overflow-tooltip>
      <el-table-column type="index" label="序号" width="60" align="center" />
      <el-table-column label="项目名称" prop="projectName" min-width="220" />
      <el-table-column label="坐落" prop="location" min-width="220" />
      <el-table-column label="发起人" prop="startUserName" width="120" align="center" />
      <el-table-column label="发起科室" prop="deptName" min-width="150" align="center" />
      <el-table-column label="登记时间" prop="applyDate" width="180" align="center">
        <template #default="scope">{{ formatDate(scope.row.applyDate) }}</template>
      </el-table-column>
      <el-table-column label="办理状态" prop="status" width="110" align="center">
        <template #default="scope"
          ><dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status"
        /></template>
      </el-table-column>
      <el-table-column label="操作" width="210" align="center" fixed="right">
        <template #default="scope">
          <el-button
            v-hasPermi="['bpm:land:query']"
            link
            type="primary"
            :disabled="!scope.row.processInstanceId"
            @click="handleDetail(scope.row)"
            >详情</el-button
          >
          <el-button
            v-hasPermi="['bpm:land:update']"
            link
            type="warning"
            @click="handleUpdate(scope.row)"
            >修改</el-button
          >
          <el-button
            v-if="![4, 5].includes(Number(scope.row.status))"
            v-hasPermi="['bpm:land:delete']"
            link
            type="danger"
            @click="handleDelete(scope.row.id)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <Pagination
      v-model:page="queryParams.pageNo"
      v-model:limit="queryParams.pageSize"
      :total="total"
      @pagination="getList"
    />
  </ContentWrap>
</template>

<script setup lang="ts">
import { onActivated, onMounted, reactive, ref } from 'vue'
import type { ComponentPublicInstance } from 'vue'
import type { FormInstance } from 'element-plus'
import { useRouter } from 'vue-router'
import { landApi } from '@/api/bpm/land'
import type { LandPageItem, LandPageParams } from '@/api/bpm/land'
import { useBpmInvalidate } from '@/hooks/bpm/useBpmInvalidate'
import { useBpmPageSize } from '@/hooks/bpm/useBpmPageSize'
import { getBusinessStatusOptions } from '@/utils/businessStatus'
import { DICT_TYPE } from '@/utils/dict'
import { defaultShortcuts, formatDate } from '@/utils/formatTime'

defineOptions({ name: 'BpmLand' })
const router = useRouter()
const loading = ref(false)
const mounted = ref(false)
const list = ref<LandPageItem[]>([])
const total = ref(0)
const pageSize = useBpmPageSize('bpm:land:pageSize')
const queryParams = reactive({
  pageNo: 1,
  pageSize,
  projectName: '',
  location: '',
  startUserName: '',
  status: undefined as number | undefined,
  applyDate: [] as string[]
})
const queryFormRef = ref<FormInstance>()
const setQueryFormRef = (element: Element | ComponentPublicInstance | null) => {
  queryFormRef.value = element as FormInstance | undefined
}
// 忽略较早返回的请求，避免连续筛选时旧结果覆盖新列表。
let requestVersion = 0
const getList = async () => {
  const version = ++requestVersion
  loading.value = true
  try {
    const params: LandPageParams = { ...queryParams }
    const data = await landApi.getPage(params)
    if (version !== requestVersion) return
    list.value = data.list
    total.value = data.total
  } finally {
    if (version === requestVersion) loading.value = false
  }
}
const handleQuery = () => {
  queryParams.pageNo = 1
  getList()
}
const resetQuery = () => {
  queryFormRef.value?.resetFields()
  handleQuery()
}
const { handleInvalidate: handleDelete } = useBpmInvalidate(landApi.delete, getList)
const handleUpdate = (row: LandPageItem) => {
  router.push({ name: 'BpmLandCreate', query: { id: row.id } })
}
const handleDetail = (row: LandPageItem) => {
  if (!row.processInstanceId) return
  router.push({ name: 'BpmProcessInstanceDetail', query: { id: row.processInstanceId } })
}
onMounted(async () => {
  try {
    await getList()
  } finally {
    mounted.value = true
  }
})
onActivated(() => {
  if (mounted.value) getList()
})
</script>
