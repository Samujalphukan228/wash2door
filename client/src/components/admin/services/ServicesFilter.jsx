'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import categoryService from '@/services/categoryService';

const TIERS = [
    { value: '', label: 'All Tiers' },
    { value: 'basic', label: 'Basic' },
    { value: 'standard', label: 'Standard' },
    { value: 'premium', label: 'Premium' },
    { value: 'custom', label: 'Custom' }
];

const STATUS_OPTIONS = [
    { value: '', label: 'All Status' },
    { value: 'true', label: 'Active' },
    { value: 'false', label: 'Inactive' }
];

const selectCls = `
    bg-white/[0.03] border border-white/[0.08]
    text-white/70 text-sm
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
    disabled:opacity-40
    appearance-none cursor-pointer
`;

export default function ServicesFilter({ filters, onFilterChange }) {
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await categoryService.getAll({ isActive: true, limit: 100 });
                if (response.success) {
                    setCategories(response.data);
                }
            } catch (error) {
                console.error('Failed to load categories');
            } finally {
                setLoadingCategories(false);
            }
        };
        fetchCategories();
    }, []);

    const hasActiveFilters = filters.category || filters.tier || filters.isActive !== '';

    return (
        <div className="flex flex-col sm:flex-row gap-2.5">

            <select
                value={filters.category || ''}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                disabled={loadingCategories}
                className={selectCls}
            >
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                    </option>
                ))}
            </select>

            <select
                value={filters.tier || ''}
                onChange={(e) => onFilterChange({ tier: e.target.value })}
                className={selectCls}
            >
                {TIERS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            <select
                value={filters.isActive}
                onChange={(e) => onFilterChange({ isActive: e.target.value })}
                className={selectCls}
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
                className={selectCls}
            >
                {[12, 24, 48].map(n => (
                    <option key={n} value={n}>{n} per page</option>
                ))}
            </select>

            {hasActiveFilters && (
                <button
                    onClick={() => onFilterChange({ category: '', tier: '', isActive: '' })}
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