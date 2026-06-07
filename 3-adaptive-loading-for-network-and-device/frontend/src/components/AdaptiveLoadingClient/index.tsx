import { lazy, Suspense, useEffect, useRef, useState } from "react"
import { Card, Typography } from "@heroui/react"
import { useNetworkStatus, type Capabilities } from "../../hooks/useNetworkStatus"

/** Dynamic import: the chunk is fetched only when we decide to render it. */
const HeavyWidget = lazy(() => import("./HeavyWidget"))

// ─── Product types ────────────────────────────────────────────────────────────

/** Multi-resolution image URLs for a product. */
export type ProductImage = {
    /** ~480 w, heavily compressed. */
    low: string
    /** ~960 w. */
    medium: string
    /** ~1920 w, full quality. */
    high: string
    alt: string
}

/** A storefront product with multi-resolution image metadata. */
export interface Product {
    id: number
    name: string
    description: string
    price: string
    hasVideo: boolean
    image: ProductImage
}

// ─── Product data ──────────────────────────────────────────────────────────────

/** Static catalog — multi-resolution image URLs per product, no backend required. */
const PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Wireless Headphones",
        description: "Premium noise-cancelling over-ear headphones with 30 h battery.",
        price: "$149",
        hasVideo: true,
        image: {
            low: "https://picsum.photos/seed/headphones-low/480/320",
            medium: "https://picsum.photos/seed/headphones-med/960/640",
            high: "https://picsum.photos/seed/headphones-high/1920/1280",
            alt: "Wireless Headphones",
        },
    },
    {
        id: 2,
        name: "Mechanical Keyboard",
        description: "TKL layout, Cherry MX Red switches, per-key RGB backlight.",
        price: "$89",
        hasVideo: false,
        image: {
            low: "https://picsum.photos/seed/keyboard-low/480/320",
            medium: "https://picsum.photos/seed/keyboard-med/960/640",
            high: "https://picsum.photos/seed/keyboard-high/1920/1280",
            alt: "Mechanical Keyboard",
        },
    },
    {
        id: 3,
        name: "USB-C Hub",
        description: "7-in-1 hub: HDMI 4K, 3× USB-A, SD/MicroSD, 100W PD.",
        price: "$45",
        hasVideo: false,
        image: {
            low: "https://picsum.photos/seed/hub-low/480/320",
            medium: "https://picsum.photos/seed/hub-med/960/640",
            high: "https://picsum.photos/seed/hub-high/1920/1280",
            alt: "USB-C Hub",
        },
    },
    {
        id: 4,
        name: "Webcam 4K",
        description: "Sony sensor, auto-focus, built-in ring light, privacy shutter.",
        price: "$119",
        hasVideo: true,
        image: {
            low: "https://picsum.photos/seed/webcam-low/480/320",
            medium: "https://picsum.photos/seed/webcam-med/960/640",
            high: "https://picsum.photos/seed/webcam-high/1920/1280",
            alt: "Webcam 4K",
        },
    },
]

/** CC0 hero clip (MDN interactive examples) — free to hotlink, no API key. */
const HERO_VIDEO_SRC =
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
/** Poster while the clip buffers or when autoplay is disabled. */
const HERO_VIDEO_POSTER = "https://picsum.photos/seed/hero-video/640/360"

// ─── AdaptiveImage ────────────────────────────────────────────────────────────

/**
 * AdaptiveImage — picks an image variant based on network capabilities.
 *
 * Constrained (slow/saveData/reducedData): forces `low` variant with no srcset.
 * Capable: returns a full `srcset` + `sizes`; browser picks by DPR and layout width.
 */
