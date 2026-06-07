import { Chip } from "@heroui/react"
import { useEffect, useState } from "react"

/** Shape of a product returned by GET /api/products */
export interface Product {
    id: number
    name: string
    description: string
    price: string
    image: string
}

/** Static fallback products used when the backend is unavailable. */
const FALLBACK_PRODUCTS: Product[] = [
    {
        id: 1,
        name: "Wireless Headphones",
        description: "Premium noise-cancelling over-ear headphones with 30h battery.",
        price: "$149",
        image: "https://picsum.photos/seed/headphones/400/300",
    },
    {
        id: 2,
        name: "Mechanical Keyboard",
        description: "TKL layout, Cherry MX Red switches, per-key RGB backlight.",
        price: "$89",
        image: "https://picsum.photos/seed/keyboard/400/300",
    },
    {
        id: 3,
        name: "USB-C Hub",
        description: "7-in-1 hub: HDMI 4K, 3× USB-A, SD/MicroSD, 100W PD.",
        price: "$45",
        image: "https://picsum.photos/seed/hub/400/300",
    },
    {
        id: 4,
        name: "Laptop Stand",
        description: "Aluminium riser, adjustable 0–20°, folds flat for travel.",
        price: "$35",
        image: "https://picsum.photos/seed/stand/400/300",
    },
    {
        id: 5,
        name: "Webcam 4K",
        description: "Sony sensor, auto-focus, built-in ring light, privacy shutter.",
        price: "$119",
        image: "https://picsum.photos/seed/webcam/400/300",
    },
    {
        id: 6,
        name: "Desk Lamp",
        description: "LED, 5 colour temperatures, USB-A charging port, touch dimmer.",
        price: "$29",
        image: "https://picsum.photos/seed/lamp/400/300",
    },
]

/** Single product card — no variant prop; layout adapts via container query in CSS. */
function ProductCard({ product }: { product: Product }): JSX.Element {
    return (
        // The wrapper is the query container; the card reads ITS width, not the viewport
        <div className="card-container">
            <article className="card" data-testid={`card-${product.id}`}>
                <img
                    className="card-thumb"
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                />
                <div className="card-body">
                    <h3 className="card-title">{product.name}</h3>
                    {/* Description and buy button only appear in the rich (wide-container) layout */}
                    <p className="card-desc" data-testid={`desc-${product.id}`}>
                        {product.description}
                    </p>
                    <button className="card-buy" type="button">
                        Buy {product.price}
                    </button>
                </div>
            </article>
        </div>
    )
}

/** Grid — browser computes column count via auto-fit + minmax; no @media written. */
function ProductGrid({ products }: { products: Product[] }): JSX.Element {
    return (
        <ul className="product-grid" data-testid="product-grid">
            {products.map((p) => (
                <li key={p.id}>
                    {/* Same ProductCard component, no variant prop */}
                    <ProductCard product={p} />
                </li>
            ))}
        </ul>
    )
}

/**
 * ResponsiveLayoutClient — the full demo:
 *   - sidebar slot (~260px) + main slot (flex-1) side by side.
 *   - Both slots render the SAME ProductCard component.
 *   - Container query in CSS handles compact vs rich layout per slot.
 *   - Products fetched from GET /api/products; falls back to static data on error.
 */
export function ResponsiveLayoutClient(): JSX.Element {
    const [products, setProducts] = useState<Product[]>(FALLBACK_PRODUCTS)

    useEffect(() => {
        const apiBase =
            typeof import.meta.env.VITE_API_BASE === "string" && import.meta.env.VITE_API_BASE
                ? import.meta.env.VITE_API_BASE
                : "http://localhost:3000"

        fetch(`${apiBase}/api/products`)
            .then((res) => (res.ok ? (res.json() as Promise<Product[]>) : Promise.reject()))
            .then((data) => {
                if (Array.isArray(data) && data.length > 0) setProducts(data)
            })
            .catch(() => {
                // Backend unavailable — keep static fallback silently
            })
    }, [])

    // Show only the first two products in the sidebar to keep it scannable
    const sidebarProducts = products.slice(0, 2)

    return (
        <div className="page-layout">
            {/* Sidebar slot: narrow (~260px) — cards use compact layout via @container */}
            <aside className="slot-sidebar" data-testid="slot-sidebar">
                <div className="slot-label">
                    <Chip variant="soft" color="default" size="sm">
                        Sidebar
                    </Chip>
                </div>
                <ProductGrid products={sidebarProducts} />
            </aside>

            {/* Main slot: wide (flex-1) — same cards switch to rich layout via @container */}
            <main className="slot-main" data-testid="slot-main">
                <div className="slot-label">
                    <Chip variant="soft" color="accent" size="sm">
                        Main column
                    </Chip>
                </div>
                <ProductGrid products={products} />
            </main>
        </div>
    )
}
