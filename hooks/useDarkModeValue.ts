import { useEffect, useState } from 'react'

export const useDarkModeValue = <T>(light: T, dark: T) => {
    const [value, setValue] = useState<T | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined') return

        // Set initial value
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            setValue(dark)
        } else {
            setValue(light)
        }

        // Listen for changes to do this automatically
        const handleChange = (e: MediaQueryListEvent) => {
            setValue(e.matches ? dark : light)
        }

        const media = window.matchMedia('(prefers-color-scheme: dark)')
        media.addEventListener('change', handleChange)

        return () => {
            media.removeEventListener('change', handleChange)
        }
    }, [])

    return value
}
