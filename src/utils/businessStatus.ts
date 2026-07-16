import { DICT_TYPE, getIntDictOptions } from '@/utils/dict'

/** 业务办理状态统一使用流程实例状态，只展示业务列表会出现的状态。 */
export const getBusinessStatusOptions = () =>
  getIntDictOptions(DICT_TYPE.BPM_PROCESS_INSTANCE_STATUS).filter((item) =>
    [0, 1, 2, 3, 4, 5].includes(Number(item.value))
  )
