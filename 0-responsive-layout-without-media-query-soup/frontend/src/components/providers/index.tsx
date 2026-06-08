import { I18nProvider } from "@heroui/react"

interface HeroUIProviderProps { children: React.ReactNode }

export const HeroUIProvider = ({ children }: HeroUIProviderProps): JSX.Element => {
    return <I18nProvider>{children}</I18nProvider>
}
