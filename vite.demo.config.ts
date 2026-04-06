import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
  root: ".",
  base: "/smart-search-web-component/",
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist-demo",
    emptyOutDir: true,
  },
})
