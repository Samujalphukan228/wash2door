'use client';

import { useState, useMemo, useRef } from 'react';
import { 
    BarChart3, 
    ChevronDown, 
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    Sparkles,
    Calendar
} from 'lucide-react';
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

// ⚠️ Register BEFORE component
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Filler
);

// 🔥 Set default tension globally for smooth curves
ChartJS.defaults.elements.line.tension = 0.4;

export default function RevenueChart({ categoryData = [], weeklyData = [], totals = {} }) {
    const chartRef = useRef(null);
    const [activeIndex, setActiveIndex] = useState(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [viewMode, setViewMode] = useState('days');

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
    const safeCategoryData = Array.isArray(categoryData) ? categoryData : [];
    const data = viewMode === 'days' ? safeWeeklyData : safeCategoryData;

    // Process chart data
    const { chartLabels, chartValues, chartDates } = useMemo(() => {
        if (!data || data.length === 0) {
            return { chartLabels: [], chartValues: [], chartDates: [] };
        }

        const labels = data.map((d, idx) => {
            if (viewMode === 'days' && d.day) {
                return new Date(d.day + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
            }
            return d.name?.substring(0, 8) || `#${idx + 1}`;
        });

        const values = data.map(d => {
            const val = d.revenue;
            return typeof val === 'number' && val >= 0 ? val : 0;
        });

        const dates = data.map(d => {
            if (viewMode === 'days' && d.day) {
                return new Date(d.day + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            }
            return d.name || 'Unknown';
        });

        return { chartLabels: labels, chartValues: values, chartDates: dates };
    }, [data, viewMode]);

    // Empty State
    if (!data || data.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-gray-600" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-400 mb-1">No {viewMode} data</p>
                        <p className="text-xs text-gray-600">Start receiving orders to see analytics</p>
                    </div>
                </div>
            </div>
        );
    }

    const hasValidData = chartValues.some(v => v > 0);
    
    if (!hasValidData) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-yellow-500/[0.08] border border-yellow-500/[0.15] flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-gray-400 mb-1">No revenue yet</p>
                        <p className="text-xs text-gray-600">Revenue will appear here once orders come in</p>
                    </div>
                </div>
            </div>
        );
    }

    // ═══════════════════════════════════════════════════════════
    // CALCULATIONS
    // ═══════════════════════════════════════════════════════════
    
    const maxValue = Math.max(...chartValues, 1);
    const minValue = Math.min(...chartValues);
    const totalValue = chartValues.reduce((a, b) => a + b, 0);
    const avgValue = chartValues.length > 0 ? totalValue / chartValues.length : 0;
    
    const bestDayIndex = chartValues.indexOf(maxValue);
    const worstDayIndex = chartValues.indexOf(minValue);

    const lastIdx = chartValues.length - 1;
    const prevIdx = chartValues.length - 2;
    const todayVal = chartValues[lastIdx] || 0;
    const yesterdayVal = chartValues[prevIdx] || 0;
    
    let growthPercent = null;
    if (yesterdayVal > 0) {
        growthPercent = ((todayVal - yesterdayVal) / yesterdayVal) * 100;
    } else if (todayVal > 0) {
        growthPercent = 100;
    }

    const displayValue = activeIndex !== null 
        ? chartValues[activeIndex] 
        : (totals?.totalRevenue || totalValue);
    const displayLabel = activeIndex !== null 
        ? chartDates[activeIndex] 
        : 'Total Revenue';

    // ═══════════════════════════════════════════════════════════
    // 🔥 CHART CONFIG - SMOOTH CURVES
    // ═══════════════════════════════════════════════════════════
    
    const chartData = {
        labels: chartLabels,
        datasets: [{
            data: chartValues,
            borderColor: '#ffffff',
            backgroundColor: (context) => {
                const ctx = context.chart.ctx;
                const gradient = ctx.createLinearGradient(0, 0, 0, 180);
                gradient.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
                gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
                gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                return gradient;
            },
            fill: true,
            // 🔥 KEY: This makes the line smooth!
            tension: 0.4,
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 6,
            pointHoverBackgroundColor: '#000000',
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 2,
            borderCapStyle: 'round',
            borderJoinStyle: 'round',
        }]
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
                backgroundColor: '#ffffff',
                titleColor: '#888888',
                bodyColor: '#000000',
                titleFont: { size: 10, weight: '500' },
                bodyFont: { size: 13, weight: '600' },
                padding: { x: 12, y: 8 },
                cornerRadius: 8,
                displayColors: false,
                callbacks: {
                    title: (items) => chartDates[items[0]?.dataIndex] || '',
                    label: (ctx) => `₹${(ctx.parsed.y || 0).toLocaleString('en-IN')}`
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
                beginAtZero: false,
            }
        },
        
        onHover: (event, elements) => {
            setActiveIndex(elements.length > 0 ? elements[0].index : null);
        }
    };

    // ═══════════════════════════════════════════════════════════
    // RENDER
    // ═══════════════════════════════════════════════════════════
    
    const showGrowth = growthPercent !== null && !isNaN(growthPercent);
    const isUp = growthPercent >= 0;

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">

            {/* HEADER */}
            <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">Revenue</p>
                        <p className="text-[10px] text-gray-600 hidden sm:block">
                            {data.length} {viewMode === 'days' ? 'days' : 'categories'}
                        </p>
                    </div>
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-white/[0.04] rounded-lg p-0.5 border border-white/[0.06]">
                    {[
                        { key: 'days', label: 'Daily', icon: Calendar },
                        { key: 'categories', label: 'Category', icon: BarChart3 }
                    ].map(({ key, label, icon: Icon }) => (
                        <button
                            key={key}
                            onClick={() => setViewMode(key)}
                            className={`
                                flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 
                                text-[10px] sm:text-xs font-medium rounded-md 
                                transition-all duration-200 active:scale-95
                                ${viewMode === key
                                    ? 'bg-white text-black shadow-sm'
                                    : 'text-gray-500 hover:text-gray-300'
                                }
                            `}
                        >
                            <Icon className="w-3 h-3 hidden sm:block" />
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
                        {activeIndex === null && showGrowth && (
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
                                <span>{Math.abs(growthPercent).toFixed(1)}%</span>
                            </div>
                        )}
                    </div>
                    <p className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight tabular-nums">
                        {formatValue(displayValue)}
                    </p>
                </div>

                {/* Mini Stats Grid */}
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-4 sm:mb-5">
                    <MiniStat 
                        label={viewMode === 'days' ? 'Week' : 'Total'} 
                        value={formatValue(totalValue)} 
                    />
                    <MiniStat 
                        label="Avg" 
                        value={formatValue(avgValue)} 
                        dim 
                    />
                    <MiniStat 
                        label="Peak" 
                        value={formatValue(maxValue)} 
                        highlight="up" 
                    />
                    <MiniStat 
                        label="Low" 
                        value={formatValue(minValue)} 
                        highlight="down" 
                    />
                </div>

                {/* 🔥 CHART */}
                <div className="h-36 sm:h-44 lg:h-52 -mx-1 sm:-mx-2">
                    <Line 
                        ref={chartRef}
                        data={chartData} 
                        options={options} 
                    />
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
                        {viewMode === 'days' ? 'Daily' : 'Category'} Breakdown
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
                    ${showBreakdown ? 'max-h-[400px]' : 'max-h-0'}
                `}>
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-0.5 sm:space-y-1 overflow-y-auto max-h-72">
                        {data.map((item, i) => {
                            const val = chartValues[i];
                            const isLast = viewMode === 'days' && i === lastIdx;
                            const isBest = i === bestDayIndex && val > 0;
                            const isWorst = i === worstDayIndex && val > 0 && bestDayIndex !== worstDayIndex;
                            const percentage = maxValue > 0 ? (val / maxValue) * 100 : 0;
                            const share = totalValue > 0 ? Math.round((val / totalValue) * 100) : 0;
                            
                            const prevVal = i > 0 ? chartValues[i - 1] : val;
                            const change = prevVal > 0 ? ((val - prevVal) / prevVal) * 100 : 0;

                            return (
                                <div
                                    key={item.day || item.name || i}
                                    className={`
                                        flex items-center gap-2 sm:gap-3 
                                        p-2 sm:p-2.5 rounded-lg sm:rounded-xl 
                                        transition-all cursor-default
                                        ${isLast ? 'bg-white/[0.06]' : 'hover:bg-white/[0.03]'}
                                        ${activeIndex === i ? 'bg-white/[0.08]' : ''}
                                    `}
                                    onMouseEnter={() => setActiveIndex(i)}
                                    onMouseLeave={() => setActiveIndex(null)}
                                >
                                    {/* Indicator + Label */}
                                    <div className="flex items-center gap-1.5 w-14 sm:w-20 shrink-0">
                                        <div className={`
                                            w-1.5 h-1.5 rounded-full shrink-0
                                            ${isLast ? 'bg-white' :
                                                isBest ? 'bg-emerald-500' :
                                                isWorst ? 'bg-red-500' : 'bg-white/20'}
                                        `} />
                                        <span className={`
                                            text-[10px] sm:text-xs font-medium truncate
                                            ${isLast ? 'text-white' : 'text-gray-500'}
                                        `}>
                                            {isLast && viewMode === 'days' ? 'Today' : chartLabels[i]}
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                                        <div
                                            className={`
                                                h-full rounded-full transition-all duration-500
                                                ${isLast ? 'bg-white' :
                                                    isBest ? 'bg-emerald-500' :
                                                    isWorst ? 'bg-red-500' : 'bg-white/25'}
                                            `}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>

                                    {/* Share */}
                                    <span className="text-[9px] sm:text-[10px] text-gray-600 tabular-nums w-7 sm:w-8 text-right shrink-0">
                                        {share}%
                                    </span>

                                    {/* Value + Change */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span className={`
                                            text-[10px] sm:text-xs font-semibold tabular-nums
                                            ${isLast ? 'text-white' : 'text-gray-400'}
                                        `}>
                                            ₹{formatCompact(val)}
                                        </span>
                                        {i > 0 && viewMode === 'days' && (
                                            <span className={`
                                                text-[8px] sm:text-[9px] font-medium 
                                                px-1 py-0.5 rounded hidden sm:inline-block
                                                ${change >= 0 
                                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                                    : 'bg-red-500/10 text-red-400'
                                                }
                                            `}>
                                                {change >= 0 ? '+' : ''}{change.toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="px-4 sm:px-5 py-2.5 sm:py-3 bg-white/[0.02] border-t border-white/[0.05]">
                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-gray-500">
                    <Clock className="w-3 h-3 shrink-0" />
                    <span className="truncate">
                        {showGrowth 
                            ? isUp
                                ? `Up ${Math.abs(growthPercent).toFixed(1)}% from ${viewMode === 'days' ? 'yesterday' : 'previous'}`
                                : `Down ${Math.abs(growthPercent).toFixed(1)}% from ${viewMode === 'days' ? 'yesterday' : 'previous'}`
                            : `Tracking ${viewMode === 'days' ? 'daily' : 'category'} performance`
                        }
                    </span>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════
// MINI STAT COMPONENT
// ═══════════════════════════════════════════════════════════════════

function MiniStat({ label, value, highlight, dim }) {
    return (
        <div className={`
            p-2 sm:p-2.5 rounded-lg sm:rounded-xl text-center
            ${highlight === 'up' ? 'bg-emerald-500/[0.08]' :
                highlight === 'down' ? 'bg-red-500/[0.08]' : 'bg-white/[0.03]'}
        `}>
            <p className={`
                text-[8px] sm:text-[9px] font-medium uppercase tracking-wider mb-0.5 sm:mb-1
                ${highlight === 'up' ? 'text-emerald-500' :
                    highlight === 'down' ? 'text-red-500' : 'text-gray-600'}
            `}>
                {label}
            </p>
            <p className={`
                text-[10px] sm:text-xs font-bold truncate tabular-nums
                ${dim ? 'text-gray-400' : 'text-white'}
            `}>
                {value}
            </p>
        </div>
    );
}