import { useEffect, useState } from "react"

/** Shape of one product returned by GET /api/products. */
export interface Product {
    id: number
    name: string
    price: string
    /** 400w candidate URL — name must contain "400" for spec Flow 1/2 assertions. */
    img400: string
    /** 800w candidate URL — name must contain "800" for spec Flow 1/2 assertions. */
    img800: string
    /** 1200w candidate URL — name must contain "1200". */
    img1200: string
    /** Wide crop AVIF — name must contain "wide" and ".avif" for Flow 3/4 assertions. */
    wideAvif: string
    /** Wide crop WebP — name must contain "wide" and ".webp". */
    wideWebp: string
    /** Wide crop JPG fallback — name must contain "wide". */
    wideJpg: string
    /** Square crop AVIF — name must contain "square" and ".avif" for Flow 4 assertions. */
    squareAvif: string
    /** Square crop WebP — name must contain "square" and ".webp". */
    squareWebp: string
    /** Square crop JPG fallback — name must contain "square". */
    squareJpg: string
}

/** Sizes attribute for the gallery grid: image display width at each breakpoint. */
const GALLERY_SIZES = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"

/**
 * Build the static fallback product list using local public/ images.
 * URL paths include the required keyword fragments so spec assertions on
 * `currentSrc` ("800", "wide", "square", ".avif") resolve correctly.
 */
function buildFallbackProducts(): Product[] {
    const base = ""
    return [1, 2, 3, 4, 5, 6].map((id) => ({
        id,
        name: [
            "Wireless Headphones",
            "Mechanical Keyboard",
            "USB-C Hub",
            "Laptop Stand",
            "Webcam 4K",
            "Desk Lamp",
        ][id - 1],
        price: ["$149", "$89", "$45", "$35", "$119", "$29"][id - 1],
        img400: `${base}/images/product-${id}-400w.jpg`,
        img800: `${base}/images/product-${id}-800w.jpg`,
        img1200: `${base}/images/product-${id}-1200w.jpg`,
        wideAvif: `${base}/images/product-${id}-wide.avif`,
        wideWebp: `${base}/images/product-${id}-wide.webp`,
        wideJpg: `${base}/images/product-${id}-wide.jpg`,
        squareAvif: `${base}/images/product-${id}-square.avif`,
        squareWebp: `${base}/images/product-${id}-square.webp`,
        squareJpg: `${base}/images/product-${id}-square.jpg`,
    }))
}

const FALLBACK_PRODUCTS = buildFallbackProducts()

/**
 * ProductImage — resolution switching via srcset + sizes.
 *
 * The BROWSER reads srcset (candidates + "w" descriptors) and sizes
 * (display width per breakpoint) then picks the best candidate — zero JS
 * involved in the choice. data-testid matches spec Flow 1/2 assertions.
 */
function ProductImage({ product }: { product: Product }): JSX.Element {
    return (
        <img
            // Each candidate is "URL <intrinsic-width>w"; browser matches against sizes x DPR.
            srcSet={`${product.img400} 400w, ${product.img800} 800w, ${product.img1200} 1200w`}
            sizes={GALLERY_SIZES}
            // Fallback for browsers that do not understand srcset.
            src={product.img800}
            width={400}
            height={300}
            alt={product.name}
            className="product-card-img"
            data-testid={`product-img-${product.id}`}
        />
    )
}

/**
 * ProductHero — art direction + format negotiation via <picture>.
 *
 * Developer controls:
 *   - media="(max-width: 640px)" swaps to a square crop below the breakpoint.
 *   - type="image/avif" / "image/webp" orders format preference; browser picks
 *     the FIRST type it supports (top-down). data-testid matches spec Flow 3/4.
 */
