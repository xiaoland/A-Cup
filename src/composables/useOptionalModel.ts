import { computed, ref, watch } from 'vue';

/**
 * useOptionalVModel
 *
 * Creates a writable computed that mirrors a v-model prop if provided by parent,
 * otherwise falls back to an internal state. It always emits `update:<propName>`
 * so parents can start controlling later without breaking the internal state.
 *
 * Keep the API tiny and obvious for reusability across components.
 */
export function useOptionalVModel<T>(options: {
  props: Record<string, unknown>;
  emit: (...args: any[]) => void;
  modelName: string;
  defaultValue?: T;
}) {
  const { props, emit, modelName, defaultValue } = options;

  const inner = ref<T>(
    props[modelName] !== undefined ? (props[modelName] as T) : (defaultValue as T)
  );

  watch(
    () => props[modelName],
    (val) => (inner.value = val)
  );

  return computed<T>({
    get() {
      return inner.value;
    },
    set(val: T) {
      inner.value = val;
      emit(`update:${modelName}`, val);
    },
  });
}
