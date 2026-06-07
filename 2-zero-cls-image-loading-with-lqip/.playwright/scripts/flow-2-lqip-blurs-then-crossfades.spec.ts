import { test, expect } from "@playwright/test"

/**
 * Flow 2 — Blurred LQIP visible then crossfades to the sharp image.
 *
 * Pass criteria: the sharp layer starts transparent (opacity < 0.5) while the
 * real image is still in flight, and ends fully opaque (opacity === 1) after the
 * .shown class is added on load.
 *
 * How it works: we hold the product image responses open for a fixed, generous
 * delay with page.route so the LQIP phase is deterministically long. The HTML/JS
 * still load fast (only image URLs are delayed), so navigation never times out,
 * and the blurred opacity is guaranteed readable before the crossfade fires.
 */
test("flow 2 — LQIP blurs first then the sharp image fades in", async ({ page }) => {
    // Step 1: hold the product image responses for a generous, fixed delay so the
    // blurred (opacity 0) phase is deterministically observable even on a warm server
    await page.route("**/picsum.photos/**", async (route) => {
        await new Promise((resolve) => setTimeout(resolve, 4000))
        await route.continue()
    })

    // Step 2: navigate (DOM only — images are still in flight) and read the sharp
    // layer's opacity while it is still blurred (the .shown class is not added yet)
    await page.goto("/", { waitUntil: "domcontentloaded" })
    const sharp = page.getByTestId("product-2").locator(".sharp")
    await expect(sharp).toBeVisible()
    // The image is held for 4 s, so the sharp layer must still be in its pre-load state
    await expect(sharp).not.toHaveClass(/shown/)
    const before = await sharp.evaluate((el) => getComputedStyle(el).opacity)

    // Step 3: once the held image finally arrives, the .shown class is added and the
    // 300 ms opacity crossfade begins. Poll the COMPUTED opacity until the transition
    // settles at 1 (reading immediately after the class appears can catch a mid-fade value).
    await expect(sharp).toHaveClass(/shown/, { timeout: 15_000 })
    await expect
        .poll(async () => Number(await sharp.evaluate((el) => getComputedStyle(el).opacity)), {
            timeout: 5_000,
        })
        .toBe(1)
    const after = await sharp.evaluate((el) => getComputedStyle(el).opacity)

    expect(Number(before)).toBeLessThan(0.5)
    expect(Number(after)).toBe(1)
})
