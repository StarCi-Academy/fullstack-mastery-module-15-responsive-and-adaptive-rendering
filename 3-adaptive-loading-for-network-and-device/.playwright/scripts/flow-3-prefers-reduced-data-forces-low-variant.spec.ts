import { test, expect } from "@playwright/test"

/**
 * Flow 3 — The prefers-reduced-data media feature is honored.
 *
 * Pass criteria: with reduced-data on, images fall back to the low variant.
 *
 * Note: Chromium's `Emulation.setEmulatedMedia` does NOT reliably make
 * `matchMedia("(prefers-reduced-data: reduce)").matches` return true, so we stub
 * `window.matchMedia` via addInitScript to report the reduced-data query as matching.
 * The hook reads `matchMedia(...).matches` directly, so this drives the real branch.
 */
test("flow 3 — prefers-reduced-data forces the low variant", async ({ page }) => {
    // Step 1: stub matchMedia so the reduced-data query matches, before any script runs
    await page.addInitScript(() => {
        const real = window.matchMedia.bind(window)
        window.matchMedia = (query: string): MediaQueryList => {
            if (query.includes("prefers-reduced-data")) {
                return {
                    matches: true,
                    media: query,
                    onchange: null,
                    addEventListener: () => {},
                    removeEventListener: () => {},
                    addListener: () => {},
                    removeListener: () => {},
                    dispatchEvent: () => false,
                } as unknown as MediaQueryList
            }
            return real(query)
        }
    })

    // Step 2: navigate and confirm the panel reflects reducedData: true
    await page.goto("/")
    await expect(page.getByTestId("capabilities-panel")).toContainText("reducedData")
    await expect(page.getByTestId("capabilities-panel")).toContainText("true")

    // Step 3: all adaptive images (scoped to this client) must use the low variant
    const variants = await page
        .getByTestId("adaptive-loading-root")
        .getByTestId("adaptive-image")
        .evaluateAll((els) => els.map((el) => el.getAttribute("data-variant")))
    expect(variants.length).toBeGreaterThan(0)
    expect(variants.every((v) => v === "low")).toBe(true)
})
