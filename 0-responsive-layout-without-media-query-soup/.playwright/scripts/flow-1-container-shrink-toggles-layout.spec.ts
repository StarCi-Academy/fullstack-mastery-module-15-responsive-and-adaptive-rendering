import { test, expect } from "@playwright/test"

/**
 * Flow 1 — Shrinking the container switches the card layout while the viewport is unchanged.
 *
 * Pass criteria: at a fixed viewport, narrowing the main slot hides the description (compact layout).
 */
test("flow 1 — container shrink toggles layout at container breakpoint", async ({ page }) => {
    // Step 1: fixed wide viewport for the whole test
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/")

    // Step 2: scope to the main slot — desc-1 also exists in the sidebar, so an
    // unscoped getByTestId("desc-1") would match two elements (strict-mode fail)
    const mainDesc = page.getByTestId("slot-main").getByTestId("desc-1")

    // Step 3: in the wide main slot the description is visible (rich layout)
    await expect(mainDesc).toBeVisible()

    // Step 4: force the main slot below the container breakpoint without touching the viewport
    // (pin flex so the explicit width is not overridden by flex-grow filling the row)
    await page.evaluate(() => {
        const slot = document.querySelector<HTMLElement>('[data-testid="slot-main"]')
        if (slot) {
            slot.style.flex = "0 0 260px"
            slot.style.width = "260px"
        }
    })

    // Step 5: same viewport, but the container is now narrow -> compact layout hides the description
    await expect(mainDesc).toBeHidden()
})
