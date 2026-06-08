import { defineConfig, devices } from "@playwright/test"

const FE_PORT = Number(process.env.FE_PORT ?? "3490")

/**
 * Playwright config for fs-m15-l1.
 * testDir: ./scripts. webServer starts the Vite frontend (port 3490) if not running.
 * FE-only — no backend required (static fallback products used when backend absent).
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
            port: FE_PORT,
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
