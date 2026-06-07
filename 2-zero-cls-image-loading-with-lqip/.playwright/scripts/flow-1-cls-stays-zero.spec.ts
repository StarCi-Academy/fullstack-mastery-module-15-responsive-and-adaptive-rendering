import { test, expect } from "@playwright/test"

/**
 * Flow 1 — CLS stays 0 throughout image load.
 *
 * Pass criteria: cumulative layout-shift score is below 0.01 after all images settle.
 *
 * How it works: a PerformanceObserver listening for "layout-shift" is installed
 * via addInitScript BEFORE navigation so every shift is captured from the first
 * paint. After networkidle we read the accumulated value and assert < 0.01.
 */
test("flow 1 — reserved boxes keep CLS at 0", async ({ page }) => {
    // Step 1: install a layout-shift observer BEFORE navigation so we catch every shift
    await page.addInitScript(() => {
        ;(window as unknown as { __cls: number }).__cls = 0
        new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                // Ignore shifts caused by recent user input, exactly like the CLS metric
                const e = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }
                if (!e.hadRecentInput) {
                    ;(window as unknown as { __cls: number }).__cls += e.value
                }
            }
        }).observe({ type: "layout-shift", buffered: true })
    })

    // Step 2: load the page and let every image settle
    await page.goto("/")
    await expect(page.getByTestId("hero")).toBeVisible()
    await page.waitForLoadState("networkidle")

    // Step 3: assert the accumulated CLS is effectively zero
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls)
    expect(cls).toBeLessThan(0.01)
})
