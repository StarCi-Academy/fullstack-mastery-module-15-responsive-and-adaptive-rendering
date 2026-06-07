import { LqipImageClient } from "../LqipImageClient"

/**
 * Sandbox — rendered at `/?sandbox=1` for the embedded Sandpack preview.
 * Single-client lesson: renders the same LqipImageClient as Local.
 * No multi-pane Tabs needed — LQIP / lazy-load / fetchpriority are all
 * single-user browser mechanics, not multi-client realtime features.
 */
export function Sandbox(): JSX.Element {
    return <LqipImageClient />
}
