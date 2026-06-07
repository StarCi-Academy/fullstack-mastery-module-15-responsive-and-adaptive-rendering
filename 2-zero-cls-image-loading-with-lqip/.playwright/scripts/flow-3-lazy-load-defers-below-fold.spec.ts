import { test, expect } from "@playwright/test"

/**
 * Flow 3 — Off-screen images only fetch when scrolled within rootMargin.
 *
 * Pass criteria: the last product image (product-12) is not requested until
 * we scroll its wrapper element into the IntersectionObserver's rootMargin band.
 *
 * How it works: we track every image request matching the product URL pattern.
 * After the initial load only above-fold images should be requested. We then
 * scroll the last product card into view and poll until its request appears.
 */
test("flow 3 — IntersectionObserver defers below-fold fetches", async ({ page }) => {
    const requested = new Set<string>()
    page.on("request", (req) => {
        // Track only image requests (picsum or api) — not the tiny lqip data URIs
        if (req.resourceType() === "image" && !req.url().startsWith("data:")) {
            requested.add(req.url())
        }
    })

    // Step 1: load and let the above-fold images finish
    await page.goto("/")
    await expect(page.getByTestId("hero")).toBeVisible()

    // Step 2: read the data-fullsrc of the last product's sharp layer (stores real URL)
    const lastSrc = await page.getByTestId("product-12").locator(".sharp").getAttribute("data-fullsrc")
    expect(lastSrc).toBeTruthy()

    // Step 3: the far below-fold image must NOT be requested yet
    expect([...requested].some((u) => u === lastSrc)).toBe(false)

    // Step 4: scroll to the bottom — the lazy image now fetches within rootMargin
    await page.getByTestId("product-12").scrollIntoViewIfNeeded()
    await expect.poll(() => [...requested].some((u) => u === lastSrc), { timeout: 10_000 }).toBe(true)
})
