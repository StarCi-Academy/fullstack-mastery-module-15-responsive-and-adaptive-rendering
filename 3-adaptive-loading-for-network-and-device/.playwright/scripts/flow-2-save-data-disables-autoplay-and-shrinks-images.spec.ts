import { test, expect } from "@playwright/test"

/**
 * Flow 2 — With Save-Data on, the hero video must not autoplay and images shrink.
 *
 * Pass criteria: the hero video has no autoplay attribute and images use the low variant.
 */
test("flow 2 — save-data disables video autoplay and shrinks images", async ({ browser }) => {
    // Step 1: emulate the Save-Data client hint via an extra HTTP header
    const context = await browser.newContext({ extraHTTPHeaders: { "Save-Data": "on" } })
    const page = await context.newPage()

    // Force the app branch by injecting saveData=true before scripts run.
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "connection", {
            value: { effectiveType: "4g", saveData: true },
            configurable: true,
        })
    })

    // Step 2: navigate and wait for the capabilities panel
    await page.goto("/")
    await expect(page.getByTestId("capabilities-panel")).toBeVisible()

    // Step 3: hero video must not autoplay (attribute must be absent)
    const autoplay = await page.getByTestId("hero-video").getAttribute("autoplay")
    expect(autoplay).toBeNull()

    // Step 4: images (scoped to this client) shrink to the low variant
    await expect(
        page.getByTestId("adaptive-loading-root").getByTestId("adaptive-image").first(),
    ).toHaveAttribute("data-variant", "low")

    await context.close()
})
