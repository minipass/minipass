'use client'

import Image from 'next/image'

import { useDarkModeValue } from '@/hooks/useDarkModeValue'
import darkLogo2Lines from '@/images/minipass-2lines-dark.svg'
import lightLogo2Lines from '@/images/minipass-2lines.svg'
import darkLogo from '@/images/minipass-dark.svg'
import lightLogo from '@/images/minipass.svg'

interface LogoProps {
    twoLines?: boolean
    className?: string
}

function Logo({ twoLines = false, className = '' }: LogoProps) {
    const logo = useDarkModeValue(twoLines ? lightLogo2Lines : lightLogo, twoLines ? darkLogo2Lines : darkLogo)

    if (!logo) return <div className={className} />

    return <Image src={logo} alt="logo" className={className} />
}

export default Logo
