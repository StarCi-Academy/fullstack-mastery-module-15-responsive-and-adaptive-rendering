import { HeroUIProvider } from "./components/providers"
import { Local } from "./components/Local"
import { Sandbox } from "./components/Sandbox"

/** Lesson title shown above the content in both render modes. */
const TITLE = "Responsive Images with srcset and picture"
/** Lesson description shown under the title in both render modes. */
const DESCRIPTION =
    "Browser-native resolution switching via srcset + sizes, and art direction via <picture> + <source> — no JavaScript DPR detection, no next/image required."

/**
 * App root — shared Label + Description header, then content switches on the
 * `?sandbox` query param: `<Sandbox/>` for the embedded preview,
 * `<Local/>` otherwise (what Playwright drives).
 * Single-client lesson: both modes render the same ResponsiveImagesClient.
 */
export default function App(): JSX.Element {
    // Embedded preview loads `/?sandbox=1`; cloned-repo + Playwright load `/`
    const isSandbox = new URLSearchParams(window.location.search).has("sandbox")

    return (
        <HeroUIProvider>
            <main className="min-h-screen bg-background p-3">
                <div className="mx-auto max-w-2xl">
                    {/* Label */}
                    <div className="text-base font-semibold text-foreground">{TITLE}</div>
                    <div className="h-3" />
                    {/* Description */}
                    <div className="text-sm text-muted">{DESCRIPTION}</div>
                    <div className="h-6" />
                    {/* Content */}
                    {isSandbox ? <Sandbox /> : <Local />}
                </div>
            </main>
        </HeroUIProvider>
    )
}
