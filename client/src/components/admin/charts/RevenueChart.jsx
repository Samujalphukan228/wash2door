'use client';

import { useState, useMemo, useRef } from 'react';
import { 
    BarChart3, 
    ChevronDown, 
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Calendar,
    TrendingUp,
    Wallet,
    IndianRupee
} from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler,
    Legend
);

ChartJS.defaults.elements.line.tension = 0.4;

export default function RevenueChart({ weeklyData = [], totals = {} }) {
    const chartRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [activeMetric, setActiveMetric] = useState('revenue'); // 'revenue', 'expenses', 'profit'

    // ═══════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════
    
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

    // ═══════════════════════════════════════════════════════════
    // DATA PROCESSING
    // ═══════════════════════════════════════════════════════════
    
    const safeWeeklyData = Array.isArray(weeklyData) ? weeklyData : [];

    const { chartLabels, revenueValues, expenseValues, profitValues, chartDates } = useMemo(() => {
        if (!safeWeeklyData || safeWeeklyData.length === 0) {
            return { 
                chartLabels: [], 
                revenueValues: [], 
                expenseValues: [], 
                profitValues: [],
                chartDates: [] 
            };
        }

        const labels = safeWeeklyData.map((d) => {
            if (d.day) {
                return new Date(d.day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            }
            return '';
        });

        const revenues = safeWeeklyData.map(d => d.revenue || 0);
        const expenses = safeWeeklyData.map(d => d.expenses || 0);
        const profits = safeWeeklyData.map(d => d.profit || 0);

        const dates = safeWeeklyData.map(d => {
            if (d.day) {
                return new Date(d.day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return '';
        });

        return { 
            chartLabels: labels, 
            revenueValues: revenues, 
            expenseValues: expenses,
            profitValues: profits,
            chartDates: dates 
        };
    }, [safeWeeklyData]);

    // Get active values based on selected metric
    const chartValues = activeMetric === 'revenue' 
        ? revenueValues 
        : activeMetric === 'expenses' 
            ? expenseValues 
            : profitValues;

    // Empty State
    if (!safeWeeklyData || safeWeeklyData.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-400 mb-1">No data available</p>
                        <p className="text-xs text-gray-600">Start receiving orders to see analytics</p>
                    </div>
                </div>
            </div>
        );
    }

    const hasValidData = revenueValues.some(v => v > 0) || expenseValues.some(v => v > 0);
    
    if (!hasValidData) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/[0.08] border border-yellow-500/[0.15] flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-400 mb-1">No activity yet</p>
                        <p className="text-xs text-gray-600">Data will appear here once there's activity</p>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    // CALCULATIONS
    // ═══════════════════════════════════════════════════════════
    
    const totalRevenue = revenueValues.reduce((a, b) => a + b, 0);
    const totalExpenses = expenseValues.reduce((a, b) => a + b, 0);
    const totalProfit = profitValues.reduce((a, b) => a + b, 0);
    
    const avgRevenue = revenueValues.length > 0 ? totalRevenue / revenueValues.length : 0;
    const avgExpenses = expenseValues.length > 0 ? totalExpenses / expenseValues.length : 0;
    const avgProfit = profitValues.length > 0 ? totalProfit / profitValues.length : 0;

    const maxRevenue = Math.max(...revenueValues, 1);
    const maxExpense = Math.max(...expenseValues, 1);
    const maxProfit = Math.max(...profitValues);
    const minProfit = Math.min(...profitValues);

    const lastIdx = revenueValues.length - 1;
    const prevIdx = revenueValues.length - 2;
    
    const todayRevenue = revenueValues[lastIdx] || 0;
    const yesterdayRevenue = revenueValues[prevIdx] || 0;
    const todayExpense = expenseValues[lastIdx] || 0;
    const todayProfit = profitValues[lastIdx] || 0;
    
    let revenueGrowth = null;
    if (yesterdayRevenue > 0) {
        revenueGrowth = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
    } else if (todayRevenue > 0) {
        revenueGrowth = 100;
    }

    const profitMargin = totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;
    const isProfit = totalProfit >= 0;

    // Display values based on active metric
    const getDisplayValue = () => {
        if (activeIndex !== null) {
            return activeMetric === 'revenue' 
                ? revenueValues[activeIndex]
                : activeMetric === 'expenses'
                    ? expenseValues[activeIndex]
                    : profitValues[activeIndex];
        }
        return activeMetric === 'revenue' 
            ? totalRevenue
            : activeMetric === 'expenses'
                ? totalExpenses
                : totalProfit;
    };

    const displayValue = getDisplayValue();
    const displayLabel = activeIndex !== null 
        ? chartDates[activeIndex] 
        : `Total ${activeMetric.charAt(0).toUpperCase() + activeMetric.slice(1)}`;

    // ═══════════════════════════════════════════════════════════
    // CHART CONFIG - MULTI LINE
    // ═══════════════════════════════════════════════════════════
    
    const chartData = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Revenue',
                data: revenueValues,
                borderColor: '#22C55E',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
                    gradient.addColorStop(0, 'rgba(34, 197, 94, 0.15)');
                    gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
                    return gradient;
                },
                fill: activeMetric === 'revenue',
                tension: 0.4,
                borderWidth: activeMetric === 'revenue' ? 2.5 : 1.5,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#000000',
                pointHoverBorderColor: '#22C55E',
                pointHoverBorderWidth: 2,
                hidden: false,
            },
            {
                label: 'Expenses',
                data: expenseValues,
                borderColor: '#EF4444',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
                    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.15)');
                    gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
                    return gradient;
                },
                fill: activeMetric === 'expenses',
                tension: 0.4,
                borderWidth: activeMetric === 'expenses' ? 2.5 : 1.5,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#000000',
                pointHoverBorderColor: '#EF4444',
                pointHoverBorderWidth: 2,
                hidden: false,
            },
            {
                label: 'Profit',
                data: profitValues,
                borderColor: '#3B82F6',
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 180);
                    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.15)');
                    gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
                    return gradient;
                },
                fill: activeMetric === 'profit',
                tension: 0.4,
                borderWidth: activeMetric === 'profit' ? 2.5 : 1.5,
                borderDash: [5, 5],
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#000000',
                pointHoverBorderColor: '#3B82F6',
                pointHoverBorderWidth: 2,
                hidden: false,
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        
        interaction: {
            intersect: false,
            mode: 'index',
        },
        
        animation: {
            duration: 750,
            easing: 'easeInOutQuart',
        },
        
        plugins: {
            legend: { display: false },
            tooltip: {
                enabled: true,
                backgroundColor: '#111111',
                titleColor: '#888888',
                bodyColor: '#ffffff',
                titleFont: { size: 10, weight: '500' },
                bodyFont: { size: 12, weight: '500' },
                padding: { x: 12, y: 10 },
                cornerRadius: 8,
                borderColor: 'rgba(255,255,255,0.1)',
                borderWidth: 1,
                displayColors: true,
                boxWidth: 8,
                boxHeight: 8,
                boxPadding: 4,
                callbacks: {
                    title: (items) => chartDates[items[0]?.dataIndex] || '',
                    label: (ctx) => {
                        const label = ctx.dataset.label || '';
                        const value = ctx.parsed.y || 0;
                        return `${label}: ₹${value.toLocaleString('en-IN')}`;
                    }
                }
            }
        },
        
        scales: {
            x: {
                grid: { display: false },
                border: { display: false },
                ticks: {
                    color: '#444444',
                    font: { size: 10, weight: '500' },
                    padding: 8,
                    maxRotation: 0,
                }
            },
            y: {
                display: false,
                beginAtZero: true,
            }
        },
        
        onHover: (event, elements) => {
            setActiveIndex(elements.length > 0 ? elements[0].index : null);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
    
    const showGrowth = revenueGrowth !== null && !isNaN(revenueGrowth);
    const isUp = revenueGrowth >= 0;

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">Weekly Overview</p>
                        <p className="text-[10px] text-gray-600 hidden sm:block">
                            Last {safeWeeklyData.length} days performance
                        </p>
                    </div>
                </div>

                {/* Metric Toggle */}
                <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
                    {[
                        { key: 'revenue', label: 'Revenue', color: 'emerald' },
                        { key: 'expenses', label: 'Expenses', color: 'red' },
                        { key: 'profit', label: 'Profit', color: 'blue' }
                    ].map(({ key, label, color }) => (
                        <button
                            key={key}
                            onClick={() => setActiveMetric(key)}
                            className={`
                                flex items-center gap-1 px-2 sm:px-2.5 py-1.5 
                                text-[9px] sm:text-[10px] font-medium rounded-md 
                                transition-all duration-200 active:scale-95
                                ${activeMetric === key
                                    ? `bg-${color}-500/20 text-${color}-400 border border-${color}-500/30`
                                    : 'text-gray-500 hover:text-gray-300'
                                }
                            `}
                            style={{
                                backgroundColor: activeMetric === key 
                                    ? color === 'emerald' ? 'rgba(34, 197, 94, 0.15)'
                                    : color === 'red' ? 'rgba(239, 68, 68, 0.15)'
                                    : 'rgba(59, 130, 246, 0.15)'
                                    : undefined,
                                color: activeMetric === key
                                    ? color === 'emerald' ? '#22C55E'
                                    : color === 'red' ? '#EF4444'
                                    : '#3B82F6'
                                    : undefined
                            }}
                        >
                            <div 
                                className="w-1.5 h-1.5 rounded-full"
                                style={{
                                    backgroundColor: color === 'emerald' ? '#22C55E'
                                        : color === 'red' ? '#EF4444'
                                        : '#3B82F6'
                                }}
                            />
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="p-4 sm:p-5">
                
                {/* Value Display */}
                <div className="mb-4 sm:mb-5">
                    <div className="flex items-center gap-2 mb-1">
                        <p className="text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">
                            {displayLabel}
                        </p>
                        {activeIndex === null && activeMetric === 'revenue' && showGrowth && (
                            <div className={`
                                flex items-center gap-0.5 
                                px-1.5 py-0.5 rounded-full 
                                text-[9px] sm:text-[10px] font-medium
                                ${isUp 
                                    ? 'bg-emerald-500/15 text-emerald-400' 
                                    : 'bg-red-500/15 text-red-400'
                                }
                            `}>
                                {isUp 
                                    ? <ArrowUpRight className="w-2.5 h-2.5" /> 
                                    : <ArrowDownRight className="w-2.5 h-2.5" />
                                }
                                <span>{Math.abs(revenueGrowth).toFixed(1)}%</span>
                            </div>
                        )}
                        {activeIndex === null && activeMetric === 'profit' && (
                            <div className={`
                                flex items-center gap-0.5 
                                px-1.5 py-0.5 rounded-full 
                                text-[9px] sm:text-[10px] font-medium
                                ${isProfit 
                                    ? 'bg-emerald-500/15 text-emerald-400' 
                                    : 'bg-red-500/15 text-red-400'
                                }
                            `}>
                                <span>{profitMargin}% margin</span>
                            </div>
                        )}
                    </div>
                    <p className={`
                        text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight tabular-nums
                        ${activeMetric === 'profit' && displayValue < 0 ? 'text-red-400' : 'text-white'}
                    `}>
                        {activeMetric === 'profit' && displayValue < 0 ? '-' : ''}
                        {formatValue(Math.abs(displayValue))}
                    </p>
                </div>

                {/* Mini Stats Grid */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                    <MiniStat 
                        label="Revenue" 
                        value={formatValue(totalRevenue)}
                        color="emerald"
                        active={activeMetric === 'revenue'}
                        onClick={() => setActiveMetric('revenue')}
                    />
                    <MiniStat 
                        label="Expenses" 
                        value={formatValue(totalExpenses)}
                        color="red"
                        active={activeMetric === 'expenses'}
                        onClick={() => setActiveMetric('expenses')}
                    />
                    <MiniStat 
                        label="Profit" 
                        value={formatValue(totalProfit)}
                        color={totalProfit >= 0 ? 'blue' : 'orange'}
                        active={activeMetric === 'profit'}
                        onClick={() => setActiveMetric('profit')}
                    />
                    <MiniStat 
                        label="Margin" 
                        value={`${profitMargin}%`}
                        color={profitMargin >= 20 ? 'emerald' : profitMargin >= 0 ? 'yellow' : 'red'}
                    />
                </div>

                {/* CHART */}
                <div className="h-36 sm:h-44 lg:h-52 -mx-1 sm:-mx-2">
                    <Line 
                        ref={chartRef}
                        data={chartData} 
                        options={options} 
                    />
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-3 sm:mt-4">
                    {[
                        { label: 'Revenue', color: '#22C55E' },
                        { label: 'Expenses', color: '#EF4444' },
                        { label: 'Profit', color: '#3B82F6', dashed: true }
                    ].map(({ label, color, dashed }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div 
                                className={`w-4 h-0.5 rounded-full ${dashed ? 'border-t border-dashed' : ''}`}
                                style={{ 
                                    backgroundColor: dashed ? 'transparent' : color,
                                    borderColor: dashed ? color : undefined
                                }}
                            />
                            <span className="text-[9px] sm:text-[10px] text-gray-500">{label}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* BREAKDOWN SECTION */}
            <div className="border-t border-white/[0.06]">
                <button
                    onClick={() => setShowBreakdown(!showBreakdown)}
                    className="w-full flex items-center justify-between px-4 sm:px-5 py-3 
                               hover:bg-white/[0.02] active:bg-white/[0.03] transition-colors"
                >
                    <span className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider font-medium">
                        Daily Breakdown
                    </span>
                    <ChevronDown className={`
                        w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600 
                        transition-transform duration-200
                        ${showBreakdown ? 'rotate-180' : ''}
                    `} />
                </button>

                {/* Collapsible Content */}
                <div className={`
                    overflow-hidden transition-all duration-300
                    ${showBreakdown ? 'max-h-[500px]' : 'max-h-0'}
                `}>
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-0.5 sm:space-y-1 overflow-y-auto max-h-80">
                        {safeWeeklyData.map((item, i) => {
                            const revenue = revenueValues[i];
                            const expense = expenseValues[i];
                            const profit = profitValues[i];
                            const isLast = i === lastIdx;
                            const isProfitable = profit >= 0;

                            return (
                                <div
                                    key={item.day || i}
                                    className={`
                                        p-2.5 sm:p-3 rounded-lg sm:rounded-xl 
                                        transition-all cursor-default
                                        ${isLast ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
                                        ${activeIndex === i ? 'bg-white/[0.08]' : ''}
                                    `}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {/* Date Row */}
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className={`
                                                w-2 h-2 rounded-full
                                                ${isLast ? 'bg-white' : 'bg-white/20'}
                                            `} />
                                            <span className={`
                                                text-[10px] sm:text-xs font-medium
                                                ${isLast ? 'text-white' : 'text-gray-400'}
                                            `}>
                                                {isLast ? 'Today' : chartLabels[i]} • {chartDates[i]}
                                            </span>
                                        </div>
                                        <div className={`
                                            text-[9px] sm:text-[10px] font-medium px-1.5 py-0.5 rounded-full
                                            ${isProfitable 
                                                ? 'bg-emerald-500/15 text-emerald-400' 
                                                : 'bg-red-500/15 text-red-400'
                                            }
                                        `}>
                                            {isProfitable ? '+' : ''}₹{formatCompact(profit)}
                                        </div>
                                    </div>

                                    {/* Stats Row */}
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="text-center p-1.5 rounded-lg bg-emerald-500/[0.08]">
                                            <p className="text-[8px] text-emerald-500 mb-0.5">Revenue</p>
                                            <p className="text-[10px] sm:text-xs font-semibold text-emerald-400 tabular-nums">
                                                ₹{formatCompact(revenue)}
                                            </p>
                                        </div>
                                        <div className="text-center p-1.5 rounded-lg bg-red-500/[0.08]">
                                            <p className="text-[8px] text-red-500 mb-0.5">Expenses</p>
                                            <p className="text-[10px] sm:text-xs font-semibold text-red-400 tabular-nums">
                                                ₹{formatCompact(expense)}
                                            </p>
                                        </div>
                                        <div className={`text-center p-1.5 rounded-lg ${isProfitable ? 'bg-blue-500/[0.08]' : 'bg-orange-500/[0.08]'}`}>
                                            <p className={`text-[8px] ${isProfitable ? 'text-blue-500' : 'text-orange-500'} mb-0.5`}>Profit</p>
                                            <p className={`text-[10px] sm:text-xs font-semibold tabular-nums ${isProfitable ? 'text-blue-400' : 'text-orange-400'}`}>
                                                {isProfitable ? '+' : ''}₹{formatCompact(profit)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white/[0.02] border-t border-white/[0.05]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                        <Clock className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                            {isProfit 
                                ? `Net profit: ₹${formatCompact(totalProfit)} (${profitMargin}% margin)`
                                : `Net loss: ₹${formatCompact(Math.abs(totalProfit))}`
                            }
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Sparkles className={`w-3 h-3 ${isProfit ? 'text-emerald-500' : 'text-red-500'}`} />
                        <span className={`text-[10px] font-medium ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
                            {isProfit ? 'Profitable' : 'Loss'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// MINI STAT COMPONENT
// ═══════════════════════════════════════════════════════════════════

function MiniStat({ label, value, color = 'gray', active, onClick }) {
    const colorMap = {
        emerald: { bg: 'bg-emerald-500/[0.08]', text: 'text-emerald-500', value: 'text-emerald-400' },
        red: { bg: 'bg-red-500/[0.08]', text: 'text-red-500', value: 'text-red-400' },
        blue: { bg: 'bg-blue-500/[0.08]', text: 'text-blue-500', value: 'text-blue-400' },
        yellow: { bg: 'bg-yellow-500/[0.08]', text: 'text-yellow-500', value: 'text-yellow-400' },
        orange: { bg: 'bg-orange-500/[0.08]', text: 'text-orange-500', value: 'text-orange-400' },
        gray: { bg: 'bg-white/[0.03]', text: 'text-gray-600', value: 'text-gray-400' }
    };

    const colors = colorMap[color] || colorMap.gray;

    return (
        <button
            onClick={onClick}
            className={`
                p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-center transition-all
                ${colors.bg}
                ${active ? 'ring-1 ring-white/20 scale-105' : 'hover:scale-102'}
                ${onClick ? 'cursor-pointer' : 'cursor-default'}
            `}
        >
            <p className={`
                text-[8px] sm:text-[9px] font-medium uppercase tracking-wider mb-0.5 sm:mb-1
                ${colors.text}
            `}>
                {label}
            </p>
            <p className={`
                text-[10px] sm:text-xs font-bold truncate tabular-nums
                ${active ? 'text-white' : colors.value}
            `}>
                {value}
            </p>
        </button>
    );
}