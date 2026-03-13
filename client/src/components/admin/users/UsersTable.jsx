'use client';

import { format } from 'date-fns';
import {
    Eye, ShieldCheck, ShieldOff, ShieldAlert,
    ChevronLeft, ChevronRight
} from 'lucide-react';

export default function UsersTable({
    users,
    loading,
    total,
    pages,
    currentPage,
    onPageChange,
    onView,
    onBlock,
    onUnblock,
    onRoleChange
}) {
    if (loading) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">
                <div className="p-5 space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-white/[0.06] animate-pulse" />
                            <div className="h-4 w-32 bg-white/[0.06] animate-pulse rounded-md" />
                            <div className="h-4 w-40 bg-white/[0.04] animate-pulse rounded-md" />
                            <div className="h-4 w-20 bg-white/[0.03] animate-pulse rounded-md ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl">
                <div className="px-6 py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/[0.04] flex items-center justify-center mx-auto mb-4">
                        <span className="text-xl">👥</span>
                    </div>
                    <p className="text-white/40 text-sm">No users found</p>
                    <p className="text-white/20 text-xs mt-1">
                        Try adjusting your filters
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <p className="text-[10px] text-white/25 uppercase tracking-widest font-medium">
                    All Users
                </p>
                <p className="text-[11px] text-white/20">
                    {total} total
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/[0.05]">
                            {['User', 'Email', 'Role', 'Status', 'Bookings', 'Joined', 'Actions'].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-[10px] text-white/20 tracking-widest uppercase font-medium whitespace-nowrap"
                                >
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr
                                key={user._id}
                                className={`
                                    border-b border-white/[0.03] hover:bg-white/[0.03]
                                    transition-all duration-150
                                    ${user.isBlocked ? 'opacity-50' : ''}
                                `}
                            >
                                {/* User */}
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8 rounded-full bg-white/[0.06] overflow-hidden shrink-0 border border-white/[0.08]">
                                            {user.avatar && user.avatar !== 'default-avatar.jpg' ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.firstName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 uppercase font-medium">
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-sm text-white/80 whitespace-nowrap font-medium">
                                            {user.firstName} {user.lastName}
                                        </p>
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="px-4 py-3.5">
                                    <p className="text-sm text-white/40 whitespace-nowrap">
                                        {user.email}
                                    </p>
                                </td>

                                {/* Role */}
                                <td className="px-4 py-3.5">
                                    <span className={`
                                        text-[11px] border px-2.5 py-1 rounded-md capitalize font-medium
                                        ${user.role === 'admin'
                                            ? 'border-white/25 text-white/80 bg-white/[0.05]'
                                            : 'border-white/[0.08] text-white/35 bg-white/[0.02]'
                                        }
                                    `}>
                                        {user.role === 'user' ? 'Customer' : user.role}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            user.isBlocked ? 'bg-white/20' : 'bg-white/70'
                                        }`} />
                                        <span className={`text-[11px] ${
                                            user.isBlocked ? 'text-white/25' : 'text-white/50'
                                        }`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </div>
                                </td>

                                {/* Bookings */}
                                <td className="px-4 py-3.5">
                                    <p className="text-sm text-white/40">
                                        {user.totalBookings || 0}
                                    </p>
                                </td>

                                {/* Joined */}
                                <td className="px-4 py-3.5">
                                    <p className="text-[11px] text-white/25 whitespace-nowrap">
                                        {format(new Date(user.createdAt), 'dd MMM yyyy')}
                                    </p>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-3.5">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onView(user)}
                                            className="
                                                w-7 h-7 rounded-md flex items-center justify-center
                                                text-white/25 hover:text-white/70 hover:bg-white/[0.06]
                                                transition-all duration-150
                                            "
                                            title="View details"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>

                                        {user.isBlocked ? (
                                            <button
                                                onClick={() => onUnblock(user._id)}
                                                className="
                                                    w-7 h-7 rounded-md flex items-center justify-center
                                                    text-white/25 hover:text-white/70 hover:bg-white/[0.06]
                                                    transition-all duration-150
                                                "
                                                title="Unblock user"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onBlock(user)}
                                                className="
                                                    w-7 h-7 rounded-md flex items-center justify-center
                                                    text-white/25 hover:text-white/70 hover:bg-white/[0.06]
                                                    transition-all duration-150
                                                "
                                                title="Block user"
                                            >
                                                <ShieldOff className="w-3.5 h-3.5" />
                                            </button>
                                        )}

                                        {user.role === 'user' ? (
                                            <button
                                                onClick={() => onRoleChange(user._id, 'admin')}
                                                className="
                                                    w-7 h-7 rounded-md flex items-center justify-center
                                                    text-white/25 hover:text-white/70 hover:bg-white/[0.06]
                                                    transition-all duration-150
                                                "
                                                title="Make admin"
                                            >
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onRoleChange(user._id, 'user')}
                                                className="
                                                    w-7 h-7 rounded-md flex items-center justify-center
                                                    text-white/15 hover:text-white/70 hover:bg-white/[0.06]
                                                    transition-all duration-150
                                                "
                                                title="Remove admin"
                                            >
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pages > 1 && (
                <div className="px-5 py-4 border-t border-white/[0.05] flex items-center justify-between">
                    <p className="text-[11px] text-white/25">
                        Page {currentPage} of {pages}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="
                                w-8 h-8 rounded-lg flex items-center justify-center
                                border border-white/[0.08] bg-white/[0.03]
                                text-white/30 hover:text-white/70 hover:border-white/[0.14]
                                disabled:opacity-20 disabled:cursor-not-allowed
                                transition-all duration-150
                            "
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(pages, 5))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`
                                        w-8 h-8 rounded-lg text-xs font-medium transition-all duration-150
                                        ${currentPage === page
                                            ? 'bg-white text-black shadow-lg shadow-white/10'
                                            : 'border border-white/[0.08] bg-white/[0.03] text-white/30 hover:text-white/70 hover:border-white/[0.14]'
                                        }
                                    `}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pages}
                            className="
                                w-8 h-8 rounded-lg flex items-center justify-center
                                border border-white/[0.08] bg-white/[0.03]
                                text-white/30 hover:text-white/70 hover:border-white/[0.14]
                                disabled:opacity-20 disabled:cursor-not-allowed
                                transition-all duration-150
                            "
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}