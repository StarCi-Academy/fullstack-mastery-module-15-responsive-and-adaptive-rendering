import { test, expect } from "@playwright/test"

/**
 * Flow 4 — No horizontal scrollbar at any width from 320px to 1920px.
 *
 * Pass criteria: document scrollWidth never exceeds clientWidth across the range.
 */
test("flow 4 — no horizontal overflow across the full width range", async ({ page }) => {
    await page.goto("/")

    // Sweep representative widths across the responsive range
    for (const width of [320, 480, 768, 1024, 1440, 1920]) {
        // Step 1: resize the viewport
        await page.setViewportSize({ width, height: 900 })

        // Step 2: assert the document has no horizontal overflow
        const overflow = await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        )
        expect(overflow, `overflow at ${width}px`).toBeLessThanOrEqual(0)
    }
})
