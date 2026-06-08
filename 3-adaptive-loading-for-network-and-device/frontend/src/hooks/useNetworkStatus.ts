import { useEffect, useState } from "react"

/** A normalized snapshot of the user runtime constraints. */
export type Capabilities = {
    /** "4g" | "3g" | "2g" | "slow-2g" | "unknown" */
    effectiveType: string
    /** User opted into the browser data-saver. */
    saveData: boolean
    /** OS-level prefers-reduced-data is on. */
    reducedData: boolean
    /** Approximate device RAM in GB; defaults high when unknown. */
    deviceMemory: number
    /** Derived: slow network OR any data-saver signal. */
    constrained: boolean
}

/** Read every signal behind feature-detection so absent APIs never throw. */
const readCapabilities = (): Capabilities => {
    const nav = navigator as Navigator & {
        connection?: { effectiveType?: string; saveData?: boolean }
        deviceMemory?: number
    }
    const connection = nav.connection
    const effectiveType = connection?.effectiveType ?? "unknown"
    const saveData = connection?.saveData ?? false
    // matchMedia is widely supported; the query itself may be unknown -> matches false.
    const reducedData = window.matchMedia("(prefers-reduced-data: reduce)").matches
    // deviceMemory is absent on Safari/Firefox; assume a capable device (4 GB) when missing.
    const deviceMemory = nav.deviceMemory ?? 4
    const slowNetwork =
        effectiveType === "2g" || effectiveType === "slow-2g" || effectiveType === "3g"
    const constrained = slowNetwork || saveData || reducedData
    return { effectiveType, saveData, reducedData, deviceMemory, constrained }
}

/** Returns a live snapshot of detected network and device capabilities. */
export const useNetworkStatus = (): Capabilities => {
    const [caps, setCaps] = useState<Capabilities>(() => readCapabilities())

    useEffect(() => {
        const update = (): void => setCaps(readCapabilities())
        const nav = navigator as Navigator & { connection?: EventTarget }
        // The connection object emits 'change' when network type or saveData flips.
        nav.connection?.addEventListener?.("change", update)
        const mql = window.matchMedia("(prefers-reduced-data: reduce)")
        mql.addEventListener?.("change", update)
        return () => {
            nav.connection?.removeEventListener?.("change", update)
            mql.removeEventListener?.("change", update)
        }
    }, [])

    return caps
}
