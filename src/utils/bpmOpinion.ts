/** 展示批量办结的默认意见，保留原始记录和自定义意见。 */
export const formatTaskOpinion = (reason?: string | null): string => {
  return reason?.trim() === '批量办结' ? '已阅。' : reason || ''
}
