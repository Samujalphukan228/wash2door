'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

// ✅ FIXED: Use 'user' instead of 'customer'
const ROLE_OPTIONS = [
    { value: '', label: 'All Roles' },
    { value: 'user', label: 'Customer' },
    { value: 'admin', label: 'Admin' }
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'false', label: 'Active' },
    { value: 'true', label: 'Blocked' }
];

export default function UsersFilter({ filters, onFilterChange }) {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            onFilterChange({ search: searchInput });
        }
    };

    const hasActiveFilters = filters.search || filters.role || filters.isBlocked;

    const clearAll = () => {
        setSearchInput('');
        onFilterChange({
            search: '',
            role: '',
            isBlocked: ''
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
                    placeholder="Search name, email..."
                    className="w-full bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
                />
            </div>

            {/* Role */}
            <select
                value={filters.role}
                onChange={(e) => onFilterChange({ role: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Status */}
            <select
                value={filters.isBlocked}
                onChange={(e) => onFilterChange({ isBlocked: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {STATUS_OPTIONS.map(opt => (
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