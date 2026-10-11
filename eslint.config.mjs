import nextCoreWebVitals from "eslint-config-next/core-web-vitals"
import nextTypescript from "eslint-config-next/typescript"

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      // `const { omitted, ...rest } = obj` is the idiomatic way to drop a key.
      "@typescript-eslint/no-unused-vars": ["warn", { ignoreRestSiblings: true, argsIgnorePattern: "^_" }],
    },
  },
  { ignores: [".next/**", "node_modules/**", "public/**", "next-env.d.ts"] },
]

export default config
