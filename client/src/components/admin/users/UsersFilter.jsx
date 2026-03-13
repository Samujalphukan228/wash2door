'use client';

import { useState } from 'react';
import { Search, X } from 'lucide-react';

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

const selectCls = `
    bg-white/[0.03] border border-white/[0.08]
    text-white/70 text-sm
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
    appearance-none cursor-pointer
`;

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
        onFilterChange({ search: '', role: '', isBlocked: '' });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2.5">

            {/* Search */}
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                <input
                    type="text"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleSearch}
                    onBlur={() => onFilterChange({ search: searchInput })}
                    placeholder="Search name, email..."
                    className="
                        w-full bg-white/[0.03] border border-white/[0.08]
                        text-white/80 text-sm placeholder-white/20
                        pl-10 pr-4 py-2.5 rounded-lg
                        focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
                        transition-all duration-150
                    "
                />
            </div>

            {/* Role */}
            <select
                value={filters.role}
                onChange={(e) => onFilterChange({ role: e.target.value })}
                className={selectCls}
            >
                {ROLE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            {/* Status */}
            <select
                value={filters.isBlocked}
                onChange={(e) => onFilterChange({ isBlocked: e.target.value })}
                className={selectCls}
            >
                {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            {/* Per Page */}
            <select
                value={filters.limit}
                onChange={(e) => onFilterChange({ limit: Number(e.target.value) })}
                className={selectCls}
            >
                {[10, 25, 50].map(n => (
                    <option key={n} value={n}>{n} per page</option>
                ))}
            </select>

            {/* Clear */}
            {hasActiveFilters && (
                <button
                    onClick={clearAll}
                    className="
                        flex items-center gap-2 px-4 py-2.5 rounded-lg
                        border border-white/[0.08] bg-white/[0.03]
                        text-xs text-white/40 hover:text-white/70
                        hover:border-white/[0.14] hover:bg-white/[0.05]
                        transition-all duration-150
                    "
                >
                    <X className="w-3.5 h-3.5" />
                    Clear
                </button>
            )}
        </div>
    );
}