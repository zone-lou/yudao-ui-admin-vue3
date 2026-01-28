<template>
  <div class="error-container">
    <div class="error-content">
      <div class="icon-box">
        <svg viewBox="0 0 1024 1024" width="80" height="80">
          <path
            d="M512 64a448 448 0 1 1 0 896 448 448 0 0 1 0-896zm0 832a384 384 0 1 0 0-768 384 384 0 0 0 0 768zm-48-424a48 48 0 1 1 96 0v208a48 48 0 1 1-96 0V472zm48-152a56 56 0 1 1 0 112 56 56 0 0 1 0-112z"
            fill="#f56c6c"
          />
        </svg>
      </div>

      <h2 class="error-title">登录失败</h2>

      <p class="error-msg">{{ errorMsg }}</p>

      <div class="action-box">
        <el-button type="primary" @click="goLogin">返回登录页</el-button>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 定义错误码字典：后端传来的 code -> 前端展示的中文
const errorMap: Record<string, string> = {
  user_not_found: '未匹配到系统用户，请联系管理员开通权限',
  user_disabled: '您的账号已被禁用，无法登录',
  sso_error: '单点登录服务发生异常',
  token_invalid: '第三方Token无效或解析失败',
  no_ticket: '登录票据缺失，请重新从门户发起登录',
  exchange_failed: '票据兑换超时或失效，请重试',
  tenant_error: '租户信息匹配失败',
  default: '未知登录错误'
}

const errorMsg = computed(() => {
  const code = route.query.code as string
  return errorMap[code] || errorMap['default']
})

const goLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.error-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f6f8f9;
}
.error-content {
  background: white;
  padding: 40px 60px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  min-width: 400px;
}
.icon-box {
  margin-bottom: 20px;
}
.error-title {
  color: #303133;
  font-size: 24px;
  margin-bottom: 16px;
}
.error-msg {
  color: #606266;
  font-size: 16px;
  line-height: 1.5;
  margin-bottom: 30px;
}
</style>
