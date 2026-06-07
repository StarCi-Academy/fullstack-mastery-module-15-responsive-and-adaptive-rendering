import { defineConfig, devices } from "@playwright/test"

/**
 * Playwright config for fs-m15-l0.
 * testDir: ./scripts. webServer starts the Vite frontend (port 3480) if not running.
 * FE-only — no backend required (static fallback products used when backend absent).
 */
export default defineConfig({
    testDir: "./scripts",
    timeout: 60_000,
    use: {
        baseURL: "http://127.0.0.1:3480",
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    webServer: [
        {
            command: "npm install --prefer-offline --no-audit --no-fund && npm run dev",
            cwd: "../frontend",
            port: 3480,
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
            name: "head",
            use: { ...devices["Desktop Chrome"], channel: "chrome" },
        },
    ],
})
