'use client';

import { useState, useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
  ChevronRight,
  BarChart3,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function RevenueChart({ categoryData, totals, weeklyData }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [viewMode, setViewMode] = useState('revenue');

  // Edge case: empty data
  if (!categoryData || categoryData.length === 0) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="w-8 h-8 text-gray-600 mb-3" />
          <p className="text-sm text-gray-400">No revenue data available</p>
        </div>
      </div>
    );
  }

  const chartLabels = categoryData.map(d => d.name);
  const chartValues = categoryData.map(d => {
    const val = viewMode === 'revenue' ? d.revenue : d.bookings;
    return typeof val === 'number' && val >= 0 ? val : 0;
  });

  // Edge case: all zeros
  const hasValidData = chartValues.some(v => v > 0);
  
  if (!hasValidData) {
    return (
      <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="w-8 h-8 text-yellow-600 mb-3" />
          <p className="text-sm text-gray-400">No {viewMode} data to display</p>
        </div>
      </div>
    );
  }

  const maxValue = Math.max(...chartValues);
  const minValue = Math.min(...chartValues);
  const totalValue = chartValues.reduce((a, b) => a + b, 0);
  const avgValue = totalValue / chartValues.length;
  const range = maxValue - minValue;

  // Smart padding for y-axis
  const yPadding = range === 0 ? maxValue * 0.5 : range * 0.15;
  const yMin = Math.max(0, minValue - yPadding);
  const yMax = maxValue + yPadding;

  const topCategory = categoryData[0];
  const bestIndex = chartValues.indexOf(maxValue);

  // Determine if we need compressed view (many categories)
  const isCompressed = categoryData.length > 12;

  const chartData = useMemo(() => ({
    labels: chartLabels,
    datasets: [{
      label: viewMode === 'revenue' ? 'Revenue' : 'Bookings',
      data: chartValues,
      borderColor: 'rgb(16, 185, 129)',
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.4)');
        gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.08)');
        gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      borderWidth: 2.5,
      pointRadius: isCompressed ? 3 : 4,
      pointBackgroundColor: 'rgb(16, 185, 129)',
      pointBorderColor: '#fff',
      pointBorderWidth: 2,
      pointHoverRadius: isCompressed ? 5 : 7,
      pointHoverBackgroundColor: 'rgb(16, 185, 129)',
      pointHoverBorderWidth: 3,
      pointHoverBorderColor: '#fff',
      clip: false,
    }]
  }), [chartLabels, chartValues, viewMode, isCompressed]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    animation: {
      duration: 600,
      easing: 'easeInOutQuart',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        titleColor: 'rgb(16, 185, 129)',
        bodyColor: '#fff',
        titleFont: { size: 12, weight: '700', family: "'Inter', sans-serif" },
        bodyFont: { size: 13, weight: '600', family: "'Inter', sans-serif" },
        padding: { x: 16, y: 12 },
        cornerRadius: 12,
        borderColor: 'rgba(16, 185, 129, 0.5)',
        borderWidth: 1.5,
        displayColors: false,
        caretSize: 6,
        caretPadding: 12,
        callbacks: {
          title: (items) => {
            if (!items.length) return '';
            const idx = items[0]?.dataIndex;
            return categoryData[idx]?.name || '';
          },
          label: (context) => {
            const value = context.parsed.y;
            if (viewMode === 'revenue') {
              return `₹${value.toLocaleString('en-IN')}`;
            }
            return `${value} bookings`;
          },
          afterLabel: (context) => {
            const value = context.parsed.y;
            const pct = totalValue > 0 ? ((value / totalValue) * 100).toFixed(1) : 0;
            const diff = ((value - avgValue) / avgValue * 100).toFixed(1);
            return [
              `${pct}% of total`,
              `${diff > 0 ? '+' : ''}${diff}% vs avg`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(107, 114, 128, 0.06)',
          lineWidth: 1,
          tickLength: 0
        },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 10, weight: '500', family: "'Inter', sans-serif" },
          padding: 12,
          maxRotation: isCompressed ? 90 : 45,
          minRotation: isCompressed ? 90 : 0,
          autoSkip: isCompressed,
          autoSkipPadding: 30,
          callback: function (value, index) {
            const label = chartLabels[index] || '';
            const maxLen = isCompressed ? 6 : 10;
            return label.length > maxLen ? label.substring(0, maxLen) + '...' : label;
          }
        }
      },
      y: {
        position: 'left',
        grid: {
          display: true,
          drawBorder: false,
          color: 'rgba(107, 114, 128, 0.06)',
          lineWidth: 1,
          drawTicks: false
        },
        border: { display: false },
        ticks: {
          color: '#9ca3af',
          font: { size: 10, weight: '500', family: "'Inter', sans-serif" },
          padding: 16,
          callback: function(value) {
            if (viewMode === 'revenue') {
              if (value >= 10000000) return '₹' + (value / 10000000).toFixed(1) + 'Cr';
              if (value >= 100000) return '₹' + (value / 100000).toFixed(0) + 'L';
              if (value >= 1000) return '₹' + (value / 1000).toFixed(0) + 'k';
              return '₹' + value;
            }
            return value.toLocaleString('en-IN');
          }
        },
        min: yMin,
        max: yMax
      }
    },
    onHover: (event, elements) => {
      setActiveIndex(elements.length > 0 ? elements[0].index : null);
    }
  }), [yMin, yMax, chartLabels, categoryData, viewMode, totalValue, avgValue, isCompressed]);

  const displayValue = activeIndex !== null
    ? chartValues[activeIndex]
    : (viewMode === 'revenue' ? totals.totalRevenue : totals.totalBookings);
  const displayLabel = activeIndex !== null
    ? categoryData[activeIndex]?.name
    : 'Total';

  const formatValue = (val) => {
    if (viewMode === 'revenue') {
      if (val >= 10000000) return '₹' + (val / 10000000).toFixed(1) + 'Cr';
      if (val >= 100000) return '₹' + (val / 100000).toFixed(1) + 'L';
      if (val >= 1000) return '₹' + (val / 1000).toFixed(0) + 'k';
      return '₹' + val;
    }
    return val.toLocaleString('en-IN');
  };

  return (
    <div className="bg-white/[0.02] border border-white/[0.08] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex-1">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-2">
              {displayLabel}
            </p>
            <p className="text-3xl sm:text-4xl font-bold text-white break-words">
              {formatValue(displayValue)}
            </p>
          </div>
          
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setViewMode('revenue')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'revenue'
                  ? 'bg-white text-black'
                  : 'bg-white/[0.05] text-gray-500 hover:text-gray-300'
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setViewMode('bookings')}
              className={`px-3 py-2 text-xs font-semibold rounded-lg transition-all ${
                viewMode === 'bookings'
                  ? 'bg-white text-black'
                  : 'bg-white/[0.05] text-gray-500 hover:text-gray-300'
              }`}
            >
              Bookings
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          <StatBox 
            label="Total" 
            value={formatValue(totalValue)}
          />
          <StatBox 
            label="Average" 
            value={formatValue(avgValue)}
          />
          <StatBox 
            label="Peak" 
            value={formatValue(maxValue)}
            highlight="up"
          />
          <StatBox 
            label="Low" 
            value={formatValue(minValue)}
            highlight="down"
          />
        </div>

        {/* Chart Container */}
        <div className="relative bg-gradient-to-br from-emerald-500/[0.04] to-transparent rounded-xl p-4 border border-white/[0.04]">
          {/* Chart */}
          <div className={`${isCompressed ? 'h-80' : 'h-72'} w-full`}>
            <Line data={chartData} options={options} />
          </div>
          
          {/* Hover Indicator */}
          {activeIndex !== null && (
            <div className="absolute top-2 right-2 flex items-center gap-2 bg-black/80 px-3 py-1.5 rounded-lg border border-emerald-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-300 font-medium">
                {chartLabels[activeIndex]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Breakdown */}
      <div className="border-t border-white/[0.06]">
        <button
          onClick={() => setShowBreakdown(!showBreakdown)}
          className="w-full flex items-center justify-between p-4 hover:bg-white/[0.02] transition-colors"
        >
          <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">
            By Category ({categoryData.length})
          </span>
          <ChevronRight className={`w-4 h-4 text-gray-600 transition-transform ${showBreakdown ? 'rotate-90' : ''}`} />
        </button>

        {showBreakdown && (
          <div className="px-4 pb-4 space-y-1.5 max-h-96 overflow-y-auto">
            {categoryData.map((item, i) => {
              const val = viewMode === 'revenue' ? item.revenue : item.bookings;
              const safeVal = typeof val === 'number' && val >= 0 ? val : 0;
              const percentage = maxValue > 0 ? (safeVal / maxValue) * 100 : 0;
              const share = totalValue > 0 ? Math.round((safeVal / totalValue) * 100) : 0;
              const isTop = i === 0;
              const isBest = i === bestIndex;

              return (
                <div
                  key={item.name}
                  className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all ${
                    isTop ? 'bg-emerald-500/10' : 'hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Rank */}
                  <span className={`text-xs font-bold w-6 text-center shrink-0 ${
                    isTop ? 'text-emerald-400' : 'text-gray-600'
                  }`}>
                    #{i + 1}
                  </span>

                  {/* Name */}
                  <span className={`text-xs font-medium truncate flex-shrink-0 w-24 ${
                    isTop ? 'text-white' : 'text-gray-400'
                  }`}>
                    {item.name}
                  </span>

                  {/* Bar */}
                  <div className="flex-1 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isTop ? 'bg-emerald-500' : isBest ? 'bg-emerald-400/60' : 'bg-white/20'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>

                  {/* Percentage */}
                  <span className="text-xs text-gray-600 w-8 text-right shrink-0 tabular-nums">
                    {share}%
                  </span>

                  {/* Value */}
                  <span className={`text-xs font-semibold w-24 text-right shrink-0 tabular-nums ${
                    isTop ? 'text-white' : 'text-gray-400'
                  }`}>
                    {formatValue(safeVal)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 bg-white/[0.01] border-t border-white/[0.06]">
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <TrendingUp className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {topCategory 
              ? `${topCategory.name} leads with ${formatValue(viewMode === 'revenue' ? topCategory.revenue : topCategory.bookings)}`
              : 'Performance by category'
            }
          </span>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, highlight }) {
  return (
    <div className={`p-3 rounded-lg border text-center transition-all ${
      highlight === 'up' 
        ? 'bg-emerald-500/[0.12] border-emerald-500/[0.2]' 
        : highlight === 'down' 
        ? 'bg-red-500/[0.12] border-red-500/[0.2]'
        : 'bg-white/[0.04] border-white/[0.08]'
    }`}>
      <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${
        highlight === 'up' ? 'text-emerald-500' : 
        highlight === 'down' ? 'text-red-500' : 
        'text-gray-600'
      }`}>
        {label}
      </p>
      <p className="text-xs font-bold text-white truncate">{value}</p>
    </div>
  );
}