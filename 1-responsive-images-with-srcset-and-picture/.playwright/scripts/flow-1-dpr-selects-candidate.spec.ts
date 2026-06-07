import { test, expect } from "@playwright/test"

/**
 * Flow 1 — DPR-based candidate selection.
 *
 * Pass criteria: at DPR 2 the browser resolves to the 800w candidate
 * for a 400px display slot (400 display px × 2 DPR = 800 device px).
 */
test.use({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: 2 })

test("flow 1 — DPR 2 selects the 800w candidate", async ({ page }) => {
    // Step 1: navigate and wait for the gallery to appear
    await page.goto("/")
    const img = page.getByTestId("product-img-1")
    await expect(img).toBeVisible()

    // Step 2: currentSrc reflects the candidate the BROWSER actually chose
    const currentSrc = await img.evaluate((el: HTMLImageElement) => el.currentSrc)

    // Step 3: at 400px slot × DPR 2 the 800w candidate is the optimal pick
    expect(currentSrc).toContain("800")
})
