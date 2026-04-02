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
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

// 完整的异常字典对照表
const errorMap: Record<string, string> = {
  // 原始系统前端错误
  user_not_found: '未匹配到系统用户，请联系管理员开通权限',
  user_disabled: '您的账号已被禁用，无法登录',
  no_ticket: '登录票据缺失，请重新从门户发起登录',
  exchange_failed: '票据兑换超时或失效，请重试',
  tenant_error: '租户信息匹配失败',

  // 后端 SSO 抛出的精准错误
  token_is_empty: '授权回调失败：缺少必要 Token',
  token_format_error: '授权回调失败：Token 格式非法',
  token_decode_error: '授权回调失败：Token 解析异常',
  phone_number_not_found: '登录失败：未能从授权信息中获取您的手机号，请联系系统管理员',
  user_create_failed: '登录失败：系统为您创建账号失败，请联系管理员',
  sso_exception: '单点登录服务发生未知异常，请稍后重试',

  default: '未知登录错误'
}

const errorMsg = computed(() => {
  const code = route.query.error as string
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
