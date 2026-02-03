<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="700px" append-to-body>
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="100px"
      v-loading="formLoading"
    >
      <el-row>
        <el-col :span="12">
          <el-form-item label="会议室">
            <el-input v-model="formData.roomName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="预约日期">
            <el-input v-model="formData.dateStr" disabled />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="预约人">
            <el-input v-model="formData.nickName" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="所属部门">
            <el-input v-model="formData.department" disabled />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row>
        <el-col :span="12">
          <el-form-item label="联系方式">
            <el-input v-model="formData.telephone" disabled />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="参加人数">
            <el-input-number
              v-model="formData.attendNumber"
              :min="1"
              controls-position="right"
              class="w-full"
              :disabled="!!formData.id"
              style="width: 100%"
            />
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="开始时间">
            <el-time-select
              v-model="formData.startTime"
              start="08:00"
              step="00:30"
              end="20:00"
              placeholder="开始"
              class="flex-1"
              :disabled="!!formData.id"
            />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="结束时间">
            <el-time-select
              v-model="formData.endTime"
              start="08:00"
              step="00:30"
              end="20:00"
              placeholder="结束"
              class="flex-1"
              :disabled="!!formData.id"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!--      <div v-if="formData.id" class="detail-info">-->
      <!--        <el-form-item label="预约人">-->
      <!--          <span class="text-gray-700">{{ formData.nickName }}</span>-->
      <!--          <span class="text-gray-400 text-xs ml-2">({{ formData.department }})</span>-->
      <!--        </el-form-item>-->
      <!--        <el-form-item label="联系电话">-->
      <!--          <span class="text-gray-700">{{ formData.telephone }}</span>-->
      <!--        </el-form-item>-->
      <!--      </div>-->

      <!--      <el-form-item label="时间段" required>-->
      <!--        <div class="flex gap-2 w-full">-->
      <!--          <el-time-select-->
      <!--            v-model="formData.startTime"-->
      <!--            start="08:00"-->
      <!--            step="00:30"-->
      <!--            end="20:00"-->
      <!--            placeholder="开始"-->
      <!--            class="flex-1"-->
      <!--            :disabled="!!formData.id"-->
      <!--          />-->
      <!--          <span class="text-gray-400 self-center">-</span>-->
      <!--          <el-time-select-->
      <!--            v-model="formData.endTime"-->
      <!--            start="08:00"-->
      <!--            step="00:30"-->
      <!--            end="20:00"-->
      <!--            placeholder="结束"-->
      <!--            class="flex-1"-->
      <!--            :disabled="!!formData.id"-->
      <!--          />-->
      <!--        </div>-->
      <!--      </el-form-item>-->

      <!--      <el-form-item label="参会人数" prop="attendNumber">-->
      <!--        <el-input-number-->
      <!--          v-model="formData.attendNumber"-->
      <!--          :min="1"-->
      <!--          controls-position="right"-->
      <!--          class="w-full"-->
      <!--          :disabled="!!formData.id"-->
      <!--        />-->
      <!--      </el-form-item>-->

      <el-form-item label="会议主题" prop="subject">
        <el-input
          type="textarea"
          :rows="3"
          v-model="formData.subject"
          placeholder="请输入会议主要内容"
          :disabled="!!formData.id"
        />
      </el-form-item>

      <!--      <div v-if="!formData.id" class="pl-12 text-gray-400 text-xs mb-4">-->
      <!--        <el-icon><InfoFilled /></el-icon> 预约人信息（姓名、部门、电话）将自动使用当前登录账号。-->
      <!--      </div>-->
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
        <el-button v-if="!formData.id" type="primary" @click="submitForm">确认预约</el-button>
        <el-button
          v-if="formData.id && formData.isMyBooking"
          type="danger"
          @click="handleDelete"
          class="ml-2"
          >撤销预约</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as BookingApi from '@/api/system/meeting'
import dayjs from 'dayjs'
import { useUserStore } from '@/store/modules/user'

const emit = defineEmits(['success'])
const userStore = useUserStore()
const dialogVisible = ref(false)
const dialogTitle = ref('')
const formLoading = ref(false)
const formRef = ref()

