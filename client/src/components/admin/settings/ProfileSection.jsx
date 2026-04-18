'use client';

import { useState, useEffect, useRef } from 'react';
import { Loader2, Upload, User, Mail } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import axiosInstance from '@/lib/axios';
import Image from 'next/image';
import toast from 'react-hot-toast';

// ============================================
// HELPERS
// ============================================

function formatDate(date, withTime = false) {
    try {
        if (!date) return '—';
        const d = new Date(date);
        if (isNaN(d.getTime())) return '—';
        return d.toLocaleDateString('en-IN', {
            day: '2-digit', month: 'long', year: 'numeric',
            ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
        });
    } catch {
        return '—';
    }
}

function getAvatarUrl(user, preview) {
    if (preview) return preview;
    if (!user?.avatar) return null;
    if (typeof user.avatar === 'object' && user.avatar?.url) return user.avatar.url;
    if (typeof user.avatar === 'string') {
        if (user.avatar === 'default-avatar.png') return null;
        if (user.avatar.startsWith('http')) return user.avatar;
    }
    return null;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ProfileSection() {
    const { user, refreshUser, updateUser } = useAuth();
    const fileInputRef = useRef(null);

    const [loading, setLoading]           = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [firstName, setFirstName]       = useState('');
    const [lastName, setLastName]         = useState('');
    const [email, setEmail]               = useState('');
    const [avatarPreview, setAvatarPreview] = useState(null);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setEmail(user.email || '');
        }
    }, [user]);

    const avatarUrl = getAvatarUrl(user, avatarPreview);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!firstName.trim() || !lastName.trim()) {
            toast.error('Name fields are required');
            return;
        }
        try {
            setLoading(true);
            const res = await axiosInstance.put('/auth/update-profile', {
                firstName: firstName.trim(),
                lastName: lastName.trim(),
            });
            if (res.data.success) {
                updateUser({ firstName: firstName.trim(), lastName: lastName.trim() });
                toast.success('Profile updated');
                await refreshUser();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast.error('Image must be less than 2MB'); return; }
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { toast.error('Only JPG, PNG, WEBP allowed'); return; }

        const reader = new FileReader();
        reader.onload = (ev) => setAvatarPreview(ev.target.result);
        reader.readAsDataURL(file);

        try {
            setAvatarLoading(true);
            const fd = new FormData();
            fd.append('avatar', file);
            const res = await axiosInstance.put('/auth/update-avatar', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data.success) {
                if (res.data.data?.avatar) updateUser({ avatar: res.data.data.avatar });
                toast.success('Avatar updated');
                await refreshUser();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to upload avatar');
            setAvatarPreview(null);
        } finally {
            setAvatarLoading(false);
        }
    };

    return (
        <div className="space-y-3">

            {/* Avatar */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <label className="text-[10px] text-white/40 font-medium mb-3 block uppercase tracking-wide">
                    Profile Photo
                </label>
                <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="relative w-16 h-16 rounded-xl bg-white/[0.06] overflow-hidden shrink-0 border border-white/[0.08]">
                        {avatarUrl ? (
                            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-lg text-white/30 font-semibold uppercase">
                                {user?.firstName?.[0]}{user?.lastName?.[0]}
                            </div>
                        )}
                        {avatarLoading && (
                            <div className="absolute inset-0 bg-black/70 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-white animate-spin" />
                            </div>
                        )}
                    </div>

                    <div>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={avatarLoading}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-dashed border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] text-xs text-white/40 hover:text-white/60 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <Upload className="w-3.5 h-3.5" />
                            Change Photo
                        </button>
                        <p className="text-[10px] text-white/20 mt-1.5">JPG, PNG, WEBP · Max 2MB</p>
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

            {/* Profile Form */}
            <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-4">
                <label className="text-[10px] text-white/40 font-medium block uppercase tracking-wide">
                    Personal Information
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <SettingsInput icon={User} label="First Name *" value={firstName} onChange={setFirstName} placeholder="First name" />
                    <SettingsInput icon={User} label="Last Name *" value={lastName} onChange={setLastName} placeholder="Last name" />
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

                <div className="flex gap-2 pt-2 border-t border-white/[0.06]">
                    <button
                        type="button"
                        onClick={() => { setFirstName(user?.firstName || ''); setLastName(user?.lastName || ''); }}
                        className="px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                    >
                        Reset
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !firstName.trim() || !lastName.trim()}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                    >
                        {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : 'Save Changes'}
                    </button>
                </div>
            </form>

            {/* Account Info */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
                <label className="text-[10px] text-white/40 font-medium mb-3 block uppercase tracking-wide">
                    Account Information
                </label>
                <div className="space-y-2">
                    <InfoRow label="Role"           value={user?.role || '—'} />
                    <InfoRow label="Status"         value={user?.isBlocked ? 'Blocked' : user?.isActive !== false ? 'Active' : 'Inactive'} />
                    <InfoRow label="Email Verified" value={user?.isEmailVerified ? 'Yes' : 'No'} />
                    <InfoRow label="Member Since"   value={formatDate(user?.createdAt)} />
                    <InfoRow label="Last Login"     value={formatDate(user?.lastLogin, true)} />
                </div>
            </div>
        </div>
    );
}

// ============================================
// SETTINGS INPUT
// ============================================

function SettingsInput({ icon: Icon, label, value, onChange, placeholder, type = 'text', disabled, note }) {
    return (
        <div>
            <label className="text-[10px] text-white/40 font-medium mb-1.5 block uppercase tracking-wide">
                {label}
            </label>
            <div className="relative">
                {Icon && (
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
                )}
                <input
                    type={type}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    disabled={disabled}
                    className={`w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors ${
                        Icon ? 'pl-9' : ''
                    } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                />
            </div>
            {note && <p className="text-[10px] text-white/20 mt-1">{note}</p>}
        </div>
    );
}

// ============================================
// INFO ROW
// ============================================

function InfoRow({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-white/30 shrink-0">{label}</span>
            <span className="text-[11px] text-white/60 text-right capitalize truncate">{value}</span>
        </div>
    );
}