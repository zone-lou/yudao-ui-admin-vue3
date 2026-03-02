<template>
  <Dialog v-model="dialogVisible" :title="dialogTitle" width="800px">
    <el-form
      ref="formRef"
      v-loading="formLoading"
      :model="formData"
      :rules="formRules"
      label-width="100px"
    >
      <el-form-item label="组名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入组名" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="formData.description" placeholder="请输入描述" type="textarea" />
      </el-form-item>

      <el-form-item label="成员" prop="userIds">
        <div class="custom-tree-transfer">
          <div class="transfer-panel left-panel">
            <div class="panel-header">可选成员</div>
            <div class="panel-body">
              <el-input
                v-model="filterText"
                placeholder="搜索部门或成员"
                clearable
                size="small"
                class="filter-input"
              />
              <el-tree
                ref="treeRef"
                :data="treeData"
                show-checkbox
                node-key="treeId"
                :props="{ label: 'label', children: 'children' }"
                :filter-node-method="filterNode"
                @check="handleTreeCheck"
                default-expand-all
                class="dept-tree"
              >
                <template #default="{ node, data }">
                  <span class="custom-tree-node">
                    <span v-if="data.isDept">📁 {{ node.label }}</span>
                    <span v-else>👤 {{ node.label }}</span>
                  </span>
                </template>
              </el-tree>
            </div>
          </div>

          <div class="transfer-center">
            <el-button type="primary" circle plain disabled>→</el-button>
          </div>

          <div class="transfer-panel right-panel">
            <div class="panel-header">已选成员 ({{ formData.userIds.length }})</div>
            <div class="panel-body">
              <div v-if="selectedTreeData.length === 0" class="empty-text">暂无数据</div>
              <el-tree
                v-else
                :data="selectedTreeData"
                node-key="treeId"
                :props="{ label: 'label', children: 'children' }"
                default-expand-all
                :expand-on-click-node="false"
                class="dept-tree"
              >
                <template #default="{ node, data }">
                  <div class="custom-tree-node right-tree-node">
                    <span class="node-label">
                      <span v-if="data.isDept">📁 {{ node.label }}</span>
                      <span v-else>👤 {{ node.label }}</span>
                    </span>
                    <el-button
                      v-if="!data.isDept"
                      type="danger"
                      link
                      size="small"
                      @click="removeSelectedUser(data)"
                    >
                      移除
                    </el-button>
                  </div>
                </template>
              </el-tree>
            </div>
          </div>
        </div>
      </el-form-item>

      <el-form-item label="状态" prop="status">
        <el-radio-group v-model="formData.status">
          <el-radio
            v-for="dict in getIntDictOptions(DICT_TYPE.COMMON_STATUS)"
            :key="dict.value"
            :value="dict.value"
          >
            {{ dict.label }}
          </el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button :disabled="formLoading" type="primary" @click="submitForm">确 定</el-button>
      <el-button @click="dialogVisible = false">取 消</el-button>
    </template>
  </Dialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from 'vue'
import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'
import { CommonStatusEnum } from '@/utils/constants'
import * as UserGroupApi from '@/api/bpm/userGroup'
import * as UserApi from '@/api/system/user'

defineOptions({ name: 'UserGroupForm' })

const { t } = useI18n()
const message = useMessage()

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formType = ref('')
const formData = ref({
  id: undefined,
  name: undefined,
  description: undefined,
  userIds: [] as number[],
  status: CommonStatusEnum.ENABLE
})
const formRules = reactive({
  name: [{ required: true, message: '组名不能为空', trigger: 'blur' }],
  description: [{ required: true, message: '描述不能为空', trigger: 'blur' }],
  userIds: [{ required: true, message: '成员不能为空', trigger: 'change' }],
  status: [{ required: true, message: '状态不能为空', trigger: 'blur' }]
})
const formRef = ref()

// 树形穿梭框相关变量
const treeRef = ref()
const treeData = ref<any[]>([]) // 左侧树形数据
const selectedTreeData = ref<any[]>([]) // 右侧已选的树形数据
const filterText = ref('')

/** 监听搜索框输入，触发左侧树形过滤 */
watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value) || (data.deptName && data.deptName.includes(value))
}

/** 将平铺的用户列表转换成树形结构（用于左侧） */
const buildTreeData = async () => {
  const users = await UserApi.getSimpleUserList()
  const deptMap = new Map()

  users.forEach((user) => {
    const deptId = user.deptId || 0
    const deptName = user.deptName || '无部门'
    const deptSort = user.deptSort ? Number(user.deptSort) : 99999

    if (!deptMap.has(deptId)) {
      deptMap.set(deptId, {
        treeId: `dept_${deptId}`,
        label: deptName,
        isDept: true,
        sort: deptSort,
        children: []
      })
    }

    deptMap.get(deptId).children.push({
      treeId: user.id,
      id: user.id,
      label: user.nickname,
      isDept: false,
      deptId: deptId,
      deptName: deptName,
      deptSort: deptSort
    })
  })

  const tree = Array.from(deptMap.values())
  tree.sort((a, b) => a.sort - b.sort)
  tree.forEach((dept) => {
    dept.children.sort((a: any, b: any) => a.label.localeCompare(b.label, 'zh-CN'))
  })
  treeData.value = tree
}

