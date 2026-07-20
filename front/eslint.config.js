import js from "@eslint/js"

export default [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        window: "readonly", document: "readonly", console: "readonly",
        localStorage: "readonly", fetch: "readonly", FormData: "readonly",
        ApexCharts: "readonly", IntersectionObserver: "readonly"
      }
    }
  }
]