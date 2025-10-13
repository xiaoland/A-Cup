import { ref, watch, computed } from 'vue'

export function useOptionalModel<T extends object>(
  props: { modelValue?: T },
  emit: (e: 'update:modelValue', v: T) => void
) {
  const localModel = ref<T>(props.modelValue ?? {} as T)

  watch(() => props.modelValue, (v) => {
    if (v) {
      localModel.value = v
    }
  })

  return computed({
    get: () => localModel.value,
    set: (v: T) => {
      localModel.value = v
      emit('update:modelValue', v)
    }
  })
}