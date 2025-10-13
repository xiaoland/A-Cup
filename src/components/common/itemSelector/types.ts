import type { UnwrapRef } from 'vue';

export interface Item<T> {
  data: UnwrapRef<T>;
  isNew: boolean;
}
