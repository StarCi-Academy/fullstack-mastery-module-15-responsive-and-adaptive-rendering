import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright config for fs-m15-l3.
 * testDir: ./scripts. webServer starts the Vite frontend (port 3510) if not running.
 * All flows require CDP emulation (network conditions + media features), so use
 * the `channel: 'chrome'` project for the headed dev workflow. The chromium
 * project covers headless CI.
 */
export default defineConfig({
    testDir: "./scripts",
    timeout: 60_000,
    use: {
        baseURL: "http://localhost:3510",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    webServer: [
        {
            command: "npm install --prefer-offline --no-audit --no-fund && npm run dev",
            cwd: "../frontend",
            port: 3510,
            reuseExistingServer: !process.env.CI,
            timeout: 180_000,
        },
    ],
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
        {
            name: "chrome",
            use: { ...devices["Desktop Chrome"], channel: "chrome" },
        },
    ],
})
