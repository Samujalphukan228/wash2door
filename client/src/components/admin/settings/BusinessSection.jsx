'use client';

import { useState } from 'react';
import {
    Loader2, Store, MapPin, Clock,
    Phone, Mail, Globe, Save
} from 'lucide-react';
import toast from 'react-hot-toast';

const DEFAULT_SETTINGS = {
    businessName: 'Wash2Door',
    tagline: 'Professional Car Wash Service',
    phone: '',
    email: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    openTime: '08:00',
    closeTime: '18:00',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    maxBookingsPerSlot: 1,
    advanceBookingDays: 30,
    taxRate: 18
};

const ALL_DAYS = [
    'monday', 'tuesday', 'wednesday',
    'thursday', 'friday', 'saturday', 'sunday'
];

export default function BusinessSection() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('businessSettings');
            if (saved) {
                try { return JSON.parse(saved); } catch {}
            }
        }
        return DEFAULT_SETTINGS;
    });

    const update = (field, value) => {
        setSettings(prev => ({ ...prev, [field]: value }));
    };

    const toggleDay = (day) => {
        setSettings(prev => ({
            ...prev,
            workingDays: prev.workingDays.includes(day)
                ? prev.workingDays.filter(d => d !== day)
                : [...prev.workingDays, day]
        }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            localStorage.setItem('businessSettings', JSON.stringify(settings));
            toast.success('Settings saved');
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setSettings(DEFAULT_SETTINGS);
        localStorage.removeItem('businessSettings');
        toast.success('Settings reset to default');
    };

    return (
        <div className="space-y-8">

            {/* ── Business Info ── */}
            <div className="bg-neutral-950 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Store className="w-4 h-4 text-neutral-600" />
                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
                        Business Information
                    </p>
                </div>

                <div className="space-y-5">
                    <BizInput
                        icon={Store}
                        label="Business Name"
                        value={settings.businessName}
                        onChange={(v) => update('businessName', v)}
                        placeholder="Your business name"
                    />
                    <BizInput
                        label="Tagline"
                        value={settings.tagline}
                        onChange={(v) => update('tagline', v)}
                        placeholder="Short tagline..."
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <BizInput
                            icon={Phone}
                            label="Phone"
                            value={settings.phone}
                            onChange={(v) => update('phone', v)}
                            placeholder="+91 XXXXX XXXXX"
                        />
                        <BizInput
                            icon={Mail}
                            label="Email"
                            value={settings.email}
                            onChange={(v) => update('email', v)}
                            placeholder="contact@business.com"
                        />
                    </div>
                    <BizInput
                        icon={Globe}
                        label="Website"
                        value={settings.website}
                        onChange={(v) => update('website', v)}
                        placeholder="https://www.example.com"
                    />
                </div>
            </div>

            {/* ── Location ── */}
            <div className="bg-neutral-950 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-4 h-4 text-neutral-600" />
                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
                        Location
                    </p>
                </div>

                <div className="space-y-5">
                    <BizInput
                        label="Address"
                        value={settings.address}
                        onChange={(v) => update('address', v)}
                        placeholder="Street address"
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <BizInput
                            label="City"
                            value={settings.city}
                            onChange={(v) => update('city', v)}
                            placeholder="City"
                        />
                        <BizInput
                            label="State"
                            value={settings.state}
                            onChange={(v) => update('state', v)}
                            placeholder="State"
                        />
                        <BizInput
                            label="ZIP Code"
                            value={settings.zipCode}
                            onChange={(v) => update('zipCode', v)}
                            placeholder="ZIP"
                        />
                    </div>
                </div>
            </div>

            {/* ── Working Hours ── */}
            <div className="bg-neutral-950 border border-neutral-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Clock className="w-4 h-4 text-neutral-600" />
                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
                        Working Hours
                    </p>
                </div>

                <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                                Opening Time
                            </label>
                            <input
                                type="time"
                                value={settings.openTime}
                                onChange={(e) => update('openTime', e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                                Closing Time
                            </label>
                            <input
                                type="time"
                                value={settings.closeTime}
                                onChange={(e) => update('closeTime', e.target.value)}
                                className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs text-neutral-500 mb-3 uppercase tracking-widest">
                            Working Days
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {ALL_DAYS.map(day => (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`px-3 py-2 text-xs capitalize border transition-colors ${
                                        settings.workingDays.includes(day)
                                            ? 'border-white bg-white text-black'
                                            : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
                                    }`}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Booking Settings ── */}
            <div className="bg-neutral-950 border border-neutral-800 p-6">
                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-6">
                    Booking Settings
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <BizInput
                        label="Max Bookings / Slot"
                        value={settings.maxBookingsPerSlot}
                        onChange={(v) => update('maxBookingsPerSlot', Number(v))}
                        type="number"
                        placeholder="1"
                    />
                    <BizInput
                        label="Advance Booking (days)"
                        value={settings.advanceBookingDays}
                        onChange={(v) => update('advanceBookingDays', Number(v))}
                        type="number"
                        placeholder="30"
                    />
                    <BizInput
                        label="Tax Rate (%)"
                        value={settings.taxRate}
                        onChange={(v) => update('taxRate', Number(v))}
                        type="number"
                        placeholder="18"
                    />
                </div>
            </div>

            {/* ── Save / Reset ── */}
            <div className="flex items-center gap-3">
                <button
                    onClick={handleReset}
                    className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                >
                    Reset to Default
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-3.5 h-3.5" />
                            Save Settings
                        </>
                    )}
                </button>
            </div>

            {/* ── Note ── */}
            <div className="border border-neutral-800 p-4">
                <p className="text-xs text-neutral-600 leading-relaxed">
                    Note: Business settings are saved locally. When a backend settings API is added, these will sync automatically.
                </p>
            </div>
        </div>
    );
}

function BizInput({ icon: Icon, label, value, onChange, placeholder, type = 'text' }) {
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
                    className={`w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm ${
                        Icon ? 'pl-10' : 'pl-3'
                    } pr-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors`}
                />
            </div>
        </div>
    );
}