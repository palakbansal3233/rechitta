import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({
  rules: {
    // The shader strings are long by nature and reformatting them hurts them.
    'vue/max-attributes-per-line': 'off',
    'vue/singleline-html-element-content-newline': 'off',
  },
})
