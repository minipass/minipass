import { type VariantProps, cva } from 'class-variance-authority'
import * as React from 'react'

import { cn } from '@/lib/css'

const badgeVariants = cva(
    'inline-flex items-center px-2.5 py-0.5 rounded-sm text-xs font-medium border transition-colors duration-200',
    {
        variants: {
            variant: {
                default: 'bg-muted text-muted-foreground border-border',
                secondary: 'bg-secondary text-secondary-foreground border-border',
                destructive: 'bg-destructive/10 text-destructive border-destructive/20',
                success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                warning: 'bg-amber-100 text-amber-800 border-amber-200',
                info: 'bg-sky-100 text-sky-800 border-sky-200',
                outline: 'text-foreground border-border bg-transparent',
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
