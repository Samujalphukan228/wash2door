// src/components/admin/services/ServicesFilter.jsx

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
        <div className="flex flex-col sm:flex-row gap-3">
            
            {/* Category Filter */}
            <select
                value={filters.category || ''}
                onChange={(e) => onFilterChange({ category: e.target.value })}
                disabled={loadingCategories}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors disabled:opacity-50"
            >
                <option value="">All Categories</option>
                {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                        {cat.icon} {cat.name}
                    </option>
                ))}
            </select>

            {/* Tier Filter */}
            <select
                value={filters.tier || ''}
                onChange={(e) => onFilterChange({ tier: e.target.value })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {TIERS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>

            {/* Status Filter */}
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

            {/* Per Page */}
            <select
                value={filters.limit}
                onChange={(e) => onFilterChange({ limit: Number(e.target.value) })}
                className="bg-neutral-950 border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            >
                {[12, 24, 48].map(n => (
                    <option key={n} value={n}>{n} per page</option>
                ))}
            </select>

            {/* Clear Filters */}
            {hasActiveFilters && (
                <button
                    onClick={() => onFilterChange({ category: '', tier: '', isActive: '' })}
                    className="flex items-center gap-2 border border-neutral-800 text-neutral-500 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors"
                >
                    <X className="w-3.5 h-3.5" />
                    Clear
                </button>
            )}
        </div>
    );
}