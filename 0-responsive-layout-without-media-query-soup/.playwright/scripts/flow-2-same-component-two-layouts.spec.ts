import { test, expect } from "@playwright/test"

/**
 * Flow 2 — The same card renders compact in the sidebar and rich in the main column simultaneously.
 *
 * Pass criteria: at one viewport, the sidebar card hides its description while the main card shows it.
 */
test("flow 2 — same component, two layouts at the same viewport", async ({ page }) => {
    // Step 1: one fixed viewport
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto("/")

    // Step 2: the main-column card shows the rich layout (description visible)
    const mainDesc = page.getByTestId("slot-main").getByTestId("desc-1")
    await expect(mainDesc).toBeVisible()

    // Step 3: the sidebar card is the SAME component but its container is narrow -> compact
    const sidebarDesc = page.getByTestId("slot-sidebar").getByTestId("desc-1")
    await expect(sidebarDesc).toBeHidden()
})
