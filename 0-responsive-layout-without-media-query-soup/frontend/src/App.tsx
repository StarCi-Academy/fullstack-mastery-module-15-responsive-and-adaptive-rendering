import { Typography } from "@heroui/react"
import { HeroUIProvider } from "./components/providers"
import { Local } from "./components/Local"
import { Sandbox } from "./components/Sandbox"

/** Lesson title shown above the content in both render modes. */
const TITLE = "Responsive Layout Without Media-Query Soup"
/** Lesson description shown under the title in both render modes. */
const DESCRIPTION =
    "CSS container queries, auto-fit grid, and clamp() — one ProductCard component adapts to any slot width without a single viewport breakpoint or variant prop."

/**
 * App root — shared Label + Description header, then content switches on the
 * `?sandbox` query param: `<Sandbox/>` for the embedded preview,
 * `<Local/>` otherwise (what Playwright drives).
 * Single-client lesson: both modes render the same ResponsiveLayoutClient.
 */
const App = (): JSX.Element => {
    // Embedded preview loads `/?sandbox=1`; cloned-repo + Playwright load `/`
    const isSandbox = new URLSearchParams(window.location.search).has("sandbox")

    return (
        <HeroUIProvider>
            <main className="min-h-screen bg-background p-3">
                {/* Wider stage than the canonical max-w-2xl: the two-slot demo
                    needs room to show the sidebar and main column side by side. */}
                <div className="mx-auto flex max-w-5xl flex-col gap-6">
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
