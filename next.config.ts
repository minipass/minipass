import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [{ hostname: 'bold-jellyfish-927.convex.cloud', protocol: 'https' }],
    },
}

export default nextConfig
