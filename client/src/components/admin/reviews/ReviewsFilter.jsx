'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

const RATING_OPTIONS = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
];

const VISIBILITY_OPTIONS = [
    { value: '', label: 'All Reviews' },
    { value: 'true', label: 'Visible' },
    { value: 'false', label: 'Hidden' }
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'highest', label: 'Highest Rating' },
    { value: 'lowest', label: 'Lowest Rating' }
];

export default function ReviewsFilter({ filters, onFilterChange }) {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            onFilterChange({ search: searchInput });
        }
    };

    const hasActiveFilters = filters.search || filters.rating ||
        filters.isVisible || filters.sortBy !== 'newest';

    const clearAll = () => {
        setSearchInput('');
        onFilterChange({
            search: '',
            rating: '',
            isVisible: '',
            sortBy: 'newest'
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3">

            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearch}
                    onBlur={() => onFilterChange({ search: searchInput })}
                    placeholder="Search customer, service, comment..."
                    className="w-full bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
                />
            </div>

            {/* Rating */}
            <select
                value={filters.rating}
                onChange={(e) => onFilterChange({ rating: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {RATING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Visibility */}
            <select
                value={filters.isVisible}
                onChange={(e) => onFilterChange({ isVisible: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {VISIBILITY_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Sort */}
            <select
                value={filters.sortBy}
                onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Per Page */}
            <select
                value={filters.limit}
                onChange={(e) => onFilterChange({ limit: Number(e.target.value) })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {[10, 25, 50].map(n => (
                    <option key={n} value={n}>{n} per page</option>
                ))}
            </select>

            {/* Clear */}
            {hasActiveFilters && (
                <button
                    onClick={clearAll}
                    className="flex items-center gap-2 border border-neutral-800 text-neutral-500 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear
                </button>
            )}
        </div>
    );
}