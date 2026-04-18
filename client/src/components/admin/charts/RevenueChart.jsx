'use client';

import { useState, useMemo, useRef } from 'react';
import {
    BarChart3, ChevronDown, Clock,
    ArrowUpRight, ArrowDownRight, TrendingUp,
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement,
    LineElement, Tooltip, Filler, Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler, Legend);
ChartJS.defaults.elements.line.tension = 0.4;

// ============================================
// HELPERS
// ============================================

const formatValue = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '₹0';
    const num = Number(val);
    if (isNaN(num)) return '₹0';
    if (num >= 100000) return '₹' + (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return '₹' + (num / 1000).toFixed(1) + 'k';
    return '₹' + num.toLocaleString('en-IN');
};

const formatCompact = (val) => {
    if (val === undefined || val === null || isNaN(val)) return '0';
    const num = Number(val);
    if (num >= 100000) return (num / 100000).toFixed(1) + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toLocaleString('en-IN');
};

// ============================================
// MAIN COMPONENT
// ============================================

export default function RevenueChart({ weeklyData = [], totals = {} }) {
    const chartRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [activeMetric, setActiveMetric] = useState('revenue');

    const safeWeeklyData = Array.isArray(weeklyData) ? weeklyData : [];

    // ── Process Data ──
    const { chartLabels, revenueValues, expenseValues, profitValues, chartDates } = useMemo(() => {
        if (!safeWeeklyData.length) {
            return { chartLabels: [], revenueValues: [], expenseValues: [], profitValues: [], chartDates: [] };
        }
        return {
            chartLabels: safeWeeklyData.map((d) =>
                d.day ? new Date(d.day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' }) : ''
            ),
            revenueValues: safeWeeklyData.map((d) => d.revenue || 0),
            expenseValues: safeWeeklyData.map((d) => d.expenses || 0),
            profitValues: safeWeeklyData.map((d) => d.profit || 0),
            chartDates: safeWeeklyData.map((d) =>
                d.day ? new Date(d.day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
            ),
        };
    }, [safeWeeklyData]);

    const hasValidData = revenueValues.some((v) => v > 0) || expenseValues.some((v) => v > 0);

    // ── Empty State ──
    if (!safeWeeklyData.length || !hasValidData) {
        return (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                        <BarChart3 className="w-4 h-4 text-white/20" />
                    </div>
                    <p className="text-[11px] text-white/40 mb-0.5">No data available</p>
                    <p className="text-[10px] text-white/20">Activity will appear here</p>
                </div>
            </div>
        );
    }

    // ── Calculations ──
    const totalRevenue = revenueValues.reduce((a, b) => a + b, 0);
    const totalExpenses = expenseValues.reduce((a, b) => a + b, 0);
    const totalProfit = profitValues.reduce((a, b) => a + b, 0);
    const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
    const isProfit = totalProfit >= 0;

    const lastIdx = revenueValues.length - 1;
    const prevIdx = revenueValues.length - 2;
    const todayRevenue = revenueValues[lastIdx] || 0;
    const yesterdayRevenue = revenueValues[prevIdx] || 0;

    let revenueGrowth = null;
    if (yesterdayRevenue > 0) {
        revenueGrowth = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    } else if (todayRevenue > 0) {
        revenueGrowth = 100;
    }

    // ── Display Values ──
    const getDisplayValue = () => {
        const source =
            activeMetric === 'revenue' ? revenueValues
            : activeMetric === 'expenses' ? expenseValues
            : profitValues;
        return activeIndex !== null ? source[activeIndex] : (
            activeMetric === 'revenue' ? totalRevenue
            : activeMetric === 'expenses' ? totalExpenses
            : totalProfit
        );
    };

    const displayValue = getDisplayValue();
    const displayLabel = activeIndex !== null
        ? chartDates[activeIndex]
        : 'This week';

    // ── Chart Config ──
    // Monochrome line colors — white shades only
    const LINE_STYLES = {
        revenue:  { border: 'rgba(255,255,255,0.7)',  fill: 'rgba(255,255,255,0.06)', fillEnd: 'rgba(255,255,255,0)' },
        expenses: { border: 'rgba(255,255,255,0.35)', fill: 'rgba(255,255,255,0.03)', fillEnd: 'rgba(255,255,255,0)' },
        profit:   { border: 'rgba(255,255,255,0.15)', fill: 'rgba(255,255,255,0.02)', fillEnd: 'rgba(255,255,255,0)' },
    };

    const makeDataset = (key, label, values, dashed = false) => ({
        label,
        data: values,
        borderColor: LINE_STYLES[key].border,
        backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 180);
            g.addColorStop(0, LINE_STYLES[key].fill);
            g.addColorStop(1, LINE_STYLES[key].fillEnd);
            return g;
        },
        fill: activeMetric === key,
        tension: 0.4,
        borderWidth: activeMetric === key ? 2 : 1,
        borderDash: dashed ? [4, 4] : [],
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#000000',
        pointHoverBorderColor: LINE_STYLES[key].border,
        pointHoverBorderWidth: 2,
    });

    const chartData = {
        labels: chartLabels,
        datasets: [
            makeDataset('revenue', 'Revenue', revenueValues),
            makeDataset('expenses', 'Expenses', expenseValues),
            makeDataset('profit', 'Profit', profitValues, true),
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { intersect: false, mode: 'index' },
        animation: { duration: 600, easing: 'easeInOutQuart' },
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: '#000000',
                titleColor: 'rgba(255,255,255,0.4)',
                bodyColor: '#ffffff',
                titleFont: { size: 10, weight: '500' },
                bodyFont: { size: 11, weight: '500' },
                padding: { x: 10, y: 8 },
                cornerRadius: 8,
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                displayColors: true,
                boxWidth: 6,
                boxHeight: 6,
                boxPadding: 4,
                callbacks: {
                    title: (items) => chartDates[items[0]?.dataIndex] || '',
                    label: (ctx) => ` ${ctx.dataset.label}: ₹${(ctx.parsed.y || 0).toLocaleString('en-IN')}`,
                },
            },
        },
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: { color: 'rgba(255,255,255,0.2)', font: { size: 10, weight: '500' }, padding: 8, maxRotation: 0 },
            },
            y: { display: false, beginAtZero: true },
        },
        onHover: (_, elements) => setActiveIndex(elements.length > 0 ? elements[0].index : null),
    };

    const showGrowth = revenueGrowth !== null && !isNaN(revenueGrowth);
    const isUp = revenueGrowth >= 0;

    // ── Render ──
    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                    Weekly Overview
                </p>

                {/* Metric Toggle */}
                <div className="flex items-center gap-px bg-white/[0.04] rounded-lg p-0.5">
                    {['revenue', 'expenses', 'profit'].map((key) => (
                        <button
                            key={key}
                            onClick={() => setActiveMetric(key)}
                            className={`px-2 py-1 text-[9px] font-medium rounded-md transition-all capitalize ${
                                activeMetric === key
                                    ? 'bg-white/[0.10] text-white'
                                    : 'text-white/30 hover:text-white/50'
                            }`}
                        >
                            {key}
                        </button>
                    ))}
                </div>
            </div>

            {/* ── Value Display ── */}
            <div className="px-3 pt-3 pb-1">
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] text-white/30 font-medium">{displayLabel}</p>
                    {activeIndex === null && activeMetric === 'revenue' && showGrowth && (
                        <TrendBadge value={revenueGrowth} />
                    )}
                    {activeIndex === null && activeMetric === 'profit' && (
                        <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${
                            isProfit
                                ? 'bg-emerald-500/15 text-emerald-400'
                                : 'bg-red-500/15 text-red-400'
                        }`}>
                            {profitMargin}% margin
                        </span>
                    )}
                </div>
                <p className={`text-2xl sm:text-3xl font-bold tabular-nums tracking-tight ${
                    activeMetric === 'profit' && displayValue < 0 ? 'text-red-400' : 'text-white'
                }`}>
                    {activeMetric === 'profit' && displayValue < 0 ? '-' : ''}
                    {formatValue(Math.abs(displayValue))}
                </p>
            </div>

            {/* ── Summary Strip ── */}
            <div className="px-3 py-2">
                <div className="flex gap-1.5">
                    <SummaryChip label="Revenue" value={formatValue(totalRevenue)} active={activeMetric === 'revenue'} onClick={() => setActiveMetric('revenue')} />
                    <SummaryChip label="Expenses" value={formatValue(totalExpenses)} active={activeMetric === 'expenses'} onClick={() => setActiveMetric('expenses')} />
                    <SummaryChip label="Profit" value={formatValue(totalProfit)} active={activeMetric === 'profit'} onClick={() => setActiveMetric('profit')} negative={totalProfit < 0} />
                    <SummaryChip label="Margin" value={`${profitMargin}%`} />
                </div>
            </div>

            {/* ── Chart ── */}
            <div className="px-2 pb-2">
                <div className="h-36 sm:h-44">
                    <Line ref={chartRef} data={chartData} options={options} />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-2 pb-1">
                    {[
                        { label: 'Revenue', opacity: 0.7 },
                        { label: 'Expenses', opacity: 0.35 },
                        { label: 'Profit', opacity: 0.15, dashed: true },
                    ].map(({ label, opacity, dashed }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div
                                className="w-4 h-[2px] rounded-full"
                                style={{
                                    backgroundColor: dashed ? 'transparent' : `rgba(255,255,255,${opacity})`,
                                    borderTop: dashed ? `1.5px dashed rgba(255,255,255,${opacity})` : 'none',
                                }}
                            />
                            <span className="text-[9px] text-white/25">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Daily Breakdown ── */}
            <div className="border-t border-white/[0.06]">
                <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/[0.02] transition-colors"
                >
                    <span className="text-[9px] text-white/30 font-medium uppercase tracking-wide">
                        Daily Breakdown
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/20 transition-transform duration-200 ${
                        showBreakdown ? 'rotate-180' : ''
                    }`} />
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${
                    showBreakdown ? 'max-h-[500px]' : 'max-h-0'
                }`}>
                    <div className="px-2.5 pb-2.5 space-y-0.5 overflow-y-auto max-h-72">
                        {safeWeeklyData.map((item, i) => {
                            const rev = revenueValues[i];
                            const exp = expenseValues[i];
                            const pft = profitValues[i];
                            const isLast = i === lastIdx;
                            const isProfitable = pft >= 0;

                            return (
                                <div
                                    key={item.day || i}
                                    className={`px-2.5 py-2 rounded-lg transition-colors ${
                                        isLast ? 'bg-white/[0.04]' : activeIndex === i ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                                    }`}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {/* Date */}
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                                isLast ? 'bg-white' : 'bg-white/15'
                                            }`} />
                                            <span className={`text-[10px] font-medium ${
                                                isLast ? 'text-white' : 'text-white/40'
                                            }`}>
                                                {isLast ? 'Today' : chartLabels[i]}
                                                <span className="text-white/15 ml-1">{chartDates[i]}</span>
                                            </span>
                                        </div>
                                        <span className={`text-[9px] font-semibold tabular-nums ${
                                            isProfitable ? 'text-emerald-400' : 'text-red-400'
                                        }`}>
                                            {isProfitable ? '+' : ''}₹{formatCompact(pft)}
                                        </span>
                                    </div>

                                    {/* Values */}
                                    <div className="flex gap-1">
                                        <BreakdownChip label="Rev" value={`₹${formatCompact(rev)}`} />
                                        <BreakdownChip label="Exp" value={`₹${formatCompact(exp)}`} />
                                        <BreakdownChip label="Profit" value={`₹${formatCompact(Math.abs(pft))}`} highlight={isProfitable} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Footer ── */}
            <div className="px-3 py-2 bg-white/[0.01] border-t border-white/[0.04]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[10px] text-white/25">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="truncate tabular-nums">
                            Net {isProfit ? 'profit' : 'loss'}: ₹{formatCompact(Math.abs(totalProfit))}
                            {isProfit && ` · ${profitMargin}% margin`}
                        </span>
                    </div>
                    <span className={`text-[9px] font-medium ${
                        isProfit ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                        {isProfit ? '↑ Profit' : '↓ Loss'}
                    </span>
                </div>
            </div>
        </div>
    );
}

// ============================================
// TREND BADGE
// ============================================

function TrendBadge({ value }) {
    if (value === undefined || value === null) return null;
    const isPos = value >= 0;

    return (
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[9px] font-semibold tabular-nums ${
            isPos ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'
        }`}>
            {isPos ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
            {Math.abs(value).toFixed(1)}%
        </span>
    );
}

