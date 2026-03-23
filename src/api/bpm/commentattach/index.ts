import request from '@/config/axios'

/** 评论附件信息 */
export interface CommentAttach {
          id: number; // 主键
          taskId: string; // 关联任务ID
          filepath: string; // 文件路径
          filename: string; // 文件名称
          fileextension: string; // 文件扩展名
          docType: string; // 文档类型
          docId: string; // 文档ID
          commentType: string; // 评论类型
  }

// 评论附件 API
export const CommentAttachApi = {
  // 查询评论附件分页
  getCommentAttachPage: async (params: any) => {
    return await request.get({ url: `/bpm/comment-attach/page`, params })
  },

  // 查询评论附件详情
  getCommentAttach: async (id: number) => {
    return await request.get({ url: `/bpm/comment-attach/get?id=` + id })
  },

  // 新增评论附件
  createCommentAttach: async (data: CommentAttach) => {
    return await request.post({ url: `/bpm/comment-attach/create`, data })
  },

  // 修改评论附件
  updateCommentAttach: async (data: CommentAttach) => {
    return await request.put({ url: `/bpm/comment-attach/update`, data })
  },

  // 删除评论附件
  deleteCommentAttach: async (id: number) => {
    return await request.delete({ url: `/bpm/comment-attach/delete?id=` + id })
  },

  /** 批量删除评论附件 */
  deleteCommentAttachList: async (ids: number[]) => {
    return await request.delete({ url: `/bpm/comment-attach/delete-list?ids=${ids.join(',')}` })
  },

  // 导出评论附件 Excel
  exportCommentAttach: async (params) => {
    return await request.download({ url: `/bpm/comment-attach/export-excel`, params })
  },

  //获取流程附件
  getAttachListByDoc: async (params: { docId: string; docType: string }) => {
    return await request.get({ url: `/bpm/comment-attach/list-by-doc`, params })
  },
}
