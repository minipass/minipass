import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/css'

const badgeVariants = cva(
    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border transition-colors duration-200',
    {
        variants: {
            variant: {
                default: 'bg-gray-100 text-gray-800 border-gray-200',
                secondary: 'bg-blue-100 text-blue-800 border-blue-200',
                destructive: 'bg-red-100 text-red-800 border-red-200',
                success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                warning: 'bg-amber-100 text-amber-800 border-amber-200',
                info: 'bg-sky-100 text-sky-800 border-sky-200',
                outline: 'text-gray-700 border-gray-300 bg-transparent',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
)

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
