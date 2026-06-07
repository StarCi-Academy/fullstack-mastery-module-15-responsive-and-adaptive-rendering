import { test, expect } from "@playwright/test"

/**
 * Flow 3 — clamp() scales the title font smoothly and stays within its min/max bounds.
 *
 * Pass criteria: the computed title font-size is strictly between the clamp min and max.
 */
test("flow 3 — fluid type stays within clamp bounds", async ({ page }) => {
    // Step 1: a medium viewport so the container width lands between clamp endpoints
    await page.setViewportSize({ width: 1024, height: 800 })
    await page.goto("/")

    // Step 2: read the computed font-size of a title inside the wide main slot
    const px = await page.evaluate(() => {
        const el = document.querySelector('[data-testid="slot-main"] .card-title')
        return el ? parseFloat(getComputedStyle(el).fontSize) : 0
    })

    // Step 3: clamp(1rem, ..., 1.6rem) -> between 16px and 25.6px at 16px root
    expect(px).toBeGreaterThan(16)
    expect(px).toBeLessThanOrEqual(25.6)
})
