import { Typography } from "@heroui/react"
import { HeroUIProvider } from "./components/providers"
import { Local } from "./components/Local"
import { Sandbox } from "./components/Sandbox"

/** Lesson title shown above the content in both render modes. */
const TITLE = "Adaptive Loading for Network and Device"

/** Lesson description shown under the title in both render modes. */
const DESCRIPTION =
    "Read navigator.connection (effectiveType, saveData), prefers-reduced-data, and deviceMemory to serve a lightweight payload on constrained connections and full quality on capable devices."

/**
 * App root — shared Label + Description header, then content switches on the
 * `?sandbox` query param: `<Sandbox/>` for the embedded preview,
 * `<Local/>` otherwise (what Playwright drives).
 * Single-client lesson: both modes render the same AdaptiveLoadingClient.
 */
const App = (): JSX.Element => {
    // Embedded preview loads `/?sandbox=1`; cloned-repo + Playwright load `/`
    const isSandbox = new URLSearchParams(window.location.search).has("sandbox")

    return (
        <HeroUIProvider>
            <main className="min-h-screen bg-background p-3">
                <div className="mx-auto flex max-w-2xl flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <Typography.Heading level={4} className="text-sm font-semibold">
                            {TITLE}
                        </Typography.Heading>
                        <Typography.Paragraph size="sm" color="muted">
                            {DESCRIPTION}
                        </Typography.Paragraph>
                    </div>
                    {/* Content */}
                    {isSandbox ? <Sandbox /> : <Local />}
                </div>
            </main>
        </HeroUIProvider>
    )
}

export default App
