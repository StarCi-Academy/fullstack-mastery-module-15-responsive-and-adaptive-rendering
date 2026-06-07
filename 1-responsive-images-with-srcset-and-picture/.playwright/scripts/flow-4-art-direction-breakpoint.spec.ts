import { test, expect } from "@playwright/test"

/**
 * Flow 4 — art-directed source swaps below a breakpoint.
 *
 * Pass criteria: below 640px the hero resolves to the SQUARE crop source,
 * above it resolves to the WIDE crop — driven purely by <source media>.
 */
test("flow 4 — media query swaps to the square crop below 640px", async ({ page }) => {
    // Step 1: wide viewport -> <source media="(max-width: 640px)"> does NOT match -> wide crop
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    const wideSrc = await page
        .getByTestId("hero-img-1")
        .evaluate((el: HTMLImageElement) => el.currentSrc)
    expect(wideSrc).toContain("wide")

    // Step 2: narrow viewport -> <source media="(max-width: 640px)"> MATCHES -> square crop
    await page.setViewportSize({ width: 480, height: 800 })
    await page.reload()
    const squareSrc = await page
        .getByTestId("hero-img-1")
        .evaluate((el: HTMLImageElement) => el.currentSrc)

    // Step 3: the media query forced a different framing (square), not just a different size
    expect(squareSrc).toContain("square")
})
