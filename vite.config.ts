import { defineConfig } from "vite"
import { resolve } from "path"
import dts from "vite-plugin-dts"

export default defineConfig({
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  plugins: [
    dts({
      include: ["src"],
      rollupTypes: true,
      tsconfigPath: "./tsconfig.build.json",
    }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "SmartSearch",
      formats: ["es", "umd"],
      fileName: (format) => `smart-search.${format}.js`,
    },
    rollupOptions: {
      external: ["@floating-ui/dom", "lucide"],
      output: {
        globals: {
          "@floating-ui/dom": "FloatingUIDOM",
          lucide: "lucide",
        },
      },
    },
  },
})