function AdaptiveImage({
    image,
    caps,
    priority = false,
}: {
    image: ProductImage
    caps: Capabilities
    priority?: boolean
}): JSX.Element {
    if (caps.constrained) {
        return (
            <img
                src={image.low}
                alt={image.alt}
                loading="lazy"
                decoding="async"
                width={480}
                height={320}
                className="w-full object-cover"
                data-testid="adaptive-image"
                data-variant="low"
            />
        )
    }
    // Capable: give the browser a full srcset and let it choose the best candidate.
    return (
        <img
            src={image.medium}
            srcSet={`${image.low} 480w, ${image.medium} 960w, ${image.high} 1920w`}
            sizes="(max-width: 600px) 480px, (max-width: 1200px) 960px, 1920px"
            alt={image.alt}
            // fetchpriority hints the hero image to load first; lazy for the rest.
            fetchPriority={priority ? "high" : "auto"}
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            width={960}
            height={640}
            className="w-full object-cover"
            data-testid="adaptive-image"
            data-variant="srcset"
        />
    )
}

// ─── HeroVideo ────────────────────────────────────────────────────────────────

/**
 * HeroVideo — plays or pauses the hero video clip based on saveData/reducedData.
 *
 * When constrained, the video element is rendered without the `autoplay` attribute
 * so no data is consumed automatically.
 */
function HeroVideo({ caps }: { caps: Capabilities }): JSX.Element {
    // autoplay only when the user has not opted into data saving
    const shouldAutoplay = !caps.constrained

    return (
        <Card className="gap-0 overflow-hidden rounded-3xl border border-border p-0 shadow-none">
            <video
                data-testid="hero-video"
                className="aspect-video w-full object-cover"
                loop
                muted
                playsInline
                width={640}
                height={360}
                poster={HERO_VIDEO_POSTER}
                {...(shouldAutoplay ? { autoPlay: true } : {})}
            >
                <source src={HERO_VIDEO_SRC} type="video/mp4" />
            </video>
            <div className="p-3">
                <Typography.Paragraph size="xs" color="muted">
                    {shouldAutoplay
                        ? "Video autoplaying — capable connection detected."
                        : "Video autoplay disabled to save data."}
                </Typography.Paragraph>
            </div>
        </Card>
    )
}

// ─── AdaptiveSection (HeavyWidget + prefetch) ─────────────────────────────────

/**
 * AdaptiveSection — conditionally loads the HeavyWidget and prefetches the
 * next route based on network and device capability.
 *
 * - constrained: renders a "deferred" placeholder; no JS chunk is fetched.
 * - capable + in-viewport: loads the HeavyWidget via lazy import.
 * - fast 4g + high deviceMemory: injects a <link rel="prefetch"> for the next route.
 */
function AdaptiveSection({ caps }: { caps: Capabilities }): JSX.Element {
    const [shouldLoad, setShouldLoad] = useState<boolean>(false)
    const anchorRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // Never load the heavy widget on constrained connections.
        if (caps.constrained) {
            return
        }
        const el = anchorRef.current
        if (!el) {
            return
        }
        // IntersectionObserver defers the import until the anchor is near the viewport.
        const io = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) {
                setShouldLoad(true)
                io.disconnect()
            }
        })
        io.observe(el)
        return () => io.disconnect()
    }, [caps.constrained])

    useEffect(() => {
        // Prefetch the next route assets only on fast network AND high-memory devices.
        const fast = caps.effectiveType === "4g" && !caps.constrained
        if (!fast || caps.deviceMemory < 4) {
            return
        }
        const link = document.createElement("link")
        link.rel = "prefetch"
        link.as = "script"
        link.href = "/assets/next-route.js"
        document.head.appendChild(link)
        return () => link.remove()
    }, [caps.effectiveType, caps.constrained, caps.deviceMemory])

    return (
        <div ref={anchorRef} data-testid="heavy-anchor">
            {shouldLoad ? (
                <Suspense
                    fallback={
                        <Card data-testid="heavy-fallback" className="rounded-3xl border border-border p-3 shadow-none">
                            <Typography.Paragraph size="sm" color="muted">
                                Loading widget…
                            </Typography.Paragraph>
                        </Card>
                    }
                >
                    <HeavyWidget />
                </Suspense>
            ) : (
                <Card data-testid="heavy-deferred" className="rounded-3xl border border-border p-3 shadow-none">
                    <Typography.Paragraph size="sm" color="muted">
                        Heavy widget deferred for this connection.
                    </Typography.Paragraph>
                </Card>
            )}
        </div>
    )
}

// ─── CapabilitiesPanel ────────────────────────────────────────────────────────

/**
 * CapabilitiesPanel — shows the live detected capabilities so learners can
 * observe the adaptive decisions without opening DevTools.
 */
function CapabilitiesPanel({ caps }: { caps: Capabilities }): JSX.Element {
    return (
        <div data-testid="capabilities-panel" className="flex flex-col gap-3">
            <p className="text-sm font-semibold">Detected capabilities</p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <dt className="text-muted">effectiveType</dt>
                <dd className="font-mono text-foreground">{caps.effectiveType}</dd>

                <dt className="text-muted">saveData</dt>
                <dd className="font-mono text-foreground">{String(caps.saveData)}</dd>

                <dt className="text-muted">reducedData</dt>
                <dd className="font-mono text-foreground">{String(caps.reducedData)}</dd>

                <dt className="text-muted">deviceMemory</dt>
                <dd className="font-mono text-foreground">{caps.deviceMemory} GB</dd>

                <dt className="text-muted">constrained</dt>
                <dd className="font-mono text-foreground">{String(caps.constrained)}</dd>
            </dl>
            <span
                className={`w-fit text-sm font-semibold ${caps.constrained ? "text-danger" : "text-success"}`}
            >
                {caps.constrained
                    ? "Constrained — serving lightweight payload"
                    : "Capable — serving full-quality payload"}
            </span>
        </div>
    )
}

// ─── ProductCard ──────────────────────────────────────────────────────────────

/** Single product card with adaptive image and optional hero video. */
function ProductCard({
    product,
    caps,
    isHero = false,
}: {
    product: Product
    caps: Capabilities
    isHero?: boolean
}): JSX.Element {
    return (
        <Card className="flex h-full flex-col gap-0 overflow-hidden rounded-3xl border border-border p-0 shadow-none">
            {/* Functional core: adaptive <img> stays untouched (variant testid lives here). */}
            <AdaptiveImage image={product.image} caps={caps} priority={isHero} />
            <Card.Content className="flex flex-1 flex-col p-3">
                <Typography.Paragraph size="xs" color="muted" className="line-clamp-2 flex-1">
                    {product.description}
                </Typography.Paragraph>
                <div className="mt-auto flex items-center justify-between gap-2 pt-1.5">
                    <Typography.Paragraph size="sm" weight="semibold" className="truncate">
                        {product.name}
                    </Typography.Paragraph>
                    <span className="shrink-0 text-sm font-semibold text-accent">{product.price}</span>
                </div>
            </Card.Content>
        </Card>
    )
}

// ─── AdaptiveLoadingClient ────────────────────────────────────────────────────

/**
 * AdaptiveLoadingClient — the full demo:
 *   1. CapabilitiesPanel shows live detected signals.
 *   2. HeroVideo autoplays or not based on saveData/constrained.
 *   3. Product grid uses AdaptiveImage: low variant when constrained, srcset when capable.
 *   4. AdaptiveSection conditionally loads HeavyWidget and prefetches the next route.
 *
 * The product catalog ships with the app (PRODUCTS); no backend to start.
 * The single scoping anchor `adaptive-loading-root` lets tests query
 * `adaptive-image` only inside this client, never any other region.
 */
export function AdaptiveLoadingClient(): JSX.Element {
    const caps = useNetworkStatus()

    return (
        <div data-testid="adaptive-loading-root">
            {/* Capabilities readout — main demo anchor */}
            <CapabilitiesPanel caps={caps} />
            <div className="h-6" />

            {/* Hero video — autoplay gated on caps.constrained */}
            <HeroVideo caps={caps} />
            <div className="h-6" />

            {/* Product grid — same AdaptiveImage component, variant driven by caps */}
            <div className="grid grid-cols-2 items-stretch gap-3">
                {PRODUCTS.map((p, i) => (
                    <div key={p.id} className="h-full">
                        <ProductCard product={p} caps={caps} isHero={i === 0} />
                    </div>
                ))}
            </div>
            <div className="h-6" />

            {/* Heavy widget + prefetch — conditional on capability */}
            <AdaptiveSection caps={caps} />
        </div>
    )
}
