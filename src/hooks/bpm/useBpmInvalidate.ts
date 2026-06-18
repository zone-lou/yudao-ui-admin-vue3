import { ElMessageBox } from 'element-plus'
import { useMessage } from '@/hooks/web/useMessage'

/**
 * 封装通用的 BPM 流程删除逻辑
 * @param apiMethod 具体的后端 API 调用方法 (例如: leaveApi.deleteleave)
 * @param onSuccess 删除成功后的回调函数 (例如: 刷新列表 getList)
 */
export function useBpmInvalidate(apiMethod: Function, onSuccess?: Function) {
  const message = useMessage()

  /**
   * 单个删除
   * @param id 业务单据主键 ID
   */
  const handleInvalidate = async (id: number) => {
    try {
      const { value } = await ElMessageBox.prompt('请输入删除原因', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/, // 防止只输入空格
        inputErrorMessage: '删除原因不能为空',
        type: 'warning'
      })

      // 调用接口，统一传递 id 和 reason
      await apiMethod({ id, reason: value })
      message.success('删除成功')

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('删除操作异常:', error)
      }
    }
  }

  /**
   * 批量删除
   * @param ids 业务单据主键 ID 数组
   */
  const handleBatchInvalidate = async (ids: number[]) => {
    if (!ids || ids.length === 0) {
      message.warning('请选择要删除的数据')
      return
    }
    try {
      const { value } = await ElMessageBox.prompt('请输入批量删除原因', '批量删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        inputPattern: /\S/,
        inputErrorMessage: '删除原因不能为空',
        type: 'warning'
      })

      await apiMethod({ ids, reason: value })
      message.success('批量删除成功')

      if (onSuccess) {
        onSuccess()
      }
    } catch (error) {
      if (error !== 'cancel') {
        console.error('批量删除操作异常:', error)
      }
    }
  }

  return { handleInvalidate, handleBatchInvalidate }
}
