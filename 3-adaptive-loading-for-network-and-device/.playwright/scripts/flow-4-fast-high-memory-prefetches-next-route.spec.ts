import { test, expect } from "@playwright/test"

/**
 * Flow 4 — Fast connection and high deviceMemory prefetch the next route assets.
 *
 * Pass criteria: a <link rel="prefetch"> for the next route appears in the DOM.
 */
test("flow 4 — fast + high-memory device prefetches the next route", async ({ page }) => {
    // Step 1: inject a fast 4g connection and 8 GB deviceMemory before scripts run
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "connection", {
            value: { effectiveType: "4g", saveData: false },
            configurable: true,
        })
        Object.defineProperty(navigator, "deviceMemory", { value: 8, configurable: true })
    })

    // Step 2: navigate and wait for the capabilities panel
    await page.goto("/")
    await expect(page.getByTestId("capabilities-panel")).toBeVisible()

    // Step 3: a prefetch link for the next route must be injected into the DOM
    await expect
        .poll(() => page.locator('link[rel="prefetch"][href="/assets/next-route.js"]').count())
        .toBeGreaterThan(0)
})
