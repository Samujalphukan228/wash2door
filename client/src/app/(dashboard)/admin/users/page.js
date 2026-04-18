'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import UserDetailModal from '@/components/admin/users/UserDetailModal';
import BlockUserModal from '@/components/admin/users/BlockUserModal';
import adminService from '@/services/adminService';
import { format } from 'date-fns';
import {
    Users, RefreshCw, Search, X,
    ChevronRight, ChevronLeft, ChevronDown,
    Eye, ShieldCheck, ShieldOff, ShieldAlert,
    UserCheck, UserX, Crown, SlidersHorizontal,
    Calendar, Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// CONSTANTS
// ============================================

const ROLE_OPTIONS = [
    { value: 'all',   label: 'All Roles' },
    { value: 'user',  label: 'Customer' },
    { value: 'admin', label: 'Admin' },
];

const STATUS_OPTIONS = [
    { value: '',      label: 'All Status' },
    { value: 'false', label: 'Active' },
    { value: 'true',  label: 'Blocked' },
];

// ============================================
// MAIN PAGE
// ============================================

export default function UsersPage() {
    const [users, setUsers]         = useState([]);
    const [loading, setLoading]     = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [total, setTotal]         = useState(0);
    const [pages, setPages]         = useState(1);
    const [showFilters, setShowFilters]       = useState(false);
    const [selectedUser, setSelectedUser]     = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showBlockModal, setShowBlockModal]   = useState(false);

    const [filters, setFilters] = useState({
        page: 1, limit: 10, search: '', role: 'all', isBlocked: '',
    });

    // ── Fetch ──
    const fetchUsers = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const res = await adminService.getAllUsers(params);
            if (res.success) {
                setUsers(res.data?.users || res.data || []);
                setTotal(res.data?.total || res.total || 0);
                setPages(res.data?.pages || res.pages || 1);
            }
        } catch {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // ── Stats ──
    const stats = useMemo(() => ({
        total,
        customers: users.filter((u) => u.role === 'user').length,
        admins:    users.filter((u) => u.role === 'admin').length,
        blocked:   users.filter((u) => u.isBlocked).length,
    }), [users, total]);

    // ── Handlers ──
    const handleFilterChange = (newFilters) =>
        setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));

    const handlePageChange = (page) => {
        setFilters((prev) => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleView = async (user) => {
        try {
            const res = await adminService.getUserById(user._id);
            setSelectedUser(res.success ? res.data : { user });
        } catch {
            setSelectedUser({ user });
        }
        setShowDetailModal(true);
    };

    const handleBlockClick = (user) => {
        setSelectedUser(user);
        setShowBlockModal(true);
    };

    const handleBlock = async (userId, reason) => {
        try {
            await adminService.blockUser(userId, reason);
            toast.success('User blocked');
            setShowBlockModal(false);
            setSelectedUser(null);
            fetchUsers(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to block user');
            throw err;
        }
    };

    const handleUnblock = async (userId) => {
        try {
            await adminService.unblockUser(userId);
            toast.success('User unblocked');
            if (showDetailModal) { setShowDetailModal(false); setSelectedUser(null); }
            fetchUsers(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to unblock');
        }
    };

    const handleRoleChange = async (userId, role) => {
        if (role === 'developer') return;
        const label = role === 'user' ? 'Customer' : 'Admin';
        if (!confirm(`Change this user's role to ${label}?`)) return;
        try {
            await adminService.changeUserRole(userId, role);
            toast.success(`Role changed to ${label}`);
            if (showDetailModal) { setShowDetailModal(false); setSelectedUser(null); }
            fetchUsers(true);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to change role');
        }
    };

    const handleRefresh = () => {
        fetchUsers(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    const activeFiltersCount = [
        filters.search,
        filters.role !== 'all' ? filters.role : '',
        filters.isBlocked,
    ].filter(Boolean).length;

    // ── Loading ──
    if (loading && users.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
                        <p className="text-[10px] text-white/20 uppercase tracking-wide">Loading users...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-3 sm:space-y-4">

                {/* ── Header ── */}
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-[10px] text-white/30 uppercase tracking-wide">Manage</p>
                        <h1 className="text-base sm:text-lg font-semibold text-white">Users</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        {refreshing && (
                            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] text-white/30">Syncing</span>
                            </div>
                        )}
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="w-8 h-8 rounded-lg border border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white hover:bg-white/[0.06] disabled:opacity-30 transition-all flex items-center justify-center"
                        >
                            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* ── Stats Strip ── */}
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <UserStat label="Total"     value={stats.total}     sub="All users" />
                    <UserStat label="Customers" value={stats.customers} sub="Regular users" />
                    <UserStat label="Admins"    value={stats.admins}    sub="Admin access"   color="purple" />
                    <UserStat label="Blocked"   value={stats.blocked}   sub="Restricted"
                        color={stats.blocked > 0 ? 'red' : undefined}
                    />
                </div>

                {/* ── Filter Bar ── */}
                <FilterBar
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    showFilters={showFilters}
                    setShowFilters={setShowFilters}
                    activeCount={activeFiltersCount}
                />

                {/* ── Users List ── */}
                <UsersList
                    users={users}
                    loading={loading}
                    total={total}
                    pages={pages}
                    currentPage={filters.page}
                    onPageChange={handlePageChange}
                    onView={handleView}
                    onBlock={handleBlockClick}
                    onUnblock={handleUnblock}
                    onRoleChange={handleRoleChange}
                />
            </div>

            {/* Modals */}
            {showDetailModal && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => { setShowDetailModal(false); setSelectedUser(null); }}
                    onBlock={() => { setShowDetailModal(false); setShowBlockModal(true); }}
                    onUnblock={async () => {
                        const id = selectedUser.user?._id || selectedUser._id;
                        await handleUnblock(id);
                    }}
                    onRoleChange={async (role) => {
                        const id = selectedUser.user?._id || selectedUser._id;
                        await handleRoleChange(id, role);
                    }}
                />
            )}

            {showBlockModal && selectedUser && (
                <BlockUserModal
                    user={selectedUser}
                    onClose={() => { setShowBlockModal(false); setSelectedUser(null); }}
                    onBlock={handleBlock}
                />
            )}
        </DashboardLayout>
    );
}

// ============================================
// USER STAT CARD
// ============================================

function UserStat({ label, value, sub, color }) {
    const colorMap = {
        purple: 'text-purple-400',
        red:    'text-red-400',
        emerald:'text-emerald-400',
    };

    return (
        <div className="p-2.5 sm:p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <p className="text-[9px] text-white/30 font-medium uppercase tracking-wide mb-1">{label}</p>
            <p className={`text-lg sm:text-xl font-bold tabular-nums ${color ? colorMap[color] : 'text-white'}`}>
                {value}
            </p>
            <p className="text-[10px] text-white/20 mt-0.5 truncate">{sub}</p>
        </div>
    );
}

// ============================================
// FILTER BAR
// ============================================

function FilterBar({ filters, onFilterChange, showFilters, setShowFilters, activeCount }) {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') onFilterChange({ search: searchInput });
    };

    const clearAll = () => {
        setSearchInput('');
        onFilterChange({ search: '', role: 'all', isBlocked: '' });
    };

    return (
        <div className="space-y-2">
            {/* Row */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                        onBlur={() => onFilterChange({ search: searchInput })}
                        placeholder="Search users..."
                        className="w-full bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/25 pl-9 pr-8 py-2.5 rounded-lg focus:outline-none focus:border-white/20 transition-colors"
                    />
                    {searchInput && (
                        <button
                            onClick={() => { setSearchInput(''); onFilterChange({ search: '' }); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Desktop selects */}
                <SelectFilter
                    value={filters.role}
                    onChange={(v) => onFilterChange({ role: v })}
                    options={ROLE_OPTIONS}
                    className="hidden sm:block"
                />
                <SelectFilter
                    value={filters.isBlocked}
                    onChange={(v) => onFilterChange({ isBlocked: v })}
                    options={STATUS_OPTIONS}
                    className="hidden sm:block"
                />

                {/* Mobile toggle */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`sm:hidden flex items-center gap-1.5 px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                        showFilters || activeCount > 0
                            ? 'border-white/20 bg-white/[0.06] text-white'
                            : 'border-white/[0.06] bg-white/[0.02] text-white/40'
                    }`}
                >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    {activeCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-white text-black text-[9px] font-bold flex items-center justify-center">
                            {activeCount}
                        </span>
                    )}
                </button>

                {/* Desktop clear */}
                {activeCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="hidden sm:flex items-center gap-1 px-2.5 py-2 rounded-lg border border-white/[0.06] text-xs text-white/30 hover:text-white transition-all"
                    >
                        <X className="w-3 h-3" />
                        Clear
                    </button>
                )}
            </div>

            {/* Mobile expanded */}
            {showFilters && (
                <div className="sm:hidden grid grid-cols-2 gap-2 p-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02]">
                    <SelectFilter
                        value={filters.role}
                        onChange={(v) => onFilterChange({ role: v })}
                        options={ROLE_OPTIONS}
                    />
                    <SelectFilter
                        value={filters.isBlocked}
                        onChange={(v) => onFilterChange({ isBlocked: v })}
                        options={STATUS_OPTIONS}
                    />
                    {activeCount > 0 && (
                        <button
                            onClick={clearAll}
                            className="col-span-2 flex items-center justify-center gap-1 py-1.5 text-xs text-white/30 hover:text-white transition-colors"
                        >
                            <X className="w-3 h-3" />
                            Clear all
                        </button>
                    )}
                </div>
            )}

            {/* Active pills */}
            {activeCount > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap">
                    {filters.role && filters.role !== 'all' && (
                        <FilterPill
                            label={filters.role === 'user' ? 'Customer' : 'Admin'}
                            onRemove={() => onFilterChange({ role: 'all' })}
                        />
                    )}
                    {filters.isBlocked && (
                        <FilterPill
                            label={filters.isBlocked === 'true' ? 'Blocked' : 'Active'}
                            onRemove={() => onFilterChange({ isBlocked: '' })}
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
        </div>
    );
}

function SelectFilter({ value, onChange, options, className = '' }) {
    return (
        <div className={`relative ${className}`}>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none w-full bg-white/[0.04] border border-white/[0.06] text-xs text-white pl-3 pr-7 py-2.5 rounded-lg focus:outline-none focus:border-white/20 cursor-pointer [color-scheme:dark]"
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-white/25 pointer-events-none" />
        </div>
    );
}

function FilterPill({ label, onRemove }) {
    return (
        <span className="inline-flex items-center gap-1.5 pl-2 pr-1.5 py-1 rounded-full border border-white/[0.06] bg-white/[0.02] text-[10px] text-white/40 capitalize">
            {label}
            <button
                onClick={onRemove}
                className="w-3.5 h-3.5 rounded-full flex items-center justify-center hover:bg-white/[0.08] transition-colors"
            >
                <X className="w-2.5 h-2.5" />
            </button>
        </span>
    );
}

// ============================================
// USERS LIST
// ============================================

function UsersList({
    users, loading, total, pages, currentPage,
    onPageChange, onView, onBlock, onUnblock, onRoleChange,
}) {
    if (loading) {
        return (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                    <p className="text-[10px] text-white/20">Loading users...</p>
                </div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                        <Users className="w-4 h-4 text-white/20" />
                    </div>
                    <p className="text-[11px] text-white/40 mb-0.5">No users found</p>
                    <p className="text-[10px] text-white/20">Try adjusting your filters</p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/[0.06]">
                <p className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                    All Users
                </p>
                <p className="text-[10px] text-white/20 tabular-nums">
                    {total} total · Page {currentPage} of {pages}
                </p>
            </div>

            {/* Rows */}
            <div className="divide-y divide-white/[0.04]">
                {users.map((user, index) => (
                    <UserRow
                        key={user._id}
                        user={user}
                        isFirst={index === 0}
                        onView={onView}
                        onBlock={onBlock}
                        onUnblock={onUnblock}
                        onRoleChange={onRoleChange}
                    />
                ))}
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="flex items-center justify-between px-3 py-2.5 border-t border-white/[0.06]">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Prev
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                            let page;
                            if (pages <= 5) page = i + 1;
                            else if (currentPage <= 3) page = i + 1;
                            else if (currentPage >= pages - 2) page = pages - 4 + i;
                            else page = currentPage - 2 + i;

                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-7 h-7 text-[10px] font-medium rounded-lg transition-all ${
                                        currentPage === page
                                            ? 'bg-white text-black'
                                            : 'text-white/30 hover:text-white hover:bg-white/[0.04]'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === pages}
                        className="flex items-center gap-1 text-[10px] text-white/30 hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                    >
                        Next
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
}

// ============================================
// USER ROW
// ============================================

function UserRow({ user, isFirst, onView, onBlock, onUnblock, onRoleChange }) {
    const joinedDate = user.createdAt ? new Date(user.createdAt) : null;
    const isAdmin    = user.role === 'admin';
    const isBlocked  = user.isBlocked;

    return (
        <div
            onClick={() => onView(user)}
            className={`p-3 transition-colors cursor-pointer hover:bg-white/[0.02] active:bg-white/[0.03] ${
                isBlocked ? 'opacity-50' : ''
            } ${isFirst ? 'bg-white/[0.01]' : ''}`}
        >
            <div className="flex items-start gap-2.5">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-white/[0.06] border border-white/[0.08] flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white/40">
                            {user.firstName?.[0]?.toUpperCase()}{user.lastName?.[0]?.toUpperCase()}
                        </span>
                    </div>
                    {/* Status dot */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-[1.5px] border-black ${
                        isBlocked ? 'bg-red-400' : 'bg-emerald-400'
                    }`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                                <p className="text-[11px] font-medium text-white/80 truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                {isFirst && (
                                    <span className="text-[8px] px-1 py-0.5 rounded bg-white/[0.06] text-white/30 font-medium shrink-0">
                                        LATEST
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] text-white/25 truncate mt-0.5">{user.email}</p>
                        </div>

                        {/* Badges */}
                        <div className="flex items-center gap-1 shrink-0">
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded capitalize ${
                                isAdmin
                                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                                    : 'bg-white/[0.04] text-white/25 border border-white/[0.06]'
                            }`}>
                                {isAdmin ? 'Admin' : 'Customer'}
                            </span>
                            <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${
                                isBlocked
                                    ? 'bg-red-500/10 text-red-400'
                                    : 'bg-emerald-500/10 text-emerald-400'
                            }`}>
                                {isBlocked ? 'Blocked' : 'Active'}
                            </span>
                        </div>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-2">
                        <span className="flex items-center gap-1 text-[10px] text-white/20">
                            <Calendar className="w-2.5 h-2.5" />
                            {joinedDate ? format(joinedDate, 'MMM dd, yyyy') : '—'}
                        </span>
                        <span className="text-white/10">·</span>
                        <span className="text-[10px] text-white/20">
                            {user.totalBookings || 0} bookings
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5 mt-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onView(user); }}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/40 hover:text-white hover:bg-white/[0.08] transition-all"
                        >
                            <Eye className="w-3 h-3" />
                            View
                        </button>

                        {isBlocked ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onUnblock(user._id); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                            >
                                <ShieldCheck className="w-3 h-3" />
                                Unblock
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onBlock(user); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/40 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                            >
                                <ShieldOff className="w-3 h-3" />
                                Block
                            </button>
                        )}

                        {isAdmin ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRoleChange(user._id, 'user'); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/40 hover:text-white/60 hover:bg-white/[0.08] transition-all"
                            >
                                <ShieldOff className="w-3 h-3" />
                                Demote
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRoleChange(user._id, 'admin'); }}
                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06] text-[10px] text-white/40 hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/20 transition-all"
                            >
                                <ShieldAlert className="w-3 h-3" />
                                Admin
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}