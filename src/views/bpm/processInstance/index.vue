<template>
  <doc-alert title="流程发起、取消、重新发起" url="https://doc.iocoder.cn/bpm/process-instance/" />

  <ContentWrap>
    <!-- 搜索工作栏 -->
    <el-form
      class="-mb-15px"
      :model="queryParams"
      ref="queryFormRef"
      :inline="true"
      label-width="auto"
    >
      <el-form-item label="" prop="name">
        <el-input
          v-model="queryParams.name"
          placeholder="请输入流程名称"
          clearable
          @keyup.enter="handleQuery"
          class="!w-240px"
        />
      </el-form-item>

      <el-form-item>
        <el-button @click="handleQuery"><Icon icon="ep:search" class="mr-5px" /> 搜索</el-button>
      </el-form-item>

      <el-form-item label="" prop="category" class="absolute right-[300px]">
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
      <el-form-item label="" prop="status" class="absolute right-[130px]">
        <el-select
          v-model="queryParams.status"
          placeholder="请选择流程状态"
          clearable
          class="!w-155px"
          @change="handleQuery"
        >
          <el-option
            v-for="dict in getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS)"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
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
              placeholder="请选择办件类型"
              clearable
              class="!w-390px"
              @change="handleQuery"
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
              class="!w-240px"
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
    <div class="mb-15px flex items-center justify-end gap-8px">
      <BpmColumnSetting
        v-model="checkedColumnKeys"
        :columns="columnOptions"
        @reset="resetColumns"
      />
    </div>
    <el-table v-loading="loading" :data="list">
      <el-table-column type="index" label="序号" width="60" align="center" fixed="left" />
      <el-table-column v-if="visibleColumn('name')" label="流程名称" align="center" prop="name" min-width="200px" fixed="left" />
      <el-table-column v-if="visibleColumn('summary')" label="摘要" prop="summary" width="180" fixed="left">
        <template #default="scope">
          <div class="flex flex-col" v-if="scope.row.summary && scope.row.summary.length > 0">
            <div v-for="(item, index) in scope.row.summary" :key="index">
              <el-text type="info"> {{ item.key }} : {{ item.value }} </el-text>
            </div>
          </div>
        </template>
      </el-table-column>
      <el-table-column
        v-if="visibleColumn('categoryName')"
        label="流程分类"
        align="center"
        prop="categoryName"
        min-width="100"
        fixed="left"
      />
      <el-table-column v-if="visibleColumn('status')" label="流程状态" prop="status" min-width="200">
        <template #default="scope">
          <!-- 办理中状态 -->
          <template
            v-if="
              scope.row.status === BpmProcessInstanceStatus.RUNNING && scope.row.tasks?.length > 0
            "
          >
            <!-- 单人办理 -->
            <template v-if="scope.row.tasks.length === 1">
              <span>
                <el-button link type="primary" @click="handleDetail(scope.row)">
                  {{ scope.row.tasks[0].assigneeUser?.nickname }}
                </el-button>
                ({{ scope.row.tasks[0].name }}) 办理中
              </span>
            </template>
            <!-- 多人办理 -->
            <template v-else>
              <span>
                <el-button link type="primary" @click="handleDetail(scope.row)">
                  {{ scope.row.tasks[0].assigneeUser?.nickname }}
                </el-button>
                等 {{ scope.row.tasks.length }} 人 ({{ scope.row.tasks[0].name }})办理中
              </span>
            </template>
          </template>
          <!-- 非办理中状态 -->
          <template v-else>
            <dict-tag :type="DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS" :value="scope.row.status" />
          </template>
        </template>
      </el-table-column>
      <el-table-column
        v-if="visibleColumn('startTime')"
        label="发起时间"
        align="center"
        prop="startTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column
        v-if="visibleColumn('endTime')"
        label="结束时间"
        align="center"
        prop="endTime"
        width="180"
        :formatter="dateFormatter"
      />
      <el-table-column v-if="visibleColumn('businessKey')" label="业务编号" align="center" prop="businessKey" min-width="120" show-overflow-tooltip />
      <el-table-column v-if="visibleColumn('startUser')" label="发起人" align="center" prop="startUser.nickname" width="120" />
      <el-table-column v-if="visibleColumn('startDept')" label="发起部门" align="center" prop="startUser.deptName" min-width="140" show-overflow-tooltip />
      <el-table-column v-if="visibleColumn('processDefinitionId')" label="流程定义编号" align="center" prop="processDefinitionId" min-width="220" show-overflow-tooltip />
      <el-table-column v-if="visibleColumn('processDefinitionKey')" label="流程定义Key" align="center" prop="processDefinition.key" min-width="160" show-overflow-tooltip />
      <el-table-column v-if="visibleColumn('durationInMillis')" label="耗时(ms)" align="center" prop="durationInMillis" width="120" />
      <el-table-column label="操作" align="center" fixed="right" width="180">
        <template #default="scope">
          <el-button
            link
            type="primary"
            v-hasPermi="['bpm:process-instance:cancel']"
            @click="handleDetail(scope.row)"
          >
            详情
          </el-button>
          <el-button
            link
            type="primary"
            v-if="scope.row.status === 1"
            v-hasPermi="['bpm:process-instance:query']"
            @click="handleCancel(scope.row)"
          >
            取消
          </el-button>
          <el-button link type="primary" v-else @click="handleCreate(scope.row)">
            重新发起
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
</template>
<script lang="ts" setup>
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { dateFormatter } from '@/utils/formatTime'
import { ElMessageBox } from 'element-plus'
import * as ProcessInstanceApi from '@/api/bpm/processInstance'
import { CategoryApi, CategoryVO } from '@/api/bpm/category'
import { ProcessInstanceVO } from '@/api/bpm/processInstance'
import * as DefinitionApi from '@/api/bpm/definition'
import { BpmProcessInstanceStatus } from '@/utils/constants'
import BpmColumnSetting from '@/views/bpm/components/BpmColumnSetting.vue'
import { useBpmColumnSetting } from '@/hooks/bpm/useBpmColumnSetting'

