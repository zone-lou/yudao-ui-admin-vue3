import { ElMessageBox } from 'element-plus'
import { useMessage } from '@/hooks/web/useMessage'

/**
 * 封装通用的 BPM 流程作废逻辑
 * @param apiMethod 具体的后端 API 调用方法 (例如: leaveApi.deleteleave)
 * @param onSuccess 作废成功后的回调函数 (例如: 刷新列表 getList)
 */
export function useBpmInvalidate(apiMethod: Function, onSuccess?: Function) {
  const message = useMessage()

  /**
   * 单个作废
   * @param id 业务单据主键 ID
   */
  const handleInvalidate = async (id: number) => {
    try {
      const { value } = await ElMessageBox.prompt('请输入作废原因', '作废提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/, // 防止只输入空格
        inputErrorMessage: '作废原因不能为空',
        type: 'warning'
      })

      // 调用接口，统一传递 id 和 reason
      await apiMethod({ id, reason: value })
      message.success('作废成功')

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('作废操作异常:', error)
      }
    }
  }

  /**
   * 批量作废
   * @param ids 业务单据主键 ID 数组
   */
  const handleBatchInvalidate = async (ids: number[]) => {
    if (!ids || ids.length === 0) {
      message.warning('请选择要作废的数据')
      return
    }
    try {
      const { value } = await ElMessageBox.prompt('请输入批量作废原因', '批量作废提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '作废原因不能为空',
        type: 'warning'
      })

      await apiMethod({ ids, reason: value })
      message.success('批量作废成功')

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量作废操作异常:', error)
      }
    }
  }

  return { handleInvalidate, handleBatchInvalidate }
}
