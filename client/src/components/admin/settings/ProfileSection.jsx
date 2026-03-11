'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, User, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import Image from 'next/image';
import toast from 'react-hot-toast';

export default function ProfileSection() {
    const { user, refreshUser, updateUser } = useAuth();
    const fileInputRef = useRef(null);

    const [loading, setLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');

    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    // ── Update Profile ──
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!firstName.trim() || !lastName.trim()) {
            toast.error('Name fields are required');
            return;
        }

        try {
            setLoading(true);

            const response = await axiosInstance.put('/auth/update-profile', {
                firstName: firstName.trim(),
                lastName: lastName.trim()
            });

            if (response.data.success) {
                // Instant UI update
                updateUser({
                    firstName: firstName.trim(),
                    lastName: lastName.trim()
                });

                toast.success('Profile updated');

                // Also refresh from backend to be sure
                await refreshUser();
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to update profile'
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Upload Avatar ──
    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error('Image must be less than 2MB');
            return;
        }

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
            toast.error('Only JPG, PNG, WEBP allowed');
            return;
        }

        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);

        try {
            setAvatarLoading(true);

            const formData = new FormData();
            formData.append('avatar', file);

            const response = await axiosInstance.put('/auth/update-avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.success) {
                // Update avatar in context
                const newAvatar = response.data.data?.avatar;
                if (newAvatar) {
                    updateUser({ avatar: newAvatar });
                }

                toast.success('Avatar updated');

                // Refresh to get latest data
                await refreshUser();
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to upload avatar'
            );
            setAvatarPreview(null);
        } finally {
            setAvatarLoading(false);
        }
    };

    // Resolve avatar URL - handles string or object
    const getAvatarUrl = () => {
        if (avatarPreview) return avatarPreview;
        if (!user?.avatar) return null;

        // If avatar is an object with url
        if (typeof user.avatar === 'object' && user.avatar?.url) {
            return user.avatar.url;
        }

        // If avatar is a string (cloudinary URL)
        if (typeof user.avatar === 'string') {
            if (user.avatar === 'default-avatar.png') return null;
            if (user.avatar.startsWith('http')) return user.avatar;
        }

        return null;
    };

    const avatarUrl = getAvatarUrl();

    return (
        <div className="space-y-8">

            {/* ── Avatar ── */}
            <div className="bg-neutral-950 border border-neutral-800 p-6">
                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-4">
                    Profile Photo
                </p>
                <div className="flex items-center gap-6">
                    <div className="relative w-20 h-20 rounded-full bg-neutral-800 overflow-hidden shrink-0">
                        {avatarUrl ? (
                            <Image
                                src={avatarUrl}
                                alt="Avatar"
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl text-neutral-500 uppercase">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                        )}

                        {avatarLoading && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <Loader2 className="w-5 h-5 text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarLoading}
                            className="flex items-center gap-2 border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-2.5 transition-colors disabled:opacity-50"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            Change Photo
                        </button>
                        <p className="text-xs text-neutral-600 mt-2">
                            JPG, PNG, WEBP · Max 2MB
                        </p>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handleAvatarChange}
                            className="hidden"
                        />
                    </div>
                </div>
            </div>

            {/* ── Profile Form ── */}
            <form onSubmit={handleSubmit} className="bg-neutral-950 border border-neutral-800 p-6">
                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-6">
                    Personal Information
                </p>

                <div className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <SettingsInput
                            icon={User}
                            label="First Name *"
                            value={firstName}
                            onChange={setFirstName}
                            placeholder="First name"
                        />
                        <SettingsInput
                            icon={User}
                            label="Last Name *"
                            value={lastName}
                            onChange={setLastName}
                            placeholder="Last name"
                        />
                    </div>

                    <SettingsInput
                        icon={Mail}
                        label="Email"
                        value={email}
                        onChange={() => {}}
                        placeholder="Email"
                        disabled
                        note="Email cannot be changed"
                    />
                </div>

                <div className="flex items-center gap-3 mt-6 pt-6 border-t border-neutral-800">
                    <button
                        type="button"
                        onClick={() => {
                            setFirstName(user?.firstName || '');
                            setLastName(user?.lastName || '');
                        }}
                        className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !firstName.trim() || !lastName.trim()}
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </form>

            {/* ── Account Info ── */}
            <div className="bg-neutral-950 border border-neutral-800 p-6">
                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-4">
                    Account Information
                </p>
                <div className="space-y-3">
                    <InfoRow label="Role" value={user?.role || '—'} />
                    <InfoRow
                        label="Status"
                        value={
                            user?.isBlocked
                                ? 'Blocked'
                                : user?.isActive !== false
                                ? 'Active'
                                : 'Inactive'
                        }
                    />
                    <InfoRow
                        label="Email Verified"
                        value={user?.isEmailVerified ? 'Yes' : 'No'}
                    />
                    <InfoRow
                        label="Member Since"
                        value={formatDate(user?.createdAt)}
                    />
                    <InfoRow
                        label="Last Login"
                        value={formatDate(user?.lastLogin, true)}
                    />
                </div>
            </div>
        </div>
    );
}

function formatDate(date, withTime = false) {
    try {
        if (!date) return '—';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '—';

        const options = {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        };

        if (withTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }

        return d.toLocaleDateString('en-IN', options);
    } catch {
        return '—';
    }
}

function SettingsInput({ icon: Icon, label, value, onChange, placeholder, type = 'text', disabled, note }) {
    return (
        <div>
            <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm ${
                        Icon ? 'pl-10' : 'pl-3'
                    } pr-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors ${
                        disabled ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                />
            </div>
            {note && (
                <p className="text-xs text-neutral-700 mt-1">{note}</p>
            )}
        </div>
    );
}

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-600">{label}</p>
            <p className="text-sm text-neutral-300 capitalize">{value}</p>
        </div>
    );
}