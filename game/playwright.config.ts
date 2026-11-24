import { defineConfig } from "@playwright/test";

// Headless runs use SwiftShader (software WebGL). Frame rates here are NOT hardware numbers.
// Set PW_CHROMIUM_PATH to use a system Chrome (the box uses /usr/bin/google-chrome).
export default defineConfig({
  testDir: "e2e",
  timeout: 300_000,
  expect: { timeout: 20_000 },
  workers: 1,
  reporter: [["list"], ["json", { outputFile: "test-results/e2e.json" }]],
  use: {
    baseURL: "http://localhost:4174/",
    viewport: { width: 1440, height: 900 },
    video: { mode: "on", size: { width: 1440, height: 900 } },
    launchOptions: {
      executablePath: process.env.PW_CHROMIUM_PATH || undefined,
      args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist", "--enable-precise-memory-info"],
    },
  },
  webServer: {
    command: "npx vite preview --port 4174 --strictPort",
    url: "http://localhost:4174/",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
