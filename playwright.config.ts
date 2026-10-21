import { defineConfig, devices } from "@playwright/test"

const ci = !!process.env.CI

export default defineConfig({
  testDir: "e2e",
  forbidOnly: ci,
  retries: ci ? 1 : 0,
  reporter: ci ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile-safari", use: { ...devices["iPhone 15"] } },
  ],
  webServer: {
    command: "bun run build && bun run preview",
    url: "http://127.0.0.1:4173",
    timeout: 120_000,
    reuseExistingServer: !ci,
  },
})
