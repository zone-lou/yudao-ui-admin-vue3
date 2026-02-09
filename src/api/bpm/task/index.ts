import request from '@/config/axios'

/**
 * 任务状态枚举
 */
export enum TaskStatusEnum {
  /**
   * 跳过
   */
  SKIP = -2,
  /**
   * 未开始
   */
  NOT_START = -1,

  /**
   * 待审批
   */
  WAIT = 0,
  /**
   * 审批中
   */
  RUNNING = 1,
  /**
   * 审批通过
   */
  APPROVE = 2,

  /**
   * 审批不通过
   */
  REJECT = 3,

  /**
   * 已取消
   */
  CANCEL = 4,
  /**
   * 已退回
   */
  RETURN = 5,
  /**
   * 审批通过中
   */
  APPROVING = 7
}

export enum TraceTypeEnum {
  PREV = 1, // 查前置 (来源)
  NEXT = 2 // 查后置 (去向)
}

export interface TaskCountVO {
  todoCount: number
  doneCount: number
  totalCount: number
}

export const getTaskTodoPage = async (params: any) => {
  return await request.get({ url: '/bpm/task/todo-page', params })
}

export const getTaskDonePage = async (params: any) => {
  return await request.get({ url: '/bpm/task/done-page', params })
}

export const getTaskManagerPage = async (params: any) => {
  return await request.get({ url: '/bpm/task/manager-page', params })
}

export const approveTask = async (data: any) => {
  return await request.put({ url: '/bpm/task/approve', data })
}

export const rejectTask = async (data: any) => {
  return await request.put({ url: '/bpm/task/reject', data })
}

export const getTaskListByProcessInstanceId = async (processInstanceId: string) => {
  return await request.get({
    url: '/bpm/task/list-by-process-instance-id?processInstanceId=' + processInstanceId
  })
}

// 获取所有可退回的节点
export const getTaskListByReturn = async (id: string) => {
  return await request.get({ url: '/bpm/task/list-by-return', params: { id } })
}

// 退回
export const returnTask = async (data: any) => {
  return await request.put({ url: '/bpm/task/return', data })
}

// 委派
export const delegateTask = async (data: any) => {
  return await request.put({ url: '/bpm/task/delegate', data })
}

// 转派
export const transferTask = async (data: any) => {
  return await request.put({ url: '/bpm/task/transfer', data })
}

// 加签
export const signCreateTask = async (data: any) => {
  return await request.put({ url: '/bpm/task/create-sign', data })
}

// 减签
export const signDeleteTask = async (data: any) => {
  return await request.delete({ url: '/bpm/task/delete-sign', data })
}

// 抄送
export const copyTask = async (data: any) => {
  return await request.put({ url: '/bpm/task/copy', data })
}

// 撤回
export const withdrawTask = async (taskId: string) => {
  return await request.put({ url: '/bpm/task/withdraw', params: { taskId } })
}

// 获取我的待办任务
export const myTodoTask = async (processInstanceId: string) => {
  return await request.get({ url: '/bpm/task/my-todo?processInstanceId=' + processInstanceId })
}

// 获取减签任务列表
export const getChildrenTaskList = async (id: string) => {
  return await request.get({ url: '/bpm/task/list-by-parent-task-id?parentTaskId=' + id })
}


export const getTaskTrace = async (taskId: string, type: number, processInstanceId:string) => {
  return await request.get({
    // 注意：这里的路径要拼上你 Controller 类上的 @RequestMapping
    // 假设是 /bpm/task，如果不确定，请去后端 Controller 顶部看一眼
    url: '/bpm/task/trace/' + taskId,
    params: {
      type: type,
      processInstanceId: processInstanceId
    }
  })
}

export const getTaskCount = () => {
  return request.get<TaskCountVO>({ url: '/bpm/task/get-count' })
}
