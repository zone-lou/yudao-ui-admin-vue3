<template>
  <el-form
    v-show="getShow"
    ref="formSmsLogin"
    :model="loginData.loginForm"
    :rules="rules"
    class="login-form"
    label-position="top"
    label-width="120px"
    size="large"
  >
    <el-row class="mx-[-10px]">
      <!-- 登录标题 -->
      <el-col :span="24" class="px-10px">
        <el-form-item>
          <LoginFormTitle class="w-full" />
        </el-form-item>
      </el-col>
      <!-- 用户名 -->
      <el-col :span="24" class="px-10px">
        <el-form-item prop="username">
          <el-input
            v-model="loginData.loginForm.username"
            :placeholder="t('login.usernamePlaceholder')"
            :prefix-icon="iconAvatar"
          />
        </el-form-item>
      </el-col>
      <!-- 验证码 -->
      <el-col :span="24" class="px-10px">
        <el-form-item prop="code">
          <el-row :gutter="5" justify="space-between" style="width: 100%">
            <el-col :span="24">
              <el-input
                v-model="loginData.loginForm.code"
                :placeholder="t('login.codePlaceholder')"
                :prefix-icon="iconCircleCheck"
              >
                <!-- <el-button class="w-[100%]"> -->
                <template #append>
                  <el-button
                    :disabled="mobileCodeTimer > 0"
                    :loading="smsSending"
                    @click="getSmsCode"
                  >
                    {{ mobileCodeTimer > 0 ? `${mobileCodeTimer}秒后可重新获取` : t('login.getSmsCode') }}
                  </el-button>
                </template>
              </el-input>
              <!-- </el-button> -->
            </el-col>
          </el-row>
        </el-form-item>
      </el-col>
      <!-- 登录按钮 -->
      <el-col :span="24" class="px-10px">
        <el-form-item>
          <XButton
            :loading="loginLoading"
            :title="t('login.login')"
            class="w-full"
            type="primary"
            @click="signIn()"
          />
        </el-form-item>
      </el-col>
    </el-row>
  </el-form>
</template>
<script lang="ts" setup>
import type { RouteLocationNormalizedLoaded } from 'vue-router'

import { useIcon } from '@/hooks/web/useIcon'

import { setTenantId, setToken } from '@/utils/auth'
import { getTenantIdByName, sendSmsCode, smsLogin } from '@/api/login'
import LoginFormTitle from './LoginFormTitle.vue'
import { LoginStateEnum, useFormValid, useLoginState } from './useLogin'
import { ElLoading } from 'element-plus'

defineOptions({ name: 'MobileForm' })

const { t } = useI18n()
const message = useMessage()
const { currentRoute, push } = useRouter()
const formSmsLogin = ref()
const loginLoading = ref(false)
const iconAvatar = useIcon({ icon: 'ep:avatar' })
const iconCircleCheck = useIcon({ icon: 'ep:circle-check' })
const { validForm } = useFormValid(formSmsLogin)
const { getLoginState } = useLoginState()
const getShow = computed(() => unref(getLoginState) === LoginStateEnum.MOBILE)

const rules = {
  username: [required],
  code: [required]
}
const loginData = reactive({
  codeImg: '',
  tenantEnable: import.meta.env.VITE_APP_TENANT_ENABLE,
  token: '',
  loading: {
    signIn: false
  },
  loginForm: {
    uuid: '',
    username: '',
    code: ''
  }
})
const smsVO = reactive({
  smsCode: {
    username: '',
    scene: 21
  },
  loginSms: {
    username: '',
    code: ''
  }
})
const mobileCodeTimer = ref(0)
const redirect = ref<string>('')
const smsSending = ref(false)
let smsTimer: ReturnType<typeof setInterval> | undefined
onBeforeUnmount(() => clearInterval(smsTimer))
const getSmsCode = async () => {
  if (smsSending.value || mobileCodeTimer.value > 0) return
  smsSending.value = true
  try {
    await formSmsLogin.value.validateField('username')
    await getTenantId()
    smsVO.smsCode.username = loginData.loginForm.username
    await sendSmsCode(smsVO.smsCode)
    message.success('验证码已发送至该账号的接收手机号')
    mobileCodeTimer.value = 60
    smsTimer = setInterval(() => {
      mobileCodeTimer.value -= 1
      if (mobileCodeTimer.value <= 0) clearInterval(smsTimer)
    }, 1000)
  } catch {
    // 表单校验和请求拦截器负责显示错误
  } finally {
    smsSending.value = false
  }
}
watch(
  () => currentRoute.value,
  (route: RouteLocationNormalizedLoaded) => {
    redirect.value = route?.query?.redirect as string
  },
  {
    immediate: true
  }
)
// 获取租户 ID
const getTenantId = async () => {
  if (loginData.tenantEnable === 'true') {
    const res = await getTenantIdByName('芋道源码')
    setTenantId(res)
  }
}
// 登录
const signIn = async () => {
  if (loginLoading.value) return
  const data = await validForm()
  if (!data) return
  loginLoading.value = true
  const loadingInstance = ElLoading.service({
    lock: true,
    text: '正在加载系统中...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  try {
    await getTenantId()
    smsVO.loginSms.username = loginData.loginForm.username
    smsVO.loginSms.code = loginData.loginForm.code
    const res = await smsLogin(smsVO.loginSms)
    setToken(res)
    await push({ path: redirect.value || '/' })
  } catch {
    // 请求拦截器负责显示错误
  } finally {
    loginLoading.value = false
    loadingInstance.close()
  }
}
</script>

<style lang="scss" scoped>
:deep(.anticon) {
  &:hover {
    color: var(--el-color-primary) !important;
  }
}

.smsbtn {
  margin-top: 33px;
}
</style>