defineOptions({ name: 'BpmProcessInstanceMy' })

const router = useRouter() // 路由
const message = useMessage() // 消息弹窗
const { t } = useI18n() // 国际化

const loading = ref(true) // 列表的加载中
const total = ref(0) // 列表的总页数
const list = ref([]) // 列表的数据
const processDefinitionList = ref<any[]>([]) // 流程定义列表
const queryParams = reactive({
  pageNo: 1,
  pageSize: 10,
  name: '',
  processDefinitionKey: undefined,
  category: undefined,
  status: undefined,
  createTime: []
})
const queryFormRef = ref() // 搜索的表单
const categoryList = ref<CategoryVO[]>([]) // 流程分类列表
const showPopover = ref(false) // 高级筛选是否展示
const { columnOptions, checkedColumnKeys, visibleColumn, resetColumns } = useBpmColumnSetting(
  'bpm:process-instance:my:columns',
  [
    { key: 'name', label: '流程名称' },
    { key: 'summary', label: '摘要' },
    { key: 'categoryName', label: '流程分类' },
    { key: 'status', label: '流程状态' },
    { key: 'startTime', label: '发起时间' },
    { key: 'endTime', label: '结束时间' },
    { key: 'businessKey', label: '业务编号' },
    { key: 'startUser', label: '发起人' },
    { key: 'startDept', label: '发起部门' },
    { key: 'processDefinitionId', label: '流程定义编号' },
    { key: 'processDefinitionKey', label: '流程定义Key' },
    { key: 'durationInMillis', label: '耗时(ms)' }
  ],
  ['name', 'summary', 'categoryName', 'status', 'startTime', 'endTime']
)

/** 查询列表 */
const getList = async () => {
  loading.value = true
  try {
    const data = await ProcessInstanceApi.getProcessInstanceMyPage(queryParams)
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

/** 发起流程操作 **/
const handleCreate = async (row?: ProcessInstanceVO) => {
  // 如果是【业务表单】，不支持重新发起
  if (row?.id) {
    const processDefinitionDetail = await DefinitionApi.getProcessDefinition(
      row.processDefinitionId
    )
    if (processDefinitionDetail.formType === 20) {
      message.error('重新发起流程失败，原因：该流程使用业务表单，不支持重新发起')
      return
    }
  }
  // 跳转发起流程界面
  await router.push({
    name: 'BpmProcessInstanceCreate',
    query: { processInstanceId: row?.id }
  })
}

/** 查看详情 */
const handleDetail = (row: ProcessInstanceVO) => {
  router.push({
    name: 'BpmProcessInstanceDetail',
    query: {
      id: row.id
    }
  })
}

/** 取消按钮操作 */
const handleCancel = async (row: ProcessInstanceVO) => {
  // 二次确认
  const { value } = await ElMessageBox.prompt('请输入取消原因', '取消流程', {
    confirmButtonText: t('common.ok'),
    cancelButtonText: t('common.cancel'),
    inputPattern: /^[\s\S]*.*\S[\s\S]*$/, // 判断非空，且非空格
    inputErrorMessage: '取消原因不能为空'
  })
  // 发起取消
  await ProcessInstanceApi.cancelProcessInstanceByStartUser(row.id, value)
  message.success('取消成功')
  // 刷新列表
  await getList()
}

/** 激活时 **/
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
