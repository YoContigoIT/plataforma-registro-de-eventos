import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ isSsrBuild }) => ({
  build: {
    rollupOptions: isSsrBuild
      ? {
          input: "./server/app.ts",
        }
      : undefined,
  },
  resolve: {
    alias: {
      ".prisma/client/index-browser": "./node_modules/.prisma/client/index-browser.js",
    },
  },
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
}));
