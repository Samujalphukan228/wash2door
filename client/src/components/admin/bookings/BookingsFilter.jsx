'use client';

import { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
];

const CATEGORY_OPTIONS = [
    { value: '', label: 'All Categories' },
    { value: 'basic', label: 'Basic' },
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' }
];

const TYPE_OPTIONS = [
    { value: '', label: 'All Types' },
    { value: 'online', label: 'Online' },
    { value: 'walkin', label: 'Walk-in' }
];

export default function BookingsFilter({ filters, onFilterChange }) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            onFilterChange({ search: searchInput });
        }
    };

    const hasActiveFilters = filters.status || filters.bookingType ||
        filters.serviceCategory || filters.date ||
        filters.city || filters.search;

    const clearAll = () => {
        setSearchInput('');
        onFilterChange({
            search: '',
            status: '',
            bookingType: '',
            serviceCategory: '',
            date: '',
            city: ''
        });
    };

    return (
        <div className="space-y-3">

            {/* Main Filter Row */}
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
                        placeholder="Search booking code, customer..."
                        className="w-full bg-neutral-950 border border-neutral-800 text-white placeholder-neutral-600 text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
                    />
                </div>

                {/* Status */}
                <select
                    value={filters.status}
                    onChange={(e) => onFilterChange({ status: e.target.value })}
                    className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
                >
                    {STATUS_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Type */}
                <select
                    value={filters.bookingType}
                    onChange={(e) => onFilterChange({ bookingType: e.target.value })}
                    className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
                >
                    {TYPE_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                {/* Advanced Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`flex items-center gap-2 border text-xs tracking-widest uppercase px-4 py-2.5 transition-colors ${
                        showAdvanced
                            ? 'border-white text-white'
                            : 'border-neutral-800 text-neutral-500 hover:border-neutral-600 hover:text-white'
                    }`}
                >
                    <Filter className="w-3.5 h-3.5" />
                    Filters
                </button>

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

            {/* Advanced Filters */}
            {showAdvanced && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border border-neutral-800 bg-neutral-950">

                    {/* Category */}
                    <div>
                        <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                            Category
                        </label>
                        <select
                            value={filters.serviceCategory}
                            onChange={(e) => onFilterChange({ serviceCategory: e.target.value })}
                            className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                        >
                            {CATEGORY_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                            Booking Date
                        </label>
                        <input
                            type="date"
                            value={filters.date}
                            onChange={(e) => onFilterChange({ date: e.target.value })}
                            className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                            City
                        </label>
                        <input
                            type="text"
                            value={filters.city}
                            onChange={(e) => onFilterChange({ city: e.target.value })}
                            placeholder="Filter by city"
                            className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                        />
                    </div>

                    {/* Limit */}
                    <div>
                        <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                            Per Page
                        </label>
                        <select
                            value={filters.limit}
                            onChange={(e) => onFilterChange({ limit: Number(e.target.value) })}
                            className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                        >
                            {[10, 25, 50].map(n => (
                                <option key={n} value={n}>{n} per page</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}
        </div>
    );
}