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
            <div className="bg-neutral-950 border border-neutral-800">
                <div className="p-6 space-y-4">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 animate-pulse" />
                            <div className="h-4 w-32 bg-neutral-800 animate-pulse rounded" />
                            <div className="h-4 w-40 bg-neutral-800 animate-pulse rounded" />
                            <div className="h-4 w-20 bg-neutral-800 animate-pulse rounded ml-auto" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!users || users.length === 0) {
        return (
            <div className="bg-neutral-950 border border-neutral-800">
                <div className="px-6 py-16 text-center">
                    <p className="text-neutral-500 text-sm">No users found</p>
                    <p className="text-neutral-700 text-xs mt-1">
                        Try adjusting your filters
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-neutral-950 border border-neutral-800">

            {/* Header */}
            <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between">
                <p className="text-xs font-medium text-white tracking-[0.15em] uppercase">
                    All Users
                </p>
                <p className="text-xs text-neutral-500">
                    {total} total
                </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-neutral-800">
                            {['User', 'Email', 'Role', 'Status', 'Bookings', 'Joined', 'Actions'].map((h) => (
                                <th
                                    key={h}
                                    className="px-4 py-3 text-left text-xs text-neutral-500 tracking-[0.15em] uppercase font-normal whitespace-nowrap"
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
                                className={`border-b border-neutral-800/50 hover:bg-neutral-900 transition-colors ${
                                    user.isBlocked ? 'opacity-60' : ''
                                }`}
                            >
                                {/* User */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative w-8 h-8 rounded-full bg-neutral-800 overflow-hidden shrink-0">
                                            {user.avatar && user.avatar !== 'default-avatar.jpg' ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.firstName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs text-neutral-500 uppercase">
                                                    {user.firstName?.[0]}{user.lastName?.[0]}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm text-white whitespace-nowrap">
                                                {user.firstName} {user.lastName}
                                            </p>
                                        </div>
                                    </div>
                                </td>

                                {/* Email */}
                                <td className="px-4 py-4">
                                    <p className="text-sm text-neutral-400 whitespace-nowrap">
                                        {user.email}
                                    </p>
                                </td>

                                {/* Role */}
                                <td className="px-4 py-4">
                                    <span className={`text-xs border px-2 py-0.5 capitalize ${
                                        user.role === 'admin'
                                            ? 'border-neutral-400 text-white'
                                            : 'border-neutral-700 text-neutral-400'
                                    }`}>
                                        {user.role === 'user' ? 'Customer' : user.role}
                                    </span>
                                </td>

                                {/* Status */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${
                                            user.isBlocked
                                                ? 'bg-neutral-600'
                                                : 'bg-white'
                                        }`} />
                                        <span className={`text-xs ${
                                            user.isBlocked
                                                ? 'text-neutral-600'
                                                : 'text-neutral-300'
                                        }`}>
                                            {user.isBlocked ? 'Blocked' : 'Active'}
                                        </span>
                                    </div>
                                </td>

                                {/* Bookings */}
                                <td className="px-4 py-4">
                                    <p className="text-sm text-neutral-400">
                                        {user.totalBookings || 0}
                                    </p>
                                </td>

                                {/* Joined */}
                                <td className="px-4 py-4">
                                    <p className="text-xs text-neutral-500 whitespace-nowrap">
                                        {format(new Date(user.createdAt), 'dd MMM yyyy')}
                                    </p>
                                </td>

                                {/* Actions */}
                                <td className="px-4 py-4">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => onView(user)}
                                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                                            title="View details"
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                        </button>

                                        {user.isBlocked ? (
                                            <button
                                                onClick={() => onUnblock(user._id)}
                                                className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                                                title="Unblock user"
                                            >
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onBlock(user)}
                                                className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                                                title="Block user"
                                            >
                                                <ShieldOff className="w-3.5 h-3.5" />
                                            </button>
                                        )}

                                        {user.role === 'user' ? (
                                            <button
                                                onClick={() => onRoleChange(user._id, 'admin')}
                                                className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                                                title="Make admin"
                                            >
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => onRoleChange(user._id, 'user')}
                                                className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:text-white hover:bg-neutral-800 transition-colors"
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
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between">
                    <p className="text-xs text-neutral-500">
                        Page {currentPage} of {pages}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="w-8 h-8 flex items-center justify-center border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {[...Array(Math.min(pages, 5))].map((_, i) => {
                            const page = i + 1;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    className={`w-8 h-8 text-xs border transition-colors ${
                                        currentPage === page
                                            ? 'border-white bg-white text-black'
                                            : 'border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600'
                                    }`}
                                >
                                    {page}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === pages}
                            className="w-8 h-8 flex items-center justify-center border border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}