import { test, expect } from "@playwright/test"

/**
 * Flow 2 — Changing the viewport changes the chosen candidate.
 *
 * Pass criteria: a wide desktop viewport (400px slot) resolves to the 400w
 * candidate, while a 640px viewport (sizes hits the "100vw" branch -> ~640px
 * slot) steps UP to the 800w candidate. The two picks must DIFFER — proving
 * sizes drives the selection, not just that both are valid srcset entries.
 */
test("flow 2 — viewport width changes the resolved candidate", async ({ page }) => {
    // Step 1: wide desktop viewport at DPR 1 -> 400px slot -> 400w candidate
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")
    const wideSrc = await page
        .getByTestId("product-img-1")
        .evaluate((el: HTMLImageElement) => el.currentSrc)
    // The 400px slot at DPR 1 resolves to the 400w candidate.
    expect(wideSrc).toContain("400")

    // Step 2: narrow viewport at 640px -> sizes hits the "100vw" branch -> ~640px slot.
    // 640 CSS px needs the 800w candidate (the 400w one is too small), so the browser
    // steps UP from 400w to 800w — a DIFFERENT pick from the same srcset.
    await page.setViewportSize({ width: 640, height: 800 })
    await page.reload()
    const narrowSrc = await page
        .getByTestId("product-img-1")
        .evaluate((el: HTMLImageElement) => el.currentSrc)
    expect(narrowSrc).toContain("800")

    // Step 3: prove the two viewports resolved to DIFFERENT candidates, not the same file.
    // A weak test that only asserts both match /400|800/ could pass without proving any switch.
    expect(narrowSrc).not.toBe(wideSrc)
})
