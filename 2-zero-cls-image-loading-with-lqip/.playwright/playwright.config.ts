import { defineConfig, devices } from "@playwright/test"

const FE_PORT = Number(process.env.FE_PORT ?? "3500")

/**
 * Playwright config for fs-m15-l2.
 * testDir: ./scripts. webServer starts the Vite frontend (port 3500) if not running.
 * FE-only — no backend required (static fallback products used when backend absent).
 * All flows run on Google Chrome (channel: 'chrome') as specified in the lesson.
 */
export default defineConfig({
    testDir: "./scripts",
    timeout: 60_000,
    use: {
        baseURL: `http://127.0.0.1:${FE_PORT}`,
        trace: "on-first-retry",
        screenshot: "only-on-failure",
    },
    webServer: [
        {
            command: "npm install --prefer-offline --no-audit --no-fund && npm run dev",
            cwd: "../frontend",
            url: `http://127.0.0.1:${FE_PORT}`,
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
