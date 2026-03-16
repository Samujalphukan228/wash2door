// src/components/admin/reports/ReportFilters.jsx
'use client';

import { useState } from 'react';
import {
    X,
    ChevronDown,
    SlidersHorizontal,
    Calendar
} from 'lucide-react';

const PERIOD_OPTIONS = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom' }
];

const GROUP_OPTIONS = [
    { value: 'day', label: 'By Day' },
    { value: 'week', label: 'By Week' },
    { value: 'month', label: 'By Month' }
];

export default function ReportFilters({ filters, onFilterChange }) {
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const hasCustomDates = filters.startDate || filters.endDate;
    const isCustom = filters.period === 'custom';

    const activeCount = [
        filters.period && filters.period !== 'month' ? filters.period : '',
        filters.groupBy && filters.groupBy !== 'day' ? filters.groupBy : '',
        filters.startDate,
        filters.endDate
    ].filter(Boolean).length;

    const clearAll = () => {
        onFilterChange({
            period: 'month',
            groupBy: 'day',
            startDate: '',
            endDate: ''
        });
    };

    return (
        <div className="space-y-3">
            {/* Main Filter Row */}
            <div className="flex items-center gap-2">
                {/* Period Pills - Desktop */}
                <div className="hidden sm:flex items-center gap-1.5 flex-1 overflow-x-auto">
                    {PERIOD_OPTIONS.map(opt => (
                        <button
                            key={opt.value}
                            onClick={() => onFilterChange({
                                period: opt.value,
                                startDate: opt.value === 'custom' ? filters.startDate : '',
                                endDate: opt.value === 'custom' ? filters.endDate : ''
                            })}
                            className={`
                                px-3 py-2 text-[10px] sm:text-xs font-medium rounded-xl border transition-all whitespace-nowrap
                                ${filters.period === opt.value
                                    ? 'border-white/[0.15] bg-white/[0.08] text-white'
                                    : 'border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04]'
                                }
                            `}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

                {/* Period Select - Mobile */}
                <div className="sm:hidden relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <select
                        value={filters.period}
                        onChange={(e) => onFilterChange({
                            period: e.target.value,
                            startDate: e.target.value === 'custom' ? filters.startDate : '',
                            endDate: e.target.value === 'custom' ? filters.endDate : ''
                        })}
                        className="w-full appearance-none bg-white/[0.02] border border-white/[0.08] text-white text-sm pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors"
                    >
                        {PERIOD_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-black">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>

                {/* Group By - Desktop */}
                <div className="hidden sm:block relative">
                    <select
                        value={filters.groupBy}
                        onChange={(e) => onFilterChange({ groupBy: e.target.value })}
                        className="appearance-none bg-white/[0.02] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] cursor-pointer"
                    >
                        {GROUP_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value} className="bg-black">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                {/* Filter Toggle - Mobile */}
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className={`
                        sm:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all
                        ${showMobileFilters
                            ? 'border-white/[0.15] bg-white/[0.06] text-white'
                            : 'border-white/[0.08] bg-white/[0.02] text-gray-400'
                        }
                    `}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                    {activeCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-white text-black text-[10px] font-semibold flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>

                {/* Clear - Desktop */}
                {activeCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:border-white/[0.15] transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                        Reset
                    </button>
                )}
            </div>

            {/* Mobile Expanded Filters */}
            {showMobileFilters && (
                <div className="sm:hidden p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-2">
                    <div className="relative">
                        <select
                            value={filters.groupBy}
                            onChange={(e) => onFilterChange({ groupBy: e.target.value })}
                            className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2 rounded-lg focus:outline-none cursor-pointer"
                        >
                            {GROUP_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value} className="bg-black">
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                    {activeCount > 0 && (
                        <button
                            onClick={clearAll}
                            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            Reset all filters
                        </button>
                    )}
                </div>
            )}

            {/* Custom Date Range */}
            {isCustom && (
                <div className="p-3 sm:p-4 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={filters.startDate}
                                onChange={(e) => onFilterChange({ startDate: e.target.value })}
                                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors"
                            />
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <label className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={filters.endDate}
                                onChange={(e) => onFilterChange({ endDate: e.target.value })}
                                className="w-full bg-white/[0.04] border border-white/[0.08] text-white text-xs px-3 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors"
                            />
                        </div>
                        {hasCustomDates && (
                            <button
                                onClick={() => onFilterChange({ startDate: '', endDate: '' })}
                                className="self-end flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] text-xs text-gray-400 hover:text-white hover:border-white/[0.15] transition-all"
                            >
                                <X className="w-3.5 h-3.5" />
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* Active Filter Pills */}
            {activeCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                    {filters.period && filters.period !== 'month' && (
                        <FilterPill
                            label={PERIOD_OPTIONS.find(o => o.value === filters.period)?.label || filters.period}
                            onRemove={() => onFilterChange({ period: 'month' })}
                        />
                    )}
                    {filters.groupBy && filters.groupBy !== 'day' && (
                        <FilterPill
                            label={GROUP_OPTIONS.find(o => o.value === filters.groupBy)?.label || filters.groupBy}
                            onRemove={() => onFilterChange({ groupBy: 'day' })}
                        />
                    )}
                    {filters.startDate && (
                        <FilterPill
                            label={`From: ${filters.startDate}`}
                            onRemove={() => onFilterChange({ startDate: '' })}
                        />
                    )}
                    {filters.endDate && (
                        <FilterPill
                            label={`To: ${filters.endDate}`}
                            onRemove={() => onFilterChange({ endDate: '' })}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function FilterPill({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.02] text-[10px] sm:text-xs text-gray-400">
            <span className="capitalize">{label}</span>
            <button
                onClick={onRemove}
                className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
                <X className="w-3 h-3" />
            </button>
        </span>
    );
}