'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import UserDetailModal from '@/components/admin/users/UserDetailModal';
import BlockUserModal from '@/components/admin/users/BlockUserModal';
import adminService from '@/services/adminService';
import { format } from 'date-fns';
import {
    Users,
    RefreshCw,
    Search,
    X,
    ChevronRight,
    ChevronLeft,
    ChevronDown,
    Eye,
    ShieldCheck,
    ShieldOff,
    ShieldAlert,
    UserCheck,
    UserX,
    Crown,
    SlidersHorizontal,
    Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        role: 'all',   // ✅ fetch everyone by default
        isBlocked: ''
    });

    const [showFilters, setShowFilters] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    const fetchUsers = useCallback(async (isRefresh = false) => {
        try {
            isRefresh ? setRefreshing(true) : setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await adminService.getAllUsers(params);
            if (response.success) {
                setUsers(response.data?.users || response.data || []);
                setTotal(response.data?.total || response.total || 0);
                setPages(response.data?.pages || response.pages || 1);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const stats = useMemo(() => ({
        total: total,
        customers: users.filter(u => u.role === 'user').length,
        admins: users.filter(u => u.role === 'admin').length,
        blocked: users.filter(u => u.isBlocked).length
    }), [users, total]);

    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleView = async (user) => {
        try {
            const response = await adminService.getUserById(user._id);
            if (response.success) {
                setSelectedUser(response.data);
            } else {
                setSelectedUser({ user });
            }
        } catch (error) {
            console.error('Get user details error:', error);
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
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to block user');
            throw error;
        }
    };

    const handleUnblock = async (userId) => {
        try {
            await adminService.unblockUser(userId);
            toast.success('User unblocked');
            if (showDetailModal) {
                setShowDetailModal(false);
                setSelectedUser(null);
            }
            fetchUsers(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to unblock');
        }
    };

    const handleRoleChange = async (userId, role) => {
        // ✅ Prevent assigning developer role from UI
        if (role === 'developer') return;

        const roleLabel = role === 'user' ? 'Customer' : 'Admin';
        if (!confirm(`Change this user's role to ${roleLabel}?`)) return;
        try {
            await adminService.changeUserRole(userId, role);
            toast.success(`Role changed to ${roleLabel}`);
            if (showDetailModal) {
                setShowDetailModal(false);
                setSelectedUser(null);
            }
            fetchUsers(true);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change role');
        }
    };

    const handleRefresh = () => {
        fetchUsers(true);
        toast.success('Refreshed', { duration: 1200 });
    };

    const activeFiltersCount = [filters.search, filters.role !== 'all' ? filters.role : '', filters.isBlocked].filter(Boolean).length;

    if (loading && users.length === 0) {
        return (
            <DashboardLayout>
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <p className="text-xs text-gray-600">Loading users...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-black">
                <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">

                    {/* Header */}
                    <header className="flex items-center justify-between px-3 sm:px-4 md:px-6 pt-4 sm:pt-6">
                        <div>
                            <p className="text-[10px] sm:text-xs text-gray-500 uppercase tracking-wider mb-0.5 sm:mb-1">
                                Manage
                            </p>
                            <h1 className="text-lg sm:text-xl font-semibold text-white tracking-tight">
                                Users
                            </h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {refreshing && (
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08]">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] text-gray-500">Syncing</span>
                                </div>
                            )}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="p-2 rounded-lg border border-white/[0.08] bg-white/[0.02] text-gray-500 hover:text-white hover:bg-white/[0.04] disabled:opacity-40 transition-all"
                            >
                                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </header>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 px-3 sm:px-4 md:px-6">
                        <StatCard icon={Users} label="Total" value={stats.total} sub="All users" />
                        <StatCard icon={UserCheck} label="Customers" value={stats.customers} sub="Regular users" />
                        <StatCard icon={Crown} label="Admins" value={stats.admins} sub="Admin access" />
                        <StatCard icon={UserX} label="Blocked" value={stats.blocked} sub="Restricted" highlight={stats.blocked > 0} />
                    </div>

                    {/* Filters */}
                    <FilterBar
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        showFilters={showFilters}
                        setShowFilters={setShowFilters}
                        activeCount={activeFiltersCount}
                    />

                    {/* Users List */}
                    <div className="px-3 sm:px-4 md:px-6 pb-6">
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

                </div>
            </div>

            {showDetailModal && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedUser(null);
                    }}
                    onBlock={() => {
                        setShowDetailModal(false);
                        setShowBlockModal(true);
                    }}
                    onUnblock={async () => {
                        const userId = selectedUser.user?._id || selectedUser._id;
                        await handleUnblock(userId);
                    }}
                    onRoleChange={async (role) => {
                        const userId = selectedUser.user?._id || selectedUser._id;
                        await handleRoleChange(userId, role);
                    }}
                />
            )}

            {showBlockModal && selectedUser && (
                <BlockUserModal
                    user={selectedUser}
                    onClose={() => {
                        setShowBlockModal(false);
                        setSelectedUser(null);
                    }}
                    onBlock={handleBlock}
                />
            )}
        </DashboardLayout>
    );
}

function StatCard({ icon: Icon, label, value, sub, highlight }) {
    return (
        <div className={`
            bg-white/[0.02] border rounded-xl sm:rounded-2xl p-3 sm:p-4 transition-all hover:bg-white/[0.04]
            ${highlight ? 'border-red-500/30 bg-red-500/[0.02]' : 'border-white/[0.08]'}
        `}>
            <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/[0.06] flex items-center justify-center">
                    <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                </div>
                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">{label}</span>
            </div>
            <p className="text-lg sm:text-xl lg:text-2xl font-bold text-white tracking-tight truncate">{value}</p>
            <p className="text-[10px] sm:text-xs text-gray-600 mt-0.5 sm:mt-1 truncate">{sub}</p>
        </div>
    );
}

function FilterBar({ filters, onFilterChange, showFilters, setShowFilters, activeCount }) {
    const [searchInput, setSearchInput] = useState(filters.search || '');

    const handleSearch = (e) => {
        if (e.key === 'Enter') onFilterChange({ search: searchInput });
    };

    const clearAll = () => {
        setSearchInput('');
        onFilterChange({ search: '', role: 'all', isBlocked: '' });
    };

    const roleOptions = [
        { value: 'all', label: 'All Roles' },
        { value: 'user', label: 'Customer' },
        { value: 'admin', label: 'Admin' }
        // developer intentionally excluded
    ];

    const statusOptions = [
        { value: '', label: 'All Status' },
        { value: 'false', label: 'Active' },
        { value: 'true', label: 'Blocked' }
    ];

    return (
        <div className="space-y-3 px-3 sm:px-4 md:px-6">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                        onBlur={() => onFilterChange({ search: searchInput })}
                        placeholder="Search users..."
                        className="w-full bg-white/[0.02] border border-white/[0.08] text-white text-sm placeholder-gray-600 pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] transition-colors"
                    />
                    {searchInput && (
                        <button
                            onClick={() => { setSearchInput(''); onFilterChange({ search: '' }); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>

                <div className="hidden sm:block relative">
                    <select
                        value={filters.role}
                        onChange={(e) => onFilterChange({ role: e.target.value })}
                        className="appearance-none bg-white/[0.02] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] cursor-pointer"
                    >
                        {roleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                <div className="hidden sm:block relative">
                    <select
                        value={filters.isBlocked}
                        onChange={(e) => onFilterChange({ isBlocked: e.target.value })}
                        className="appearance-none bg-white/[0.02] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2.5 rounded-xl focus:outline-none focus:border-white/[0.15] cursor-pointer"
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
                </div>

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`
                        sm:hidden flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all
                        ${showFilters
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

                {activeCount > 0 && (
                    <button
                        onClick={clearAll}
                        className="hidden sm:flex items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/[0.08] text-xs text-gray-400 hover:text-white hover:border-white/[0.15] transition-all"
                    >
                        <X className="w-3.5 h-3.5" />
                        Clear
                    </button>
                )}
            </div>

            {showFilters && (
                <div className="sm:hidden grid grid-cols-2 gap-2 p-3 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                    <div className="relative">
                        <select
                            value={filters.role}
                            onChange={(e) => onFilterChange({ role: e.target.value })}
                            className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2 rounded-lg focus:outline-none cursor-pointer"
                        >
                            {roleOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                    <div className="relative">
                        <select
                            value={filters.isBlocked}
                            onChange={(e) => onFilterChange({ isBlocked: e.target.value })}
                            className="w-full appearance-none bg-white/[0.04] border border-white/[0.08] text-white text-xs pl-3 pr-8 py-2 rounded-lg focus:outline-none cursor-pointer"
                        >
                            {statusOptions.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-black">{opt.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" />
                    </div>
                    {activeCount > 0 && (
                        <button
                            onClick={clearAll}
                            className="col-span-2 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                            Clear all filters
                        </button>
                    )}
                </div>
            )}

            {activeCount > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
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

function UsersList({ users, loading, total, pages, currentPage, onPageChange, onView, onBlock, onUnblock, onRoleChange }) {
    if (loading) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl">
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-[10px] sm:text-xs text-gray-600">Loading users...</p>
                </div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl p-6 sm:p-8">
                <div className="flex flex-col items-center justify-center py-8 sm:py-12">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/[0.04] flex items-center justify-center mb-3 sm:mb-4">
                        <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                    </div>
                    <p className="text-sm sm:text-base text-gray-400 mb-1">No users found</p>
                    <p className="text-[10px] sm:text-xs text-gray-600 text-center">Try adjusting your filters</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] border border-white/[0.08] rounded-xl sm:rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 sm:gap-2.5">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
                    </div>
                    <div>
                        <p className="text-xs sm:text-sm font-medium text-white">All Users</p>
                        <p className="text-[10px] sm:text-xs text-gray-600 hidden sm:block">{total} total</p>
                    </div>
                </div>
                <p className="text-[10px] sm:text-xs text-gray-500 font-mono">
                    Page {currentPage} of {pages}
                </p>
            </div>

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

            {pages > 1 && (
                <div className="flex items-center justify-between p-3 sm:p-4 border-t border-white/[0.06]">
                    <button
                        onClick={() => onPageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Previous</span>
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
                                    className={`
                                        w-7 h-7 sm:w-8 sm:h-8 text-[10px] sm:text-xs font-medium rounded-lg transition-all
                                        ${currentPage === page
                                            ? 'bg-white text-black'
                                            : 'text-gray-500 hover:text-white hover:bg-white/[0.04]'
                                        }
                                    `}
                                >
                                    {page}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => onPageChange(currentPage + 1)}
                        disabled={currentPage === pages}
                        className="flex items-center gap-1 text-[10px] sm:text-xs text-gray-500 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <span className="hidden sm:inline">Next</span>
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
}

function UserRow({ user, isFirst, onView, onBlock, onUnblock, onRoleChange }) {
    const joinedDate = user.createdAt ? new Date(user.createdAt) : null;

    return (
        <div
            className={`
                p-3 sm:p-4 transition-colors cursor-pointer
                hover:bg-white/[0.02] active:bg-white/[0.04]
                ${user.isBlocked ? 'opacity-60' : ''}
                ${isFirst ? 'bg-white/[0.01]' : ''}
            `}
            onClick={() => onView(user)}
        >
            <div className="flex items-start gap-3">
                <div className="relative shrink-0">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white/[0.06] overflow-hidden border border-white/[0.08] flex items-center justify-center">
                        {user.avatar && user.avatar !== 'default-avatar.jpg' ? (
                            <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-sm font-semibold text-white/40 uppercase">
                                {user.firstName?.[0]}{user.lastName?.[0]}
                            </span>
                        )}
                    </div>
                    <div className={`
                        absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black
                        ${user.isBlocked ? 'bg-red-500' : 'bg-emerald-500'}
                    `} />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-medium text-white truncate">
                                    {user.firstName} {user.lastName}
                                </p>
                                {isFirst && (
                                    <span className="text-[8px] px-1.5 py-0.5 rounded bg-white/[0.08] text-gray-400 font-medium shrink-0">
                                        LATEST
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-600 truncate mt-0.5">{user.email}</p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                            <span className={`
                                text-[9px] font-medium px-1.5 py-0.5 rounded capitalize
                                ${user.role === 'admin'
                                    ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                                    : 'bg-white/[0.06] text-gray-500 border border-white/[0.08]'
                                }
                            `}>
                                {user.role === 'user' ? 'Customer' : user.role}
                            </span>
                            <span className={`
                                text-[9px] font-medium px-1.5 py-0.5 rounded
                                ${user.isBlocked
                                    ? 'bg-red-500/15 text-red-400 border border-red-500/20'
                                    : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                                }
                            `}>
                                {user.isBlocked ? 'Blocked' : 'Active'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[10px] text-gray-600">
                            <Calendar className="w-3 h-3" />
                            {joinedDate ? format(joinedDate, 'MMM dd, yyyy') : '—'}
                        </span>
                        <span className="text-[8px] text-gray-700">•</span>
                        <span className="text-[10px] text-gray-600">{user.totalBookings || 0} bookings</span>
                    </div>

                    <div className="flex items-center gap-2 mt-3">
                        <button
                            onClick={(e) => { e.stopPropagation(); onView(user); }}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                        >
                            <Eye className="w-3 h-3" />
                            View
                        </button>
                        {user.isBlocked ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onUnblock(user._id); }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/20 transition-all"
                            >
                                <ShieldCheck className="w-3 h-3" />
                                Unblock
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onBlock(user); }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
                            >
                                <ShieldOff className="w-3 h-3" />
                                Block
                            </button>
                        )}
                        {user.role === 'user' ? (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRoleChange(user._id, 'admin'); }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 hover:border-purple-500/20 transition-all"
                            >
                                <ShieldAlert className="w-3 h-3" />
                                Admin
                            </button>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRoleChange(user._id, 'user'); }}
                                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                            >
                                <ShieldOff className="w-3 h-3" />
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}