// 表单数据模型
const formData = ref({
  id: undefined as number | undefined,
  meetingRoomId: undefined as number | undefined,
  roomName: '',
  dateStr: '', // 辅助字段：2023-10-10
  startTime: '', // 辅助字段：09:00
  endTime: '', // 辅助字段：10:00
  subject: '',
  attendNumber: 1,
  // 详情字段
  nickName: '',
  department: '',
  telephone: '',
  isMyBooking: false
})

const formRules = reactive({
  subject: [{ required: true, message: '请输入会议主题', trigger: 'blur' }],
  attendNumber: [{ required: true, message: '请输入人数', trigger: 'blur' }]
})

/** 打开弹窗 */
const open = (bookingInfo: any) => {
  console.log(bookingInfo, '信息')
  dialogVisible.value = true
  resetForm()

  if (bookingInfo.id) {
    // === 查看详情/撤销模式 ===
    dialogTitle.value = '预约详情'
    formData.value.id = bookingInfo.id
    formData.value.meetingRoomId = bookingInfo.roomId // 注意：后端BookingDetail需返回roomId，或者从外层传入
    // 解析时间
    formData.value.dateStr = bookingInfo.startTime.split(' ')[0]
    formData.value.startTime = bookingInfo.startTime.split(' ')[1].substring(0, 5)
    formData.value.endTime = bookingInfo.endTime.split(' ')[1].substring(0, 5)

    formData.value.roomName = bookingInfo.roomName || '会议室' // 外层需要传入
    formData.value.subject = bookingInfo.meetingAbstract || bookingInfo.subject || ''
    formData.value.nickName = bookingInfo.nickName // 注意对应VO字段
    formData.value.department = bookingInfo.department || ''
    formData.value.telephone = bookingInfo.telephone || ''
    formData.value.isMyBooking = bookingInfo.isMyBooking
    // 如果详情里有更多字段，继续赋值...
  } else {
    // === 新增模式 ===
    const user = userStore.user || {}
    console.log(user, '用户信息')
    dialogTitle.value = '新增预约'
    formData.value.nickName = user.nickname || ''
    formData.value.telephone = user.mobile || ''
    // 部门通常是对象，需判空
    formData.value.department = user.deptName || ''
    formData.value.meetingRoomId = bookingInfo.roomId
    formData.value.roomName = bookingInfo.roomName
    formData.value.dateStr = bookingInfo.date
  }
}

/** 提交预约 */
const submitForm = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid: boolean) => {
    if (!valid) return

    // 校验时间
    if (!formData.value.startTime || !formData.value.endTime) {
      ElMessage.warning('请选择完整的时间段')
      return
    }

    // 拼接完整时间 YYYY-MM-DD HH:mm:ss
    const fullStart = `${formData.value.dateStr} ${formData.value.startTime}:00`
    const fullEnd = `${formData.value.dateStr} ${formData.value.endTime}:00`

    const startTimestamp = dayjs(fullStart).valueOf()
    const endTimestamp = dayjs(fullEnd).valueOf()

    const data = {
      meetingRoomId: formData.value.meetingRoomId!,
      meetingAbstract: formData.value.subject,
      attendNumber: formData.value.attendNumber,
      startTime: startTimestamp,
      endTime: endTimestamp
    }

    try {
      formLoading.value = true
      await BookingApi.MeetingApi.bookMeeting(data)
      ElMessage.success('预约成功')
      dialogVisible.value = false
      emit('success')
    } finally {
      formLoading.value = false
    }
  })
}

/** 撤销预约 */
const handleDelete = () => {
  ElMessageBox.confirm('确定要撤销该会议预约吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      await BookingApi.MeetingApi.deleteMeeting(formData.value.id!)
      ElMessage.success('撤销成功')
      dialogVisible.value = false
      emit('success')
    } catch {}
  })
}

const resetForm = () => {
  formData.value = {
    id: undefined,
    meetingRoomId: undefined,
    roomName: '',
    dateStr: '',
    startTime: '',
    endTime: '',
    subject: '',
    attendNumber: 1,
    nickName: '',
    department: '',
    telephone: '',
    isMyBooking: false
  }
}

defineExpose({ open })
</script>

<style scoped>
.detail-info {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 18px;
}
</style>
