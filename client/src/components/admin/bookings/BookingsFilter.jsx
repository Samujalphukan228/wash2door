'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
];

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'online', label: 'Online' },
    { value: 'walkin', label: 'Walk-in' },
];

export default function BookingsFilter({ filters, onFilterChange }) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') onFilterChange({ search: searchInput });
    };

    const activeCount = [
        filters.status,
        filters.bookingType,
        filters.categoryName,
        filters.date,
        filters.city,
        filters.search,
    ].filter(Boolean).length;

    const clearAll = () => {
        setSearchInput('');
        onFilterChange({
            search: '',
            status: '',
            bookingType: '',
            categoryName: '',
            date: '',
            city: '',
        });
    };

    return (
        <div className="space-y-3">
            {/* Main Row */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                        onBlur={() => onFilterChange({ search: searchInput })}
                        placeholder="Search code, customer, service…"
                        className="w-full bg-zinc-800/50 border border-zinc-800 text-white text-sm placeholder-zinc-600 pl-10 pr-10 py-2.5 rounded-lg focus:outline-none focus:border-zinc-700"
                    />
                    {searchInput && (
                        <button
                            onClick={() => {
                                setSearchInput('');
                                onFilterChange({ search: '' });
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                {/* Status */}
                <div className="relative">
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ status: e.target.value })}
                        className="appearance-none bg-zinc-800/50 border border-zinc-800 text-white text-sm pl-3 pr-8 py-2.5 rounded-lg focus:outline-none focus:border-zinc-700 cursor-pointer"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>

                {/* Type */}
                <div className="relative">
                    <select
                        value={filters.bookingType}
                        onChange={(e) => onFilterChange({ bookingType: e.target.value })}
                        className="appearance-none bg-zinc-800/50 border border-zinc-800 text-white text-sm pl-3 pr-8 py-2.5 rounded-lg focus:outline-none focus:border-zinc-700 cursor-pointer"
                    >
                        {TYPE_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                </div>

                {/* Advanced Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                        showAdvanced
                            ? 'border-zinc-700 bg-zinc-800 text-white'
                            : 'border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                    }`}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-white text-black text-xs font-semibold flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>

                {/* Clear */}
                {activeCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-lg border border-zinc-800 text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors"
                    >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                )}
            </div>

            {/* Active Pills */}
            {activeCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {filters.status && (
                        <FilterPill
                            label={STATUS_OPTIONS.find((o) => o.value === filters.status)?.label}
                            onRemove={() => onFilterChange({ status: '' })}
                        />
                    )}
                    {filters.bookingType && (
                        <FilterPill
                            label={TYPE_OPTIONS.find((o) => o.value === filters.bookingType)?.label}
                            onRemove={() => onFilterChange({ bookingType: '' })}
                        />
                    )}
                    {filters.categoryName && (
                        <FilterPill
                            label={`Category: ${filters.categoryName}`}
                            onRemove={() => onFilterChange({ categoryName: '' })}
                        />
                    )}
                    {filters.date && (
                        <FilterPill
                            label={`Date: ${filters.date}`}
                            onRemove={() => onFilterChange({ date: '' })}
                        />
                    )}
                    {filters.city && (
                        <FilterPill
                            label={`City: ${filters.city}`}
                            onRemove={() => onFilterChange({ city: '' })}
                        />
                    )}
                    {filters.search && (
                        <FilterPill
                            label={`"${filters.search}"`}
                            onRemove={() => {
                                setSearchInput('');
                                onFilterChange({ search: '' });
                            }}
                        />
                    )}
                </div>
            )}

            {/* Advanced Panel */}
            {showAdvanced && (
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2">Category</label>
                            <input
                                type="text"
                                value={filters.categoryName || ''}
                                onChange={(e) => onFilterChange({ categoryName: e.target.value })}
                                placeholder="e.g. Car Wash"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2">Booking Date</label>
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => onFilterChange({ date: e.target.value })}
                                className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-zinc-600 [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2">City</label>
                            <input
                                type="text"
                                value={filters.city}
                                onChange={(e) => onFilterChange({ city: e.target.value })}
                                placeholder="Filter by city"
                                className="w-full bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-600 text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-zinc-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-zinc-500 mb-2">Per Page</label>
                            <div className="relative">
                                <select
                                    value={filters.limit}
                                    onChange={(e) => onFilterChange({ limit: Number(e.target.value) })}
                                    className="appearance-none w-full bg-zinc-800 border border-zinc-700 text-white text-sm pl-3 pr-8 py-2 rounded-lg focus:outline-none focus:border-zinc-600 cursor-pointer"
                                >
                                    {[10, 25, 50].map((n) => (
                                        <option key={n} value={n}>
                                            {n} per page
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FilterPill({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border border-zinc-800 bg-zinc-900 text-xs text-zinc-400">
            {label}
            <button
                onClick={onRemove}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-zinc-700 transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}