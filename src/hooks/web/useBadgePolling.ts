import { onMounted, onUnmounted, watch } from 'vue'

// 等待请求结束后再轮询，隐藏页面、断网或退出登录时暂停。
export const useBadgePolling = (
  task: () => Promise<boolean | void>,
  interval: number,
  enabled: () => boolean
) => {
  let timer: ReturnType<typeof setTimeout> | undefined
  let mounted = false
  let running = false
  let failures = 0
  let retryAt = 0

  const clearTimer = () => {
    if (timer !== undefined) {
      clearTimeout(timer)
      timer = undefined
    }
  }

  const canPoll = () => mounted && enabled() && !document.hidden && navigator.onLine

  const schedule = (delay: number) => {
    clearTimer()
    if (canPoll()) {
      timer = setTimeout(() => void refresh(), delay)
    }
  }

  const refresh = async () => {
    clearTimer()
    if (!canPoll() || running) return
    if (Date.now() < retryAt) {
      schedule(retryAt - Date.now())
      return
    }

    running = true
    try {
      if ((await task()) === false) {
        failures = Math.min(failures + 1, 4)
      } else {
        failures = 0
      }
    } catch {
      // 请求层负责错误提示；轮询保留原角标，并延长重试间隔。
      failures = Math.min(failures + 1, 4)
    } finally {
      running = false
      if (mounted && enabled()) {
        const delay = Math.min(interval * 2 ** failures, 15 * 60 * 1000)
        // 少量随机延迟，分散同时打开页面产生的集中请求。
        const nextDelay = Math.min(
          delay + Math.floor(Math.random() * interval * 0.1),
          15 * 60 * 1000
        )
        retryAt = failures > 0 ? Date.now() + nextDelay : 0
        schedule(nextDelay)
      }
    }
  }

  const resume = () => {
    if (canPoll()) {
      void refresh()
    } else {
      clearTimer()
    }
  }

  watch(enabled, (value) => {
    clearTimer()
    failures = 0
    retryAt = 0
    if (value) resume()
  })

  onMounted(() => {
    mounted = true
    document.addEventListener('visibilitychange', resume)
    window.addEventListener('online', resume)
    window.addEventListener('offline', resume)
    resume()
  })

  onUnmounted(() => {
    mounted = false
    clearTimer()
    document.removeEventListener('visibilitychange', resume)
    window.removeEventListener('online', resume)
    window.removeEventListener('offline', resume)
  })
}
