'use client';

import { useState, useMemo } from 'react';
import { BarChart3, ChevronDown, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

export default function RevenueChart({ categoryData = [], weeklyData = [], totals = {} }) {
    const [activeIndex, setActiveIndex] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [viewMode, setViewMode] = useState('days');

    console.log('🎨 RevenueChart Received:', {
        weeklyData: weeklyData?.length,
        categoryData: categoryData?.length,
        totals
    });

    const formatValue = (val) => {
        if (val === undefined || val === null || isNaN(val)) return '₹0';
        const num = Number(val);
        if (isNaN(num)) return '₹0';
        if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
        if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + 'k';
        return '₹' + num.toLocaleString('en-IN');
    };

    const safeWeeklyData = Array.isArray(weeklyData) ? weeklyData : [];
    const safeCategoryData = Array.isArray(categoryData) ? categoryData : [];
    const data = viewMode === 'days' ? safeWeeklyData : safeCategoryData;

    if (!data || data.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8">
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">No {viewMode} data available</p>
                </div>
            </div>
        );
    }

    const chartLabels = data.map((d, idx) => {
        if (viewMode === 'days' && d.day) {
            return new Date(d.day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
        }
        return d.name || `#${idx + 1}`;
    });

    const chartValues = data.map(d => {
        const val = d.revenue;
        return typeof val === 'number' && val >= 0 ? val : 0;
    });

    const chartDates = data.map(d => {
        if (viewMode === 'days' && d.day) {
            return new Date(d.day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        }
        return d.name || 'Unknown';
    });

    const hasValidData = chartValues.some(v => v > 0);
    if (!hasValidData) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8">
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-12 h-12 rounded-full border border-white/[0.08] flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-yellow-600" />
                    </div>
                    <p className="text-sm text-gray-500">No revenue data yet</p>
                </div>
            </div>
        );
    }

    const maxValue = Math.max(...chartValues, 1);
    const minValue = Math.min(...chartValues);
    const totalValue = chartValues.reduce((a, b) => a + b, 0);
    const avgValue = chartValues.length > 0 ? totalValue / chartValues.length : 0;

    // Trend: compare last two points
    const trend = chartValues.length >= 2
        ? chartValues[chartValues.length - 1] - chartValues[chartValues.length - 2]
        : 0;
    const trendPct = chartValues.length >= 2 && chartValues[chartValues.length - 2] > 0
        ? ((trend / chartValues[chartValues.length - 2]) * 100).toFixed(1)
        : null;

    const displayValue = activeIndex !== null ? chartValues[activeIndex] : (totals?.totalRevenue || 0);
    const displayLabel = activeIndex !== null ? chartDates[activeIndex] : 'Total Revenue';

    const chartData = useMemo(() => ({
        labels: chartLabels,
        datasets: [{
            data: chartValues,
            borderColor: '#ffffff',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 220);
                gradient.addColorStop(0, 'rgba(255,255,255,0.12)');
                gradient.addColorStop(0.6, 'rgba(255,255,255,0.03)');
                gradient.addColorStop(1, 'rgba(255,255,255,0)');
                return gradient;
            },
            fill: true,
            tension: 0.45,
            borderWidth: 1.5,
            pointRadius: 0,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: '#000',
            pointHoverBorderColor: '#fff',
            pointHoverBorderWidth: 2,
        }]
    }), [chartLabels.join(), chartValues.join()]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        animation: { duration: 600, easing: 'easeOutQuart' },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: '#fff',
                titleColor: '#999',
                bodyColor: '#000',
                titleFont: { size: 10, weight: '500', family: 'monospace' },
                bodyFont: { size: 13, weight: '700' },
                padding: { x: 14, y: 10 },
                cornerRadius: 10,
                callbacks: {
                    label: (ctx) => `₹${(ctx.parsed.y || 0).toLocaleString('en-IN')}`
                }
            }
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: '#555', font: { size: 10, family: 'monospace' }, maxRotation: 0 }
            },
            y: { display: false, min: minValue * 0.8, max: maxValue * 1.2 }
        },
        onHover: (event, elements) => {
            setActiveIndex(elements.length > 0 ? elements[0].index : null);
        }
    }), [maxValue, minValue]);

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">

            {/* ── Top Header Bar ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-white/30" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-500">
                        Revenue
                    </span>
                </div>

                {/* View toggle — pill style */}
                <div className="flex items-center bg-white/[0.05] rounded-lg p-0.5 border border-white/[0.06]">
                    {['days', 'categories'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1 text-[10px] font-semibold uppercase tracking-wider rounded-md transition-all duration-200 ${
                                viewMode === mode
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-600 hover:text-gray-400'
                            }`}
                        >
                            {mode === 'days' ? 'Daily' : 'Category'}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Primary Display ── */}
            <div className="px-5 pt-5 pb-4">
                {/* Label */}
                <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-gray-600 mb-1.5">
                    {displayLabel}
                </p>

                {/* Big Number + Trend */}
                <div className="flex items-end gap-3 mb-5">
                    <p className="text-4xl sm:text-5xl font-bold text-white leading-none tracking-tight tabular-nums">
                        {formatValue(displayValue)}
                    </p>
                    {trendPct !== null && activeIndex === null && (
                        <div className={`flex items-center gap-1 mb-1.5 px-2 py-1 rounded-lg text-[11px] font-semibold ${
                            trend > 0
                                ? 'bg-emerald-500/[0.12] text-emerald-400'
                                : trend < 0
                                    ? 'bg-red-500/[0.12] text-red-400'
                                    : 'bg-white/[0.06] text-gray-500'
                        }`}>
                            {trend > 0 ? <TrendingUp className="w-3 h-3" /> : trend < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            <span>{trend > 0 ? '+' : ''}{trendPct}%</span>
                        </div>
                    )}
                </div>

                {/* ── 4 Stats Row ── */}
                <div className="grid grid-cols-4 gap-2 mb-5">
                    {[
                        { label: 'Total', value: formatValue(totalValue), dim: false },
                        { label: 'Avg', value: formatValue(avgValue), dim: true },
                        { label: 'Peak', value: formatValue(maxValue), accent: 'up' },
                        { label: 'Low', value: formatValue(minValue), accent: 'down' },
                    ].map(({ label, value, dim, accent }) => (
                        <div
                            key={label}
                            className={`rounded-xl p-2.5 border flex flex-col gap-1 ${
                                accent === 'up'
                                    ? 'bg-emerald-500/[0.08] border-emerald-500/[0.15]'
                                    : accent === 'down'
                                        ? 'bg-red-500/[0.08] border-red-500/[0.15]'
                                        : 'bg-white/[0.03] border-white/[0.06]'
                            }`}
                        >
                            <span className={`text-[9px] font-bold uppercase tracking-widest ${
                                accent === 'up' ? 'text-emerald-500' : accent === 'down' ? 'text-red-500' : 'text-gray-600'
                            }`}>
                                {label}
                            </span>
                            <span className={`text-[11px] font-bold tabular-nums truncate ${dim ? 'text-gray-400' : 'text-white'}`}>
                                {value}
                            </span>
                        </div>
                    ))}
                </div>

                {/* ── Chart ── */}
                <div className="h-40 -mx-1">
                    <Line data={chartData} options={options} />
                </div>
            </div>

            {/* ── Breakdown Toggle ── */}
            <div className="border-t border-white/[0.06]">
                <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-white/[0.02] transition-colors group"
                >
                    <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gray-600 group-hover:text-gray-400 transition-colors">
                        {viewMode === 'days' ? 'Daily' : 'Category'} Breakdown
                        <span className="ml-2 text-gray-700">({data.length})</span>
                    </span>
                    <ChevronDown
                        className={`w-3.5 h-3.5 text-gray-600 transition-transform duration-300 ${showBreakdown ? 'rotate-180' : ''}`}
                    />
                </button>

                {showBreakdown && (
                    <div className="pb-2 max-h-72 overflow-y-auto">
                        {/* Table Header */}
                        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-5 py-2 border-b border-white/[0.04]">
                            {['#', viewMode === 'days' ? 'Date' : 'Category', 'Share', 'Revenue'].map(h => (
                                <span key={h} className="text-[9px] font-bold uppercase tracking-widest text-gray-700">
                                    {h}
                                </span>
                            ))}
                        </div>

                        {data.map((item, i) => {
                            const val = item.revenue || 0;
                            const percentage = maxValue > 0 ? (val / maxValue) * 100 : 0;
                            const share = totalValue > 0 ? Math.round((val / totalValue) * 100) : 0;
                            const isTop = val === maxValue;

                            return (
                                <div
                                    key={item.day || item.name || i}
                                    className={`grid grid-cols-[auto_1fr_auto_auto] gap-3 items-center px-5 py-2.5 transition-colors ${
                                        isTop ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                                    }`}
                                >
                                    {/* Rank */}
                                    <span className={`text-[10px] font-mono w-4 ${isTop ? 'text-white' : 'text-gray-700'}`}>
                                        {i + 1}
                                    </span>

                                    {/* Name + bar */}
                                    <div className="flex flex-col gap-1.5 min-w-0">
                                        <span className={`text-[11px] font-medium truncate ${isTop ? 'text-white' : 'text-gray-400'}`}>
                                            {viewMode === 'days' ? chartDates[i] : item.name}
                                        </span>
                                        <div className="h-px bg-white/[0.06] rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isTop ? 'bg-white/50' : 'bg-white/15'}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Share */}
                                    <span className="text-[10px] font-mono text-gray-600 tabular-nums w-8 text-right">
                                        {share}%
                                    </span>

                                    {/* Value */}
                                    <span className={`text-[11px] font-semibold tabular-nums text-right w-16 ${isTop ? 'text-white' : 'text-gray-500'}`}>
                                        {formatValue(val)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* ── Footer ── */}
            <div className="px-5 py-2.5 border-t border-white/[0.04] flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3 text-gray-700 shrink-0" />
                    <span className="text-[10px] font-mono text-gray-700">
                        {viewMode === 'days' ? 'daily' : 'category'} · {data.length} entries
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-6 h-px bg-white/20" />
                    <div className="w-1.5 h-1.5 rounded-full border border-white/20" />
                </div>
            </div>
        </div>
    );
}

function MiniStat({ label, value, highlight }) {
    return (
        <div className={`p-3 rounded-xl border text-center ${
            highlight === 'up'
                ? 'bg-emerald-500/[0.08] border-emerald-500/[0.15]'
                : highlight === 'down'
                    ? 'bg-red-500/[0.08] border-red-500/[0.15]'
                    : 'bg-white/[0.03] border-white/[0.06]'
        }`}>
            <p className={`text-[9px] font-bold uppercase tracking-widest mb-1 ${
                highlight === 'up' ? 'text-emerald-500' : highlight === 'down' ? 'text-red-500' : 'text-gray-600'
            }`}>{label}</p>
            <p className="text-[11px] font-bold text-white truncate tabular-nums">{value}</p>
        </div>
    );
}