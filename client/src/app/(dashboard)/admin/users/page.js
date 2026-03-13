'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import UsersTable from '@/components/admin/users/UsersTable';
import UsersFilter from '@/components/admin/users/UsersFilter';
import UserDetailModal from '@/components/admin/users/UserDetailModal';
import BlockUserModal from '@/components/admin/users/BlockUserModal';
import adminService from '@/services/adminService';
import { Users } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);

    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: '',
        role: '',
        isBlocked: ''
    });

    const [selectedUser, setSelectedUser] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showBlockModal, setShowBlockModal] = useState(false);

    // ── Fetch Users ──
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const params = Object.fromEntries(
                Object.entries(filters).filter(([_, v]) => v !== '')
            );
            const response = await adminService.getAllUsers(params);
            
            if (response.success) {
                // ✅ FIXED: Handle backend response structure
                setUsers(response.data?.users || response.data || []);
                setTotal(response.data?.total || response.total || 0);
                setPages(response.data?.pages || response.pages || 1);
            }
        } catch (error) {
            toast.error('Failed to fetch users');
            console.error('Fetch users error:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ── Handlers ──
    const handleFilterChange = (newFilters) => {
        setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
    };

    const handlePageChange = (page) => {
        setFilters(prev => ({ ...prev, page }));
    };

    const handleView = async (user) => {
        try {
            const response = await adminService.getUserById(user._id);
            if (response.success) {
                // Backend returns { user, stats, recentBookings, reviews, favoriteServices }
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
            toast.success('User blocked successfully');
            setShowBlockModal(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to block user');
            throw error;
        }
    };

    const handleUnblock = async (userId) => {
        try {
            await adminService.unblockUser(userId);
            toast.success('User unblocked successfully');
            
            // Close modal if open
            if (showDetailModal) {
                setShowDetailModal(false);
                setSelectedUser(null);
            }
            
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to unblock user');
        }
    };

    const handleRoleChange = async (userId, role) => {
        const roleLabel = role === 'user' ? 'Customer' : 'Admin';
        
        if (!confirm(`Change this user's role to ${roleLabel}?`)) return;
        
        try {
            await adminService.changeUserRole(userId, role);
            toast.success(`Role changed to ${roleLabel}`);
            
            // Close modal if open
            if (showDetailModal) {
                setShowDetailModal(false);
                setSelectedUser(null);
            }
            
            fetchUsers();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to change role');
        }
    };

    // ✅ FIXED: Stats calculation using 'user' role
    const stats = {
        total,
        customers: users.filter(u => u.role === 'user').length,
        admins: users.filter(u => u.role === 'admin').length,
        blocked: users.filter(u => u.isBlocked).length
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* ── Page Header ── */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-[0.2em] uppercase mb-1">
                            Management
                        </p>
                        <h1 className="text-xl sm:text-2xl font-light text-white">
                            Users
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                        <Users className="w-4 h-4" />
                        <span className="text-xs tracking-widest uppercase">
                            {total} total users
                        </span>
                    </div>
                </div>

                {/* ── Stats Bar ── */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'Total Users', value: stats.total },
                        { label: 'Customers', value: stats.customers },
                        { label: 'Admins', value: stats.admins },
                        { label: 'Blocked', value: stats.blocked }
                    ].map((stat) => (
                        <div
                            key={stat.label}
                            className="bg-neutral-950 border border-neutral-800 p-4"
                        >
                            <p className="text-xs text-neutral-500 uppercase tracking-widest mb-1">
                                {stat.label}
                            </p>
                            <p className="text-2xl font-light text-white">
                                {loading ? (
                                    <span className="inline-block h-7 w-8 bg-neutral-800 animate-pulse rounded" />
                                ) : (
                                    stat.value
                                )}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ── Filters ── */}
                <UsersFilter
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {/* ── Table ── */}
                <UsersTable
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

            {/* ── Modals ── */}
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
                        // Extract userId - handle both user object and nested structure
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