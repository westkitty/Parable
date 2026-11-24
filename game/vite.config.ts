import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: { target: "es2022", chunkSizeWarningLimit: 6000 },
  server: { port: 5174 },
  test: { include: ["tests/**/*.test.ts"], environment: "node" },
} as never);
