import { defineConfig } from "vite"
import { resolve } from "path"

export default defineConfig({
  root: ".",
  base: "/",
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
