import {
  defineConfig,
  presetUno,
  transformerVariantGroup,
  transformerDirectives,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
  ],
  transformers: [transformerVariantGroup(), transformerDirectives()],
})