function ProductHero({ product }: { product: Product }): JSX.Element {
    return (
        <picture className="hero-picture">
            {/* Art direction: below 640px switch to the SQUARE crop (different framing). */}
            <source media="(max-width: 640px)" srcSet={product.squareAvif} type="image/avif" />
            <source media="(max-width: 640px)" srcSet={product.squareWebp} type="image/webp" />
            <source media="(max-width: 640px)" srcSet={product.squareJpg} type="image/jpeg" />
            {/* Format negotiation for the WIDE crop: AVIF first, then WebP, then JPG. */}
            {/* Browser walks sources top-down and picks the FIRST type it supports. */}
            <source srcSet={product.wideAvif} type="image/avif" />
            <source srcSet={product.wideWebp} type="image/webp" />
            {/* img is the JPG fallback and carries alt/width/height for CLS prevention. */}
            <img
                src={product.wideJpg}
                width={1200}
                height={400}
                alt={product.name}
                data-testid={`hero-img-${product.id}`}
            />
        </picture>
    )
}

/**
 * BelowFoldImage — lazy loading + async decoding for images below the fold.
 *
 * loading="lazy" defers download until the image approaches the viewport.
 * decoding="async" decodes off the main thread to keep scrolling smooth.
 * width/height reserve space to prevent CLS. data-testid matches spec lazy assertions.
 */
function BelowFoldImage({ product }: { product: Product }): JSX.Element {
    return (
        <img
            srcSet={`${product.img400} 400w, ${product.img800} 800w`}
            sizes="(max-width: 640px) 100vw, 400px"
            src={product.img800}
            width={400}
            height={300}
            alt={product.name}
            // Defer download until the image is near the viewport.
            loading="lazy"
            // Decode off the main thread so scrolling stays smooth.
            decoding="async"
            className="product-card-img lazy-img"
            data-testid={`lazy-img-${product.id}`}
        />
    )
}

/** Gallery card wrapping either an above-fold or below-fold image. */
function ProductCard({
    product,
    aboveFold,
}: {
    product: Product
    aboveFold: boolean
}): JSX.Element {
    return (
        <article className="product-card">
            {aboveFold ? (
                <ProductImage product={product} />
            ) : (
                <BelowFoldImage product={product} />
            )}
            <div className="product-card-body">
                <h3 className="product-card-name">{product.name}</h3>
                <p className="product-card-price">{product.price}</p>
            </div>
        </article>
    )
}

/**
 * ResponsiveImagesClient — the full gallery demo:
 *   1. Hero section: product-1 rendered with <picture> for art direction + format.
 *   2. Gallery grid: products rendered with <img srcset sizes> for resolution switching.
 *      First 2 products are above-fold (no lazy); remainder use loading="lazy".
 *   3. Products fetched from GET /api/products; falls back to static data on error.
 */
export function ResponsiveImagesClient(): JSX.Element {
    const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS)

    useEffect(() => {
        const apiBase =
            typeof import.meta.env.VITE_API_BASE === "string" && import.meta.env.VITE_API_BASE
                ? import.meta.env.VITE_API_BASE
                : "http://localhost:3000"

        fetch(`${apiBase}/api/products`)
            .then((res) => (res.ok ? (res.json() as Promise<Product[]>) : Promise.reject()))
            .then((data: unknown) => {
                if (Array.isArray(data) && data.length > 0) setProducts(data as Product[])
            })
            .catch(() => {
                // Backend unavailable — keep the static fallback silently
            })
    }, [])

    const hero = products[0]

    return (
        <div>
            {/* ── Hero: art direction + format negotiation via <picture> ── */}
            <div className="section-label">Hero (art direction + format)</div>
            {hero && <ProductHero product={hero} />}

            <div className="h-6" />

            {/* ── Gallery: resolution switching via srcset + sizes ── */}
            <div className="section-label">Gallery (resolution switching)</div>
            <ul className="gallery-grid" data-testid="gallery-grid">
                {products.map((product, index) => (
                    <li key={product.id}>
                        {/*
                         * First 2 items are above the fold — no lazy loading.
                         * Remaining items use loading="lazy" + decoding="async".
                         */}
                        <ProductCard product={product} aboveFold={index < 2} />
                    </li>
                ))}
            </ul>
        </div>
    )
}
