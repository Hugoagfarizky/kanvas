import { fileURLToPath, URL } from "node:url"

import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const repoName = process.env.GITHUB_REPOSITORY?.split("/")[1]
const isActions = process.env.GITHUB_ACTIONS === "true"

export default defineConfig({
  base: isActions && repoName ? `/${repoName}/` : "/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
