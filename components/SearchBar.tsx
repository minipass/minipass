'use client'

import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function SearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (query.trim()) {
            router.push(`/dashboard/search?q=${encodeURIComponent(query.trim())}`)
        }
    }

    return (
        <div className="w-full">
            <form onSubmit={handleSearch} className="relative">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Buscar eventos..."
                    className="w-full py-1.5 px-3 pl-8 bg-background rounded border border-input focus:outline-none focus:ring-1 focus:ring-ring focus:border-transparent transition-all duration-200 text-sm text-foreground placeholder-muted-foreground"
                />
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-2 py-1 rounded text-xs font-medium hover:bg-primary/90 transition-colors duration-200"
                >
                    Buscar
                </button>
            </form>
        </div>
    )
}
