<template>
  <div class="sso-container">
    <div class="loading-box">
      <div class="loader"></div>
      <p>正在进行安全登录认证，请稍候...</p>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ssoExchangeApi } from '@/api/login' // 引入刚才定义的API
import * as authUtil from '@/utils/auth'

const router = useRouter()
const route = useRoute()
// const userStore = useUserStore()

onMounted(async () => {
  // 1. 获取 URL 中的 ticket 参数
  const ticket = route.query.ticket as string

  if (!ticket) {
    console.error('未找到 Ticket')
    router.push('/sso-error?code=no_ticket')
    return
  }

  try {
    // 2. 调用后端接口，用 Ticket 换取 Token
    const res = await ssoExchangeApi(ticket)

    // 假设 res 已经被响应拦截器处理过，直接返回了 data 部分
    // 如果没有，可能需要 res.data
    const data = res

    console.log('SSO 换票成功', data)

    authUtil.setToken(data)

    // 4. (可选) 获取用户信息，确保 Store 状态同步
    // await userStore.getInfo()

    // 5. 登录成功，跳转首页
    router.push({ path: '/' })
  } catch (error) {
    console.error('SSO 登录失败', error)
    // 失败跳回登录页，并显示错误
    router.push('/sso-error?code=exchange_failed')
  }
})
</script>

<style scoped>
.sso-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}
.loading-box {
  text-align: center;
}
/* 简单的 CSS Loader */
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
