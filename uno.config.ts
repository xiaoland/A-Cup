import {
  defineConfig,
  presetUno,
  presetIcons,
  transformerVariantGroup,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      collections: {
        mdi: () => import('@iconify-json/mdi/icons.json').then((i) => i.default),
      },
    }),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
})