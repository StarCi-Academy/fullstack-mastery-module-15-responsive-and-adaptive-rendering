import { useEffect, useRef, useState } from "react"
import { Button, Card, Typography } from "@heroui/react"

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape of a product returned by GET /api/products */
export interface Product {
    id: number
    name: string
    /** Full-resolution image URL */
    src: string
    /** Native image width in pixels — used to derive aspect-ratio */
    width: number
    /** Native image height in pixels — used to derive aspect-ratio */
    height: number
    /** Tiny base64 data URI (~20px) blurred placeholder, rendered with no network request */
    lqip: string
}

// ─── Static fallback products (used when backend is absent) ──────────────────

/**
 * Twelve products with stable picsum seeds so image bytes are cached across reloads.
 * lqip is a minimal 1×1 data URI placeholder — in a real app this would be generated
 * server-side from the image (e.g. Blurhash or a tiny resized JPEG).
 */
const FALLBACK_PRODUCTS: Product[] = [
    { id: 1,  name: "Wireless Headphones",  src: "https://picsum.photos/seed/headphones/800/533",  width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUEA/8QAHhAAAgIDAQEBAAAAAAAAAAAAAQIDBAUREiH/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AgsPy7Jw7V9Zs6u5VYxasStGqIojGKSSSS6JJJJJJJJJJJJJJJJJJP/Z" },
    { id: 2,  name: "Mechanical Keyboard",  src: "https://picsum.photos/seed/keyboard/800/533",   width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAABgUHCP/QABsQAAIDAQEBAAAAAAAAAAAAAAECAxEhMf/EABQBAQAAAAAAAAAAAAAAAAAAAAD/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCjkXFWGOsXuJkN3JKcnMllJJJJJSSSSSSSSSSSSSSSSSSSSSSSP/2Q==" },
    { id: 3,  name: "USB-C Hub",            src: "https://picsum.photos/seed/hub/800/533",        width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
    { id: 4,  name: "Laptop Stand",         src: "https://picsum.photos/seed/stand/800/533",      width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
    { id: 5,  name: "Webcam 4K",            src: "https://picsum.photos/seed/webcam/800/533",     width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
    { id: 6,  name: "Desk Lamp",            src: "https://picsum.photos/seed/lamp/800/533",       width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
    { id: 7,  name: "Monitor 27\"",         src: "https://picsum.photos/seed/monitor/800/533",    width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
    { id: 8,  name: "Gaming Mouse",         src: "https://picsum.photos/seed/mouse/800/533",      width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
    { id: 9,  name: "Desk Mat XL",          src: "https://picsum.photos/seed/deskmat/800/533",    width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
    { id: 10, name: "Microphone",           src: "https://picsum.photos/seed/mic/800/533",        width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
    { id: 11, name: "Stream Deck",          src: "https://picsum.photos/seed/streamdeck/800/533", width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
    { id: 12, name: "Cable Management Box", src: "https://picsum.photos/seed/cables/800/533",     width: 800, height: 533, lqip: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFAABAAAAAAAAAAAAAAAAAAAACf/EABQQAQAAAAAAAAAAAAAAAAAAAAD/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/8QAFBEBAAAAAAAAAAAAAAAAAAAAAP/aAAwDAQACEQMRAD8AJgAB/9k=" },
]

// ─── ReservedImage ─────────────────────────────────────────────────────────────

interface ReservedImageProps {
    /** Full-resolution image URL; undefined while the lazy gate defers the fetch */
    src: string | undefined
    /** Native width — used to compute aspect-ratio so the box is reserved before bytes arrive */
    width: number
    /** Native height — used to compute aspect-ratio */
    height: number
    /** Tiny base64 data URI (~20px) rendered as blurred background, zero network cost */
    lqip: string
    alt: string
    /** 'high' only for the LCP hero; default 'auto' for the rest */
    fetchPriority?: "high" | "low" | "auto"
    /** Optional extra class applied to the outer .frame div */
    className?: string
    /** Stored as data-fullsrc so Playwright can read the target URL before the fetch fires */
    "data-fullsrc"?: string
}

/**
 * ReservedImage — box reservation + LQIP blur-up crossfade.
 *
 * The aspect-ratio derived from width/height tells the browser the box height
 * BEFORE any image byte arrives, so no reflow occurs → CLS = 0.
 * The LQIP layer is painted instantly from a data URI; when the sharp image
 * finishes loading, the .shown class triggers a 300 ms opacity crossfade.
 */
export function ReservedImage({
    src,
    width,
    height,
    lqip,
    alt,
    fetchPriority = "auto",
    className = "",
    "data-fullsrc": dataFullsrc,
}: ReservedImageProps): JSX.Element {
    const [loaded, setLoaded] = useState<boolean>(false)

    return (
        // aspect-ratio reserves the box height from width BEFORE any byte arrives
        <div className={`frame ${className}`} style={{ aspectRatio: `${width} / ${height}` }}>
            {/* The LQIP is a blurred background painted instantly from the data URI */}
            <img className="lqip" src={lqip} alt="" aria-hidden="true" />
            <img
                className={loaded ? "sharp shown" : "sharp"}
                src={src}
                width={width}
                height={height}
                alt={alt}
                // fetchpriority re-orders this image in the browser priority queue
                fetchPriority={fetchPriority}
                // data-fullsrc lets Playwright check the target URL before the request fires
                data-fullsrc={dataFullsrc ?? src}
                // Crossfade from blurred LQIP to the sharp image on decode
                onLoad={() => setLoaded(true)}
            />
        </div>
    )
}

// ─── useLazyImage ──────────────────────────────────────────────────────────────

/**
 * Hand-written lazy loader: returns a ref to attach to a wrapper element
 * and a boolean that flips true once the element enters the rootMargin band.
 *
 * IntersectionObserver fires its callback off the critical path (outside the
 * main thread), unlike scroll listeners which run synchronously on every frame.
 * rootMargin grows the viewport so the fetch starts slightly BEFORE the image
 * scrolls into view, hiding network latency.
 */
export function useLazyImage(rootMargin = "200px"): { ref: React.RefObject<HTMLDivElement>; visible: boolean } {
    const ref = useRef<HTMLDivElement>(null!)
    const [visible, setVisible] = useState<boolean>(false)

    useEffect(() => {
        const el = ref.current
        if (el === null) {
            return
        }
        // The observer fires its callback off the critical path, keeping the main thread free
        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        setVisible(true)
                        // Once loaded we never need to observe this element again
                        observer.disconnect()
                    }
                }
            },
            // rootMargin grows the viewport so the fetch starts slightly BEFORE the image scrolls in
            { rootMargin },
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [rootMargin])

    return { ref, visible }
}

// ─── Hero ──────────────────────────────────────────────────────────────────────

interface HeroProps {
    src: string
    width: number
    height: number
    lqip: string
}

/**
 * Hero — LCP element with high fetchpriority and a preload hint in <head>.
 *
 * Two mechanisms push this image to the top of the browser's priority queue:
 *  1. fetchpriority="high" overrides the default Low priority assigned to images.
 *  2. <link rel="preload"> lets the preload scanner discover the URL early,
 *     before the parser reaches the <img> tag in the DOM.
 * Both together mean the hero image jumps ahead of below-fold images in the
 * resource queue → earlier download → smaller LCP.
 */
export function Hero({ src, width, height, lqip }: HeroProps): JSX.Element {
    useEffect(() => {
        // Inject a preload hint so the browser discovers and prioritises the hero early
        const link = document.createElement("link")
        link.rel = "preload"
        link.as = "image"
        link.href = src
        // 'high' tells the preload scanner this is the most important image
        link.setAttribute("fetchpriority", "high")
        document.head.appendChild(link)
        return () => {
            document.head.removeChild(link)
        }
    }, [src])

    return (
        // The hero is the LCP element: high priority + preload makes it land first
        <ReservedImage
            src={src}
            width={width}
            height={height}
            lqip={lqip}
            alt="Featured product"
            fetchPriority="high"
            data-fullsrc={src}
        />
    )
}

// ─── ProductCard ───────────────────────────────────────────────────────────────

/**
 * ProductCard — lazy-loaded LQIP card for below-fold products.
 *
 * Uses useLazyImage to defer the src assignment until the card enters the
 * rootMargin band. The ReservedImage is always rendered (so the box is reserved
 * and CLS stays 0), but src is only set once the IntersectionObserver fires.
 */
function ProductCard({ product, index }: { product: Product; index: number }): JSX.Element {
    const { ref, visible } = useLazyImage("200px")

    return (
        // The ref wrapper lets IntersectionObserver track when this card enters rootMargin.
        // The testid + ref stay on this element so the observer + Playwright selectors are unchanged.
        <div ref={ref} data-testid={`product-${index}`}>
            <Card className="gap-0 overflow-hidden rounded-3xl border border-border p-0 shadow-none">
                <ReservedImage
                    // Only assign the real src once the card is near the viewport.
                    // Use undefined (not the lqip) so the sharp <img> does not fire onLoad
                    // for the placeholder — the crossfade must wait for the REAL image.
                    src={visible ? product.src : undefined}
                    width={product.width}
                    height={product.height}
                    lqip={product.lqip}
                    alt={product.name}
                    fetchPriority="auto"
                    // data-fullsrc stores the real URL so Playwright can detect it before the fetch
                    data-fullsrc={product.src}
                />
                <Card.Content className="p-3">
                    <Typography.Paragraph size="sm" weight="semibold">
                        {product.name}
                    </Typography.Paragraph>
                </Card.Content>
            </Card>
        </div>
    )
}

// ─── LqipImageClient ───────────────────────────────────────────────────────────

/**
 * LqipImageClient — full demo:
 *  - Hero (first product) rendered at the top with fetchpriority=high + preload.
 *  - Grid of the remaining 11 products below; each uses useLazyImage so they
 *    are only fetched when they approach the viewport.
 *  - Products are fetched from GET /api/products; falls back to static data on error.
 */
export function LqipImageClient(): JSX.Element {
    const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS)
    const [showReloadHint, setShowReloadHint] = useState<boolean>(false)

    const apiBase =
        typeof import.meta.env.VITE_API_BASE === "string" && import.meta.env.VITE_API_BASE
            ? new URL(import.meta.env.VITE_API_BASE).origin
            : "http://localhost:3000"

    useEffect(() => {
        fetch(`${apiBase}/api/products`)
            .then((res) => (res.ok ? (res.json() as Promise<Product[]>) : Promise.reject()))
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setProducts(data)
            })
            .catch(() => {
                // Backend unavailable — keep static fallback silently
            })
    }, [apiBase])

    const heroProduct = products[0]
    const gridProducts = products.slice(1)

    return (
        <div className="flex flex-col gap-6">
            {/* Hero — LCP element, high fetchpriority + preload. testid stays on the
                outer div so flow-4 can read .sharp inside it unchanged. */}
            <div className="flex flex-col gap-3">
                <div data-testid="hero" className="overflow-hidden rounded-3xl border border-border">
                    <Hero
                        src={heroProduct.src}
                        width={heroProduct.width}
                        height={heroProduct.height}
                        lqip={heroProduct.lqip}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="text-sm font-semibold">fetchpriority=&quot;high&quot;</span>
                    <span className="text-sm font-semibold">&lt;link rel=&quot;preload&quot;&gt;</span>
                    <Typography.Paragraph size="sm" color="muted">
                        Hero is prioritised so it lands first → smaller LCP.
                    </Typography.Paragraph>
                </div>
            </div>

            <div className="flex items-center justify-between gap-3">
                <Typography.Paragraph size="sm" color="muted">
                    Reload bypassing cache to watch the LQIP blur-up replay.
                </Typography.Paragraph>
                <Button
                    variant="primary"
                    size="sm"
                    className="shrink-0 rounded-3xl"
                    isPending={showReloadHint}
                    onPress={() => {
                        setShowReloadHint(true)
                        window.location.reload()
                    }}
                >
                    Reload
                </Button>
            </div>

            {/* Product grid — below-fold images lazy-loaded via IntersectionObserver */}
            <section data-testid="product-grid" className="product-grid">
                {gridProducts.map((p, i) => (
                    <ProductCard key={p.id} product={p} index={i + 2} />
                ))}
            </section>
        </div>
    )
}
