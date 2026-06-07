import { I18nProvider } from "@heroui/react"

/**
 * HeroUIProvider wraps the app in the HeroUI v3 i18n context.
 * In v3 the root export is I18nProvider (no dedicated HeroUIProvider).
 */
export function HeroUIProvider({ children }: { children: React.ReactNode }): JSX.Element {
    return <I18nProvider>{children}</I18nProvider>
}
