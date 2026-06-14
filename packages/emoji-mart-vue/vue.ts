// @ts-nocheck
import { defineComponent, h, ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { Picker } from 'emoji-mart'

export default defineComponent({
  name: 'EmojiPicker',
  inheritAttrs: false,
  setup(_, { attrs }) {
    const el = ref(null)
    const instance = ref(null)

    onMounted(() => {
      instance.value = new Picker({ ...attrs, ref: { current: el.value } })
    })

    watch(() => ({ ...attrs }), (newAttrs) => {
      instance.value?.update(newAttrs)
    }, { deep: true })

    onBeforeUnmount(() => {
      instance.value?.disconnectedCallback()
      instance.value = null
    })

    return () => h('div', { ref: el })
  },
})
