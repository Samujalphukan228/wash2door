'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import RevenueChart from '@/components/admin/charts/RevenueChart';
import CreateBookingModal from '@/components/admin/bookings/CreateBookingModal';
import ExpenseListPopup from '@/components/admin/Expense/ExpenseList';
import MobileFAB from '@/components/admin/MobileFAB';
import useDashboard from '@/hooks/useDashboard';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
    Chart as ChartJS,
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Tooltip, Filler,
} from 'chart.js';
import {
    CalendarDays, IndianRupee, ChevronRight,
    CheckCircle2, AlertCircle, XCircle, Clock,
    Plus, Wallet, TrendingUp, Loader2,
    ArrowUpRight, ArrowDownRight, Star,
} from 'lucide-react';

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement,
    BarElement, ArcElement, Tooltip, Filler,
);

// ============================================
// MAIN PAGE
// ============================================

export default function DashboardPage() {
    const {
        stats, loading, refetch,
        revenue, expenses, profit, weeklyData,
    } = useDashboard();

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showExpenses, setShowExpenses] = useState(false);

    const greeting = useMemo(() => {
        const h = new Date().getHours();
        if (h < 12) return 'Good morning';
        if (h < 17) return 'Good afternoon';
        return 'Good evening';
    }, []);

    const dateStr = useMemo(() =>
        new Date().toLocaleDateString('en-IN', {
            weekday: 'long', day: 'numeric', month: 'short',
        }),
    []);

    const bookingStats = useMemo(() => {
        const s = stats?.bookings?.byStatus || {};
        return {
            pending: s.pending || 0,
            confirmed: s.confirmed || 0,
            completed: s.completed || 0,
            cancelled: s.cancelled || 0,
            total: stats?.bookings?.total || 0,
        };
    }, [stats]);

    const categoryData = useMemo(() => {
        if (!stats?.bookingsByCategory) return [];
        return stats.bookingsByCategory
            .map((i) => ({ name: i._id, bookings: i.count, revenue: i.revenue }))
            .sort((a, b) => b.revenue - a.revenue);
    }, [stats]);

    const totals = useMemo(() => {
        const tb = categoryData.reduce((s, i) => s + i.bookings, 0);
        const tr = categoryData.reduce((s, i) => s + i.revenue, 0);
        return { totalBookings: tb, totalRevenue: tr, avgPerBooking: tb > 0 ? Math.round(tr / tb) : 0 };
    }, [categoryData]);

    const handleCreateSuccess = () => {
        setShowCreateModal(false);
        setTimeout(() => { refetch(); toast.success('Booking created'); }, 100);
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                        <p className="text-[10px] text-white/20 uppercase tracking-wide">Loading...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-3">

                {/* ════════════════════════════════════
                    SECTION 1: HERO — Greeting + Profit
                   ════════════════════════════════════ */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-[10px] text-white/30 uppercase tracking-wide mb-1">{greeting}</p>
                            <p className="text-[10px] text-white/20">{dateStr}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setShowExpenses(true)}
                                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-white/40 hover:text-white hover:bg-white/[0.08] text-[11px] font-medium transition-all"
                            >
                                <Wallet className="w-3 h-3" />
                                Expenses
                            </button>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white text-black text-[11px] font-semibold hover:bg-white/90 active:scale-[0.98] transition-all"
                            >
                                <Plus className="w-3 h-3" />
                                Book
                            </button>
                        </div>
                    </div>

                    {/* Hero number — NET PROFIT */}
                    <div className="mb-4">
                        <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide mb-1">
                            Net Profit · This Month
                        </p>
                        <div className="flex items-baseline gap-2">
                            <h2 className={`text-3xl sm:text-4xl font-bold tabular-nums tracking-tight ${
                                (profit.thisMonth || 0) < 0 ? 'text-red-400' : 'text-white'
                            }`}>
                                ₹{Math.abs(profit.thisMonth || 0).toLocaleString('en-IN')}
                            </h2>
                            <TrendBadge value={profit.growth} />
                        </div>
                        <p className="text-[10px] text-white/20 mt-1 tabular-nums">
                            {profit.marginThisMonth || 0}% margin
                        </p>
                    </div>

                    {/* Revenue / Expenses inline */}
                    <div className="flex gap-2">
                        <MiniStat label="Revenue" value={revenue.thisMonth || 0} trend={revenue.growth} prefix="+" />
                        <MiniStat label="Expenses" value={expenses.thisMonth || 0} trend={expenses.growth} trendInverse prefix="-" />
                    </div>
                </div>

                {/* ════════════════════════════════════
                    SECTION 2: QUICK ACTIONS — Bookings + Users
                   ════════════════════════════════════ */}
                <div className="grid grid-cols-2 gap-2">
                    <ActionCard
                        value={bookingStats.total}
                        label="Bookings"
                        sub={bookingStats.pending > 0 ? `${bookingStats.pending} pending` : `${bookingStats.completed} done`}
                        href="/admin/bookings"
                        alert={bookingStats.pending > 0}
                    />
                    <ActionCard
                        value={stats?.users?.total || 0}
                        label="Customers"
                        sub="Registered"
                        href="/admin/users"
                    />
                </div>

                {/* ════════════════════════════════════
                    SECTION 3: STATUS STRIP
                   ════════════════════════════════════ */}
                <StatusStrip data={bookingStats} />

                {/* ════════════════════════════════════
                    SECTION 4: REVENUE CHART
                   ════════════════════════════════════ */}
                <RevenueChart weeklyData={weeklyData} totals={totals} />

                {/* ════════════════════════════════════
                    SECTION 5: RECENT BOOKINGS
                   ════════════════════════════════════ */}
                <RecentBookings bookings={stats?.recentBookings} />

                {/* ════════════════════════════════════
                    SECTION 6: TOP SERVICES
                   ════════════════════════════════════ */}
                <TopServices services={stats?.popularServices} />

            </div>

            {/* Mobile FAB */}
            <MobileFAB
                onNewBooking={() => setShowCreateModal(true)}
                onExpenses={() => setShowExpenses(true)}
            />

            {showCreateModal && (
                <CreateBookingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleCreateSuccess}
                />
            )}

            <ExpenseListPopup
                isOpen={showExpenses}
                onClose={() => setShowExpenses(false)}
            />
        </DashboardLayout>
    );
}

