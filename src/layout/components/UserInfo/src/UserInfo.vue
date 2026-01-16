<script lang="ts" setup>
import { ElMessageBox } from 'element-plus'

import avatarImg from '@/assets/imgs/avatar.gif'
import { useDesign } from '@/hooks/web/useDesign'
import { useTagsViewStore } from '@/store/modules/tagsView'
import { useUserStore } from '@/store/modules/user'
import LockDialog from './components/LockDialog.vue'
import LockPage from './components/LockPage.vue'
import { useLockStore } from '@/store/modules/lock'

defineOptions({ name: 'UserInfo' })

const { t } = useI18n()

const { push, replace } = useRouter()

const userStore = useUserStore()

const tagsViewStore = useTagsViewStore()

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('user-info')

const avatar = computed(() => userStore.user.avatar || avatarImg)
const userName = computed(() => userStore.user.nickname ?? 'Admin')

// 锁定屏幕
const lockStore = useLockStore()
const getIsLock = computed(() => lockStore.getLockInfo?.isLock ?? false)
const dialogVisible = ref<boolean>(false)
const lockScreen = () => {
  dialogVisible.value = true
}

const loginOut = async () => {
  try {
    await ElMessageBox.confirm(t('common.loginOutMessage'), t('common.reminder'), {
      confirmButtonText: t('common.ok'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
    await userStore.loginOut()
    tagsViewStore.delAllViews()
    replace('/login?redirect=/index')
  } catch {}
}
const toProfile = async () => {
  push('/user/profile')
}
const toDocument = () => {
  window.open('https://doc.iocoder.cn/')
}
</script>

<template>
  <ElDropdown class="custom-hover" :class="prefixCls" trigger="click">
    <div class="flex items-center">
      <!-- <ElAvatar :src="avatar" alt="" class="w-[calc(var(--logo-height)-25px)] rounded-[50%]" /> -->
      <span class="pl-[5px] text-14px text-[var(--top-header-text-color)] <lg:hidden">
        {{ userName }}
      </span>
    </div>

    <template #dropdown>
      <ElDropdownMenu>
        <ElDropdownItem>
          <Icon icon="ep:tools" />
          <div @click="toProfile">{{ t('common.profile') }}</div>
        </ElDropdownItem>

        <ElDropdownItem divided>
          <Icon icon="ep:lock" />
          <div @click="lockScreen">{{ t('lock.lockScreen') }}</div>
        </ElDropdownItem>
        <!-- <ElDropdownItem divided @click="loginOut">
          <Icon icon="ep:switch-button" />
          <div>{{ t('common.loginOut') }}</div>
        </ElDropdownItem> -->
      </ElDropdownMenu>
    </template>
  </ElDropdown>
  <div class="custom-hover logout-btn" @click="loginOut">
    <Icon icon="ep:switch-button" style="color: white" />
  </div>

  <LockDialog v-if="dialogVisible" v-model="dialogVisible" />

  <teleport to="body">
    <transition name="fade-bottom" mode="out-in">
      <LockPage v-if="getIsLock" />
    </transition>
  </teleport>
</template>

<style scoped lang="scss">
.fade-bottom-enter-active,
.fade-bottom-leave-active {
  transition:
    opacity 0.25s,
    transform 0.3s;
}

.fade-bottom-enter-from {
  opacity: 0;
  transform: translateY(-10%);
}

.fade-bottom-leave-to {
  opacity: 0;
  transform: translateY(10%);
}

.logout-btn {
  position: relative;

  &::before {
    position: absolute;
    top: 50%;
    left: 0;
    width: 1px; // 边框线宽度
    height: 20px; // 边框线高度，可根据需要调整
    background-color: white;
    border-radius: 1px; // 可选，使边框线更圆润
    content: '';
    transform: translateY(-50%);
  }
}
</style>
