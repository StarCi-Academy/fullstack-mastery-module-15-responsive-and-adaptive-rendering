import { test, expect } from "@playwright/test"

/**
 * Flow 4 — The preloaded fetchpriority=high hero loads measurably earlier.
 *
 * Pass criteria:
 *  1. The hero image request carries "High" initialPriority (via CDP).
 *  2. The LCP element recorded by PerformanceObserver has data-testid containing "hero".
 *
 * How it works: CDP Network.requestWillBeSent records the browser-assigned priority
 * for every request before the page loads. A PerformanceObserver captures the LCP
 * element. Both are checked after networkidle.
 */
test("flow 4 — hero preload + high priority improves LCP", async ({ page }) => {
    const priorities = new Map<string, string>()
    const client = await page.context().newCDPSession(page)
    await client.send("Network.enable")

    // CDP fires this event for every outgoing request with the browser's assigned priority.
    // The priority lives on the Request object as `initialPriority` (High/Medium/Low/VeryLow).
    client.on(
        "Network.requestWillBeSent",
        (e: { request: { url: string; initialPriority: string } }) => {
            priorities.set(e.request.url, e.request.initialPriority)
        },
    )

    // Step 1: capture the LCP element via PerformanceObserver before navigation
    await page.addInitScript(() => {
        new PerformanceObserver((list) => {
            const entries = list.getEntries()
            const last = entries[entries.length - 1] as PerformanceEntry & { element?: Element }
            ;(window as unknown as { __lcpTag: string }).__lcpTag =
                last.element?.getAttribute("data-testid") ??
                last.element?.closest("[data-testid]")?.getAttribute("data-testid") ??
                ""
        }).observe({ type: "largest-contentful-paint", buffered: true })
    })

    // Step 2: load and read the hero's sharp layer src
    await page.goto("/")
    const heroSrc = await page.getByTestId("hero").locator(".sharp").getAttribute("src")
    await page.waitForLoadState("networkidle")

    // Step 3: the hero must be High priority AND be (or contain) the LCP element.
    // The hero URL is requested twice: once by the static <link rel=preload> (High)
    // and once by the <img>. We match by the hero seed so a redirect or a duplicate
    // request URL does not break the lookup; at least one hero request must be High.
    expect(heroSrc).toBeTruthy()
    const heroSeed = "seed/headphones"
    const heroPriorities = [...priorities.entries()]
        .filter(([url]) => url.includes(heroSeed))
        .map(([, priority]) => priority)
    // The browser assigns "High" when fetchpriority="high" + preload are both present
    expect(heroPriorities).toContain("High")

    // The LCP PerformanceObserver may dispatch its final entry slightly after networkidle,
    // so poll until the recorded LCP element's data-testid is populated before asserting.
    await expect
        .poll(
            () => page.evaluate(() => (window as unknown as { __lcpTag: string }).__lcpTag),
            { timeout: 10_000 },
        )
        .toContain("hero")
})