// ============================================
// TREND BADGE
// ============================================

function TrendBadge({ value }) {
    if (value === undefined || value === null) return null;
    const isPos = value > 0;
    const isNeg = value < 0;

    return (
        <span className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-semibold tabular-nums ${
            isPos
                ? 'bg-emerald-500/15 text-emerald-400'
                : isNeg
                    ? 'bg-red-500/15 text-red-400'
                    : 'bg-white/[0.06] text-white/30'
        }`}>
            {isPos && <ArrowUpRight className="w-3 h-3" />}
            {isNeg && <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(value)}%
        </span>
    );
}

// ============================================
// MINI STAT — inside hero card
// ============================================

function MiniStat({ label, value, trend, trendInverse, prefix = '' }) {
    const isPos = trendInverse ? trend < 0 : trend > 0;
    const isNeg = trendInverse ? trend > 0 : trend < 0;
    const hasTrend = trend !== undefined && trend !== null;

    return (
        <div className="flex-1 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.04]">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] text-white/30 font-medium uppercase tracking-wide">{label}</span>
                {hasTrend && (
                    <span className={`text-[9px] font-medium tabular-nums ${
                        isPos ? 'text-emerald-400' : isNeg ? 'text-red-400' : 'text-white/25'
                    }`}>
                        {isPos ? '+' : ''}{trend}%
                    </span>
                )}
            </div>
            <p className="text-sm font-bold text-white tabular-nums">
                <span className="text-white/30">{prefix}</span>
                ₹{value.toLocaleString('en-IN')}
            </p>
        </div>
    );
}

// ============================================
// ACTION CARD — tappable, big number
// ============================================

function ActionCard({ value, label, sub, href, alert }) {
    return (
        <Link href={href}>
            <div className="p-3 sm:p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-white/[0.10] transition-all active:scale-[0.98] group">
                <p className="text-[9px] text-white/30 font-medium uppercase tracking-wide mb-1">{label}</p>
                <p className="text-2xl font-bold text-white tabular-nums mb-1">{value}</p>
                <div className="flex items-center justify-between">
                    <p className={`text-[10px] ${alert ? 'text-amber-400 font-medium' : 'text-white/20'}`}>
                        {alert && <AlertCircle className="w-3 h-3 inline mr-0.5 -mt-px" />}
                        {sub}
                    </p>
                    <ChevronRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/25 group-hover:translate-x-0.5 transition-all" />
                </div>
            </div>
        </Link>
    );
}

// ============================================
// STATUS STRIP
// ============================================

function StatusStrip({ data }) {
    const total = data.total || 0;
    if (total === 0) return null;

    const items = [
        { key: 'pending',   label: 'Pending',   icon: Clock },
        { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2 },
        { key: 'completed', label: 'Done',       icon: CheckCircle2 },
        { key: 'cancelled', label: 'Cancelled', icon: XCircle },
    ].filter((s) => (data[s.key] || 0) > 0);

    const barOpacities = [0.7, 0.45, 0.25, 0.12];

    return (
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
                <p className="text-[9px] text-white/30 font-medium uppercase tracking-wide">Status</p>
                <p className="text-[10px] text-white/20 tabular-nums">{total} total</p>
            </div>

            {/* Bar */}
            <div className="flex h-1 rounded-full overflow-hidden bg-white/[0.04] mb-2.5 gap-px">
                {items.map((s, i) => {
                    const val = data[s.key] || 0;
                    return (
                        <div
                            key={s.key}
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${(val / total) * 100}%`,
                                backgroundColor: `rgba(255,255,255,${barOpacities[i] || 0.12})`,
                            }}
                        />
                    );
                })}
            </div>

            {/* Chips */}
            <div className="flex gap-1">
                {items.map((s) => {
                    const val = data[s.key] || 0;
                    const Icon = s.icon;
                    const isPending = s.key === 'pending';

                    return (
                        <div
                            key={s.key}
                            className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg ${
                                isPending
                                    ? 'bg-amber-500/[0.08] border border-amber-500/15'
                                    : 'bg-white/[0.02]'
                            }`}
                        >
                            <Icon className={`w-2.5 h-2.5 ${isPending ? 'text-amber-400' : 'text-white/20'}`} />
                            <span className={`text-[10px] font-semibold tabular-nums ${
                                isPending ? 'text-amber-400' : 'text-white/40'
                            }`}>
                                {val}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================
// RECENT BOOKINGS
// ============================================

function RecentBookings({ bookings }) {
    const safe = bookings || [];

    return (
        <Section
            title="Recent Bookings"
            count={safe.length}
            href="/admin/bookings"
            linkText="All"
        >
            {safe.length === 0 ? (
                <EmptyBlock text="No bookings yet" />
            ) : (
                <div className="divide-y divide-white/[0.04]">
                    {safe.slice(0, 5).map((b) => (
                        <BookingRow key={b._id} booking={b} />
                    ))}
                </div>
            )}
        </Section>
    );
}

// ============================================
// BOOKING ROW
// ============================================

function BookingRow({ booking }) {
    const name = booking.customerId
        ? `${booking.customerId.firstName} ${booking.customerId.lastName}`
        : booking.walkInCustomer?.name || 'Walk-in';

    const date = booking.bookingDate ? new Date(booking.bookingDate) : null;
    const isToday = date && new Date().toDateString() === date.toDateString();
    const isPending = booking.status === 'pending';

    const statusText = { pending: 'Pending', confirmed: 'Confirmed', completed: 'Done', cancelled: 'Cancelled' };

    return (
        <div className="flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/[0.02] transition-colors">
            {/* Avatar */}
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white/40">
                    {name.charAt(0).toUpperCase()}
                </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-medium text-white/70 truncate">{name}</p>
                    {isPending && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    )}
                </div>
                <p className="text-[10px] text-white/20 truncate mt-0.5">
                    {booking.serviceName}
                    {date && (
                        <span className="text-white/12"> · {isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    )}
                </p>
            </div>

            {/* Right */}
            <div className="text-right shrink-0 flex flex-col items-end gap-0.5">
                <p className="text-[11px] font-semibold text-white tabular-nums">
                    ₹{(booking.price || 0).toLocaleString('en-IN')}
                </p>
                <span className={`text-[9px] ${isPending ? 'text-amber-400' : 'text-white/25'}`}>
                    {statusText[booking.status] || 'Pending'}
                </span>
            </div>
        </div>
    );
}

// ============================================
// TOP SERVICES
// ============================================

function TopServices({ services }) {
    const safe = services || [];
    const max = safe[0]?.totalBookings || 1;
    const total = safe.reduce((s, x) => s + (x.totalBookings || 0), 0);

    return (
        <Section title="Top Services" count={total} href="/admin/services" linkText="All" countLabel="bookings">
            {safe.length === 0 ? (
                <EmptyBlock text="No data yet" />
            ) : (
                <div className="p-2 space-y-0.5">
                    {safe.slice(0, 5).map((s, i) => {
                        const pct = Math.round((s.totalBookings / max) * 100);
                        const share = total > 0 ? Math.round((s.totalBookings / total) * 100) : 0;
                        const isTop = i === 0;

                        return (
                            <div key={s._id} className={`px-2.5 py-2 rounded-lg transition-colors ${
                                isTop ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'
                            }`}>
                                {/* Info row */}
                                <div className="flex items-center justify-between mb-1.5">
                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                        <div className={`w-5 h-5 rounded-md flex items-center justify-center text-[9px] font-bold tabular-nums shrink-0 ${
                                            isTop ? 'bg-white/[0.08] text-white/70' : 'bg-white/[0.04] text-white/25'
                                        }`}>
                                            {i + 1}
                                        </div>
                                        <p className={`text-[11px] font-medium truncate ${
                                            isTop ? 'text-white/80' : 'text-white/45'
                                        }`}>
                                            {s.serviceName}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        <span className="text-[9px] text-white/15 tabular-nums">{share}%</span>
                                        <span className={`text-[11px] font-semibold tabular-nums ${
                                            isTop ? 'text-white' : 'text-white/40'
                                        }`}>
                                            {s.totalBookings}
                                        </span>
                                    </div>
                                </div>

                                {/* Bar */}
                                <div className="h-[3px] bg-white/[0.04] rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-700 ease-out ${
                                            isTop ? 'bg-white/35' : 'bg-white/12'
                                        }`}
                                        style={{ width: `${pct}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {safe.length > 0 && (
                <div className="mx-3 mb-2.5 px-2.5 py-2 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <p className="text-[10px] text-white/25">
                        <Star className="w-3 h-3 inline mr-1 -mt-px text-white/20" />
                        <span className="text-white/50 font-medium">{safe[0]?.serviceName}</span> leads with {safe[0]?.totalBookings} bookings
                    </p>
                </div>
            )}
        </Section>
    );
}

// ============================================
// SECTION WRAPPER — consistent headers
// ============================================

function Section({ title, count, countLabel = '', href, linkText, children }) {
    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                    <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">{title}</p>
                    {count !== undefined && (
                        <span className="text-[9px] text-white/20 tabular-nums">
                            {count}{countLabel && ` ${countLabel}`}
                        </span>
                    )}
                </div>
                {href && (
                    <Link
                        href={href}
                        className="flex items-center gap-0.5 text-[10px] text-white/25 hover:text-white/50 transition-colors"
                    >
                        {linkText} <ChevronRight className="w-3 h-3" />
                    </Link>
                )}
            </div>

            {/* Content */}
            {children}
        </div>
    );
}

// ============================================
// EMPTY BLOCK
// ============================================

function EmptyBlock({ text }) {
    return (
        <div className="flex items-center justify-center py-10">
            <p className="text-[11px] text-white/20">{text}</p>
        </div>
    );
}