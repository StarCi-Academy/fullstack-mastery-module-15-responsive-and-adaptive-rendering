import { AdaptiveLoadingClient } from "../AdaptiveLoadingClient"

/**
 * Local — the default (no `?sandbox`) content.
 * Single client; Playwright E2E drives this path.
 */
export const Local = (): JSX.Element => {
    return <AdaptiveLoadingClient />
}
