import { defineStore } from 'pinia'
import { store } from '@/store'
import { getTaskCount, TaskCountVO } from '@/api/bpm/task'
import { ReceiveDocApi } from '@/api/bpm/receivedoc'
interface BpmState {
  taskCount: TaskCountVO
  receiveDocPendingCount: number
}

export const useBpmStore = defineStore('bpm', {
  state: (): BpmState => ({
    taskCount: {
      todoCount: 0,
      doneCount: 0,
      totalCount: 0
    },
    receiveDocPendingCount: 0
  }),
  getters: {
    getTodoCount(): number {
      return this.taskCount.todoCount
    },
    getTotalCount(): number {
      return this.taskCount.totalCount
    }
  },
  actions: {
    async updateTaskCount() {
      try {
        const res = await getTaskCount()
        if (res) {
          this.taskCount = res
        }
      } catch (error) {
        console.error('获取BPM任务数量失败:', error)
      }
    },
    async updateReceiveDocPendingCount() {
      try {
        const res = await ReceiveDocApi.getPendingCount()
        if (res !== undefined && res !== null) {
          this.receiveDocPendingCount = res
        }
      } catch (error) {
        console.error('获取待收文数量失败:', error)
      }
    }
  }
})

export const useBpmStoreWithOut = () => {
  return useBpmStore(store)
}