/** 动态生成右侧的树形数据 */
const updateSelectedTree = (users: any[]) => {
  const deptMap = new Map()

  users.forEach((user) => {
    const deptId = user.deptId
    const deptName = user.deptName

    if (!deptMap.has(deptId)) {
      deptMap.set(deptId, {
        treeId: `sel_dept_${deptId}`, // 区分左侧树节点的key
        label: deptName,
        isDept: true,
        sort: user.deptSort,
        children: []
      })
    }

    deptMap.get(deptId).children.push({
      ...user,
      treeId: `sel_user_${user.id}`
    })
  })

  const tree = Array.from(deptMap.values())
  tree.sort((a, b) => a.sort - b.sort)
  tree.forEach((dept) => {
    dept.children.sort((a: any, b: any) => a.label.localeCompare(b.label, 'zh-CN'))
  })
  selectedTreeData.value = tree
}

/** 处理左侧树的勾选事件 */
const handleTreeCheck = () => {
  const checkedNodes = treeRef.value.getCheckedNodes(false, false)
  const users = checkedNodes.filter((node: any) => !node.isDept)

  formData.value.userIds = users.map((u: any) => u.id)

  // 同步重构右侧的树
  updateSelectedTree(users)
}

/** 移除右侧树中的人员 */
const removeSelectedUser = (user: any) => {
  // 1. 取消左侧树对应人员的勾选 (这一步会自动处理父节点半选/全选状态)
  treeRef.value.setChecked(user.id, false, false)
  // 2. 重新触发一次更新逻辑，刷新数据
  handleTreeCheck()
}

/** 打开弹窗 */
const open = async (type: string, id?: number) => {
  dialogVisible.value = true
  dialogTitle.value = t('action.' + type)
  formType.value = type
  resetForm()

  await buildTreeData()

  if (id) {
    formLoading.value = true
    try {
      const data = await UserGroupApi.getUserGroup(id)
      formData.value = data

      nextTick(() => {
        if (data.userIds && data.userIds.length > 0) {
          // 回显勾选
          treeRef.value.setCheckedKeys(data.userIds)
          // 渲染右侧选中的树
          handleTreeCheck()
        }
      })
    } finally {
      formLoading.value = false
    }
  }
}
defineExpose({ open })

/** 提交表单 */
const emit = defineEmits(['success'])
const submitForm = async () => {
  if (!formRef.value) return
  const valid = await formRef.value.validate()
  if (!valid) return

  formLoading.value = true
  try {
    const data = formData.value as unknown as UserGroupApi.UserGroupVO
    if (formType.value === 'create') {
      await UserGroupApi.createUserGroup(data)
      message.success(t('common.createSuccess'))
    } else {
      await UserGroupApi.updateUserGroup(data)
      message.success(t('common.updateSuccess'))
    }
    dialogVisible.value = false
    emit('success')
  } finally {
    formLoading.value = false
  }
}

/** 重置表单 */
const resetForm = () => {
  formData.value = {
    id: undefined,
    name: undefined,
    description: undefined,
    userIds: [],
    status: CommonStatusEnum.ENABLE
  }
  selectedTreeData.value = []
  filterText.value = ''
  formRef.value?.resetFields()
  treeRef.value?.setCheckedKeys([])
}
</script>

<style scoped>
.custom-tree-transfer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 350px;
}

.transfer-panel {
  width: 45%;
  height: 100%;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

.panel-header {
  height: 40px;
  line-height: 40px;
  background: #f5f7fa;
  margin: 0;
  padding-left: 15px;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
  color: #303133;
  font-size: 14px;
}

.panel-body {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
}

.filter-input {
  margin-bottom: 10px;
}

.dept-tree {
  height: calc(100% - 42px);
  overflow-y: auto;
}

/* 为了使右侧的树节点可以占满全宽并将"移除"按钮顶到最右侧 */
:deep(.el-tree-node__content) {
  width: 100%;
}
.custom-tree-node {
  font-size: 14px;
}
.right-tree-node {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-right: 10px;
}
.node-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.transfer-center {
  width: 10%;
  display: flex;
  justify-content: center;
}

.empty-text {
  text-align: center;
  color: #909399;
  font-size: 14px;
  margin-top: 50px;
}
</style>
