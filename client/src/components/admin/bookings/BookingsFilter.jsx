'use client';

import { useState } from 'react';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'pending',     label: 'Pending'     },
    { value: 'confirmed',   label: 'Confirmed'   },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'completed',   label: 'Completed'   },
    { value: 'cancelled',   label: 'Cancelled'   }
];

const TYPE_OPTIONS = [
    { value: '',       label: 'All Types' },
    { value: 'online', label: 'Online'    },
    { value: 'walkin', label: 'Walk-in'   }
];

const statusDot = {
    pending:       'bg-yellow-400',
    confirmed:     'bg-blue-400',
    'in-progress': 'bg-purple-400',
    completed:     'bg-green-400',
    cancelled:     'bg-red-400'
};

/* ── Shared input classes ── */
const inputBase = `
    w-full bg-white/[0.03] border border-white/[0.08]
    text-white/80 text-xs placeholder-white/20
    px-3 py-2 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
`;

const selectBase = `
    bg-white/[0.03] border border-white/[0.08]
    text-white/70 text-xs
    pl-3 pr-8 py-2 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
    appearance-none cursor-pointer
`;

export default function BookingsFilter({ filters, onFilterChange }) {
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [searchInput, setSearchInput]   = useState(filters.search || '');
    const [searchFocused, setSearchFocused] = useState(false);

    const handleSearch = (e) => {
        if (e.key === 'Enter') onFilterChange({ search: searchInput });
    };

    const activeFilterCount = [
        filters.status,
        filters.bookingType,
        filters.categoryName,
        filters.date,
        filters.city,
        filters.search
    ].filter(Boolean).length;

    const clearAll = () => {
        setSearchInput('');
        onFilterChange({
            search: '', status: '', bookingType: '',
            categoryName: '', date: '', city: ''
        });
    };

    return (
        <div className="space-y-2">

            {/* ── Main Row ── */}
            <div className="flex items-center gap-2">

                {/* Search */}
                <div className={`
                    relative flex-1 flex items-center
                    rounded-lg border transition-all duration-150
                    ${searchFocused
                        ? 'border-white/20 bg-white/[0.05]'
                        : 'border-white/[0.08] bg-white/[0.03]'
                    }
                `}>
                    <Search className="absolute left-3 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                        onBlur={() => {
                            setSearchFocused(false);
                            onFilterChange({ search: searchInput });
                        }}
                        onFocus={() => setSearchFocused(true)}
                        placeholder="Search code, customer, service…"
                        className="
                            w-full bg-transparent text-white/80 text-xs
                            placeholder-white/20 pl-9 pr-3 py-2.5
                            focus:outline-none
                        "
                    />
                    {searchInput && (
                        <button
                            onClick={() => { setSearchInput(''); onFilterChange({ search: '' }); }}
                            className="absolute right-2.5 p-0.5 rounded text-white/25 hover:text-white/60 transition-colors"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    )}
                </div>

                {/* Status Select */}
                <SelectWrapper>
                    <select
                        value={filters.status}
                        onChange={(e) => onFilterChange({ status: e.target.value })}
                        className={selectBase}
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-neutral-900">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    {filters.status && (
                        <span className={`absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none ${statusDot[filters.status]}`} />
                    )}
                </SelectWrapper>

                {/* Type Select */}
                <SelectWrapper>
                    <select
                        value={filters.bookingType}
                        onChange={(e) => onFilterChange({ bookingType: e.target.value })}
                        className={`${selectBase} ${filters.status ? 'pl-6' : 'pl-3'}`}
                    >
                        {TYPE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-neutral-900">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </SelectWrapper>

                {/* Advanced Toggle */}
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className={`
                        relative flex items-center gap-1.5 px-3 py-2 rounded-lg
                        border text-xs font-medium shrink-0
                        transition-all duration-150
                        ${showAdvanced
                            ? 'border-white/20 bg-white/[0.08] text-white/80'
                            : 'border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/70 hover:border-white/[0.14]'
                        }
                    `}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Filters</span>
                    {activeFilterCount > 0 && (
                        <span className="
                            w-4 h-4 rounded-full bg-white text-black
                            text-[10px] font-semibold flex items-center justify-center
                        ">
                            {activeFilterCount}
                        </span>
                    )}
                </button>

                {/* Clear */}
                {activeFilterCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="
                            flex items-center gap-1.5 px-3 py-2 rounded-lg shrink-0
                            border border-white/[0.08] bg-white/[0.03]
                            text-xs text-white/35 hover:text-white/70
                            hover:border-white/[0.14] hover:bg-white/[0.05]
                            transition-all duration-150
                        "
                    >
                        <X className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Clear</span>
                    </button>
                )}
            </div>

            {/* ── Active Filter Pills ── */}
            {activeFilterCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {filters.status && (
                        <FilterPill
                            label={STATUS_OPTIONS.find(o => o.value === filters.status)?.label}
                            dot={statusDot[filters.status]}
                            onRemove={() => onFilterChange({ status: '' })}
                        />
                    )}
                    {filters.bookingType && (
                        <FilterPill
                            label={TYPE_OPTIONS.find(o => o.value === filters.bookingType)?.label}
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
                            onRemove={() => { setSearchInput(''); onFilterChange({ search: '' }); }}
                        />
                    )}
                </div>
            )}

            {/* ── Advanced Panel ── */}
            {showAdvanced && (
                <div className="
                    rounded-xl border border-white/[0.07]
                    bg-white/[0.02]
                    p-4 space-y-4
                ">
                    {/* Top gradient line */}
                    <div className="h-px -mx-4 -mt-4 mb-4 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

                        {/* Category */}
                        <AdvancedField label="Category">
                            <input
                                type="text"
                                value={filters.categoryName || ''}
                                onChange={(e) => onFilterChange({ categoryName: e.target.value })}
                                placeholder="e.g. Car Wash"
                                className={inputBase}
                            />
                        </AdvancedField>

                        {/* Date */}
                        <AdvancedField label="Booking Date">
                            <input
                                type="date"
                                value={filters.date}
                                onChange={(e) => onFilterChange({ date: e.target.value })}
                                className={`${inputBase} [color-scheme:dark]`}
                            />
                        </AdvancedField>

                        {/* City */}
                        <AdvancedField label="City">
                            <input
                                type="text"
                                value={filters.city}
                                onChange={(e) => onFilterChange({ city: e.target.value })}
                                placeholder="Filter by city"
                                className={inputBase}
                            />
                        </AdvancedField>

                        {/* Per Page */}
                        <AdvancedField label="Per Page">
                            <SelectWrapper full>
                                <select
                                    value={filters.limit}
                                    onChange={(e) => onFilterChange({ limit: Number(e.target.value) })}
                                    className={`${selectBase} w-full`}
                                >
                                    {[10, 25, 50].map(n => (
                                        <option key={n} value={n} className="bg-neutral-900">
                                            {n} per page
                                        </option>
                                    ))}
                                </select>
                            </SelectWrapper>
                        </AdvancedField>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Sub-components ── */

function SelectWrapper({ children, full }) {
    return (
        <div className={`relative shrink-0 ${full ? 'w-full' : ''}`}>
            {children}
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
        </div>
    );
}

function AdvancedField({ label, children }) {
    return (
        <div className="space-y-1.5">
            <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium">
                {label}
            </p>
            {children}
        </div>
    );
}

function FilterPill({ label, dot, onRemove }) {
    return (
        <span className="
            inline-flex items-center gap-1.5
            pl-2 pr-1.5 py-1 rounded-full
            border border-white/[0.08] bg-white/[0.04]
            text-[11px] text-white/50
        ">
            {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
            {label}
            <button
                onClick={onRemove}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
            >
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}