// ============================================
// SUMMARY CHIP — metric switcher
// ============================================

function SummaryChip({ label, value, active, onClick, negative }) {
    return (
        <button
            onClick={onClick}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                active
                    ? 'bg-white/[0.08] ring-1 ring-white/[0.12]'
                    : 'bg-white/[0.02] hover:bg-white/[0.04]'
            } ${onClick ? 'cursor-pointer' : 'cursor-default'}`}
        >
            <p className="text-[8px] text-white/25 font-medium uppercase tracking-wide mb-0.5">{label}</p>
            <p className={`text-[10px] font-bold tabular-nums truncate px-1 ${
                negative ? 'text-red-400' : active ? 'text-white' : 'text-white/50'
            }`}>
                {value}
            </p>
        </button>
    );
}

// ============================================
// BREAKDOWN CHIP — daily values
// ============================================

function BreakdownChip({ label, value, highlight }) {
    return (
        <div className={`flex-1 text-center py-1 rounded-md ${
            highlight ? 'bg-white/[0.04]' : 'bg-white/[0.02]'
        }`}>
            <p className="text-[8px] text-white/20 mb-0.5">{label}</p>
            <p className={`text-[10px] font-semibold tabular-nums ${
                highlight ? 'text-white/70' : 'text-white/40'
            }`}>
                {value}
            </p>
        </div>
    );
}