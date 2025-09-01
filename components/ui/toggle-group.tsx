import { ReactNode } from 'react'

interface ToggleOption<T extends string> {
    value: T
    label: ReactNode
}

interface ToggleGroupProps<T extends string> {
    options: ToggleOption<T>[]
    value: T
    onChange: (value: T) => void
    className?: string
}

export function ToggleGroup<T extends string>({ options, value, onChange, className = '' }: ToggleGroupProps<T>) {
    return (
        <div className={`flex bg-gray-100 rounded-lg p-1 ${className}`}>
            {options.map(option => (
                <button
                    key={option.value}
                    type="button"
                    onClick={() => onChange(option.value)}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                        value === option.value
                            ? 'bg-white text-blue-600 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    {option.label}
                </button>
            ))}
        </div>
    )
}
