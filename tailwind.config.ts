import type { Config } from 'tailwindcss'

export default {
    darkMode: 'media',
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                chart: {
                    '1': 'hsl(var(--chart-1))',
                    '2': 'hsl(var(--chart-2))',
                    '3': 'hsl(var(--chart-3))',
                    '4': 'hsl(var(--chart-4))',
                    '5': 'hsl(var(--chart-5))',
                },
                // Override default blue and red colors with proper minipass color scales
                blue: {
                    50: '#f0f2ff', // Very light blue
                    100: '#e0e7ff', // Light blue
                    200: '#c7d2fe', // Lighter blue
                    300: '#a5b4fc', // Light-medium blue
                    400: '#818cf8', // Medium-light blue
                    500: '#374375', // Main minipass blue
                    600: '#374375', // Main minipass blue
                    700: '#2d3660', // Darker blue
                    800: '#252a4b', // Dark blue
                    900: '#1e2336', // Very dark blue
                    950: '#131620', // Darkest blue
                },
                red: {
                    50: '#f8eeed', // Very light red
                    100: '#f1ddd9', // Light red
                    200: '#e2bbb3', // Lighter red
                    300: '#d2998d', // Light-medium red
                    400: '#c27767', // Medium-light red
                    500: '#845158', // Main minipass red
                    600: '#845158', // Main minipass red
                    700: '#6a4146', // Darker red
                    800: '#503134', // Dark red
                    900: '#362122', // Very dark red
                    950: '#1c1112', // Darkest red
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
        },
    },
    plugins: [require('tailwindcss-animate')],
} satisfies Config
