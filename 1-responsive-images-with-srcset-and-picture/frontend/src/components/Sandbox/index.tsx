import { ResponsiveImagesClient } from "../ResponsiveImagesClient"

/**
 * Sandbox — the `?sandbox=1` content for the embedded preview.
 *
 * This lesson is single-client (responsive images have no second user to show),
 * so the sandbox renders the same single client as Local — no multi-pane tabs.
 * The split file structure is kept for a uniform `?sandbox` switch across the
 * whole course.
 */
export function Sandbox(): JSX.Element {
    return <ResponsiveImagesClient />
}
