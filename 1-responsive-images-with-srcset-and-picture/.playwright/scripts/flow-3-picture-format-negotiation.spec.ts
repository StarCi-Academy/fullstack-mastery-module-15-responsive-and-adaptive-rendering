import { test, expect } from "@playwright/test"

/**
 * Flow 3 — picture format negotiation.
 *
 * Pass criteria: in Chromium (AVIF-capable) the hero image resolves to the AVIF
 * source, proving the browser walked <source> elements top-down and chose the
 * first type it supports.
 */
test("flow 3 — picture serves AVIF when supported", async ({ page }) => {
    // Step 1: navigate and wait for the hero image to appear
    await page.goto("/")
    const hero = page.getByTestId("hero-img-1")
    await expect(hero).toBeVisible()

    // Step 2: currentSrc reflects the <source> the browser actually picked
    const currentSrc = await hero.evaluate((el: HTMLImageElement) => el.currentSrc)

    // Step 3: Chromium supports AVIF, so the first <source type="image/avif"> wins
    expect(currentSrc).toContain(".avif")
})
