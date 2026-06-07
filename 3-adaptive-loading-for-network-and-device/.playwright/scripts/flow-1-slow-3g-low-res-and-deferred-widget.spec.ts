import { test, expect } from "@playwright/test"

/**
 * Flow 1 — A slow effectiveType serves the low-res image and defers the heavy widget.
 *
 * Pass criteria: every adaptive image uses the "low" variant and the heavy widget stays deferred.
 *
 * Note: we inject `effectiveType: "3g"` via addInitScript instead of throttling the transport
 * with CDP. `navigator.connection.effectiveType` is the engine's own estimate and Chromium does
 * NOT guarantee it updates from `Network.emulateNetworkConditions`; the hook under test reads
 * `effectiveType` directly, so injecting it is the deterministic way to drive the constrained
 * branch — and it keeps the Vite dev-server load from timing out under heavy throttling.
 */
test("flow 1 — slow 3G picks low-res images and defers heavy widget", async ({ page }) => {
    // Step 1: inject a 3g connection before any script runs
    await page.addInitScript(() => {
        Object.defineProperty(navigator, "connection", {
            value: { effectiveType: "3g", saveData: false },
            configurable: true,
        })
    })

    // Step 2: navigate and wait for the capabilities panel
    await page.goto("/")
    await expect(page.getByTestId("capabilities-panel")).toBeVisible()

    // Step 3: every adaptive image (scoped to this client) must resolve to the low variant
    const variants = await page
        .getByTestId("adaptive-loading-root")
        .getByTestId("adaptive-image")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-variant")))
    expect(variants.length).toBeGreaterThan(0)
    expect(variants.every((v) => v === "low")).toBe(true)

    // Step 4: the heavy widget must stay deferred (never loaded)
    await expect(page.getByTestId("heavy-deferred")).toBeVisible()
})
