'use client';

import { X } from 'lucide-react';

const CATEGORIES = [
    { value: '', label: 'All Categories' },
    { value: 'basic', label: 'Basic' },
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' }
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
];

export default function ServicesFilter({ filters, onFilterChange }) {
    const hasActiveFilters = filters.category || filters.isActive !== '';

    return (
        <div className="flex flex-col sm:flex-row gap-3">
            <select
                value={filters.category}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {CATEGORIES.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <select
                value={filters.isActive}
                onChange={(e) => onFilterChange({ isActive: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <select
                value={filters.limit}
                onChange={(e) => onFilterChange({ limit: Number(e.target.value) })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {[12, 24, 48].map(n => (
                    <option key={n} value={n}>{n} per page</option>
                ))}
            </select>

            {hasActiveFilters && (
                <button
                    onClick={() => onFilterChange({ category: '', isActive: '' })}
                    className="flex items-center gap-2 border border-neutral-800 text-neutral-500 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear
                </button>
            )}
        </div>
    );
}