<template>
  <el-config-provider :locale="i18nLocale">
    <router-view v-show="getThemeConfig.lockScreenTime !== 0" />

  </el-config-provider>
</template>

<script lang="ts">
import { defineComponent, computed, ref, getCurrentInstance, onBeforeMount, onMounted, onUnmounted, nextTick, watch, reactive, toRefs } from 'vue'
import { useRoute } from 'vue-router'
import { useStore } from '/@/store/index'
import { useTitle } from '/@/utils/setWebTitle'
import { Local } from '/@/utils/storage'
import setIntroduction from '/@/utils/setIconfont'

export default defineComponent({
  name: 'App',
  components: {},
  setup() {
    const { proxy } = getCurrentInstance() as any
    const settingsRef = ref()
    const route = useRoute()
    const store = useStore()
    const title = useTitle()
    const state = reactive({
      i18nLocale: null
    })
    // 获取布局配置信息
    const getThemeConfig = computed(() => {
      return store.state.themeConfig.themeConfig
    })
    // 布局配置弹窗打开
    const openSetingsDrawer = () => {
      settingsRef.value.openDrawer()
    }
    // 设置初始化，防止刷新时恢复默认
    onBeforeMount(() => {
      // 设置批量第三方 icon 图标
      setIntroduction.cssCdn()
      // 设置批量第三方 js
      setIntroduction.jsCdn()
    })
    // 页面加载
    onMounted(() => {
      nextTick(() => {
        // 监听布局配置弹窗点击打开
        proxy.mittBus.on('openSetingsDrawer', () => {
          openSetingsDrawer()
        })
        // 设置 i18n
        proxy.mittBus.on('getI18nConfig', (locale: any) => {
          state.i18nLocale = locale
        })
        // 获取缓存中的布局配置
        if (Local.get('themeConfig')) {
          store.dispatch('themeConfig/setThemeConfig', Local.get('themeConfig'))
          document.documentElement.style.cssText = Local.get('themeConfigStyle')
        }
      })
    })
    // 页面销毁
    onUnmounted(() => {
      proxy.mittBus.off('openSetingsDrawer', () => {})
      proxy.mittBus.off('getI18nConfig', () => {})
    })
    // 监听路由变化
    watch(
      () => route.path,
      () => {
        title()
      }
    )
    return {
      ...toRefs(state),
      settingsRef,
      getThemeConfig
    }
  }
})
</script>
