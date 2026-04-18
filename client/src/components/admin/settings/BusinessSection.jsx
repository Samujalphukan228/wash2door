'use client';

import { useState } from 'react';
import { Loader2, Store, MapPin, Clock, Phone, Mail, Globe, Save } from 'lucide-react';
import toast from 'react-hot-toast';

// ============================================
// CONSTANTS
// ============================================

const DEFAULT_SETTINGS = {
    businessName: 'Wash2Door',
    tagline: 'Professional Car Wash Service',
    phone: '', email: '', website: '',
    address: '', city: '', state: '', zipCode: '',
    openTime: '08:00', closeTime: '18:00',
    workingDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    maxBookingsPerSlot: 1, advanceBookingDays: 30, taxRate: 18,
};

const ALL_DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// ============================================
// MAIN COMPONENT
// ============================================

export default function BusinessSection() {
    const [loading, setLoading] = useState(false);
    const [settings, setSettings] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('businessSettings');
            if (saved) try { return JSON.parse(saved); } catch {}
        }
        return DEFAULT_SETTINGS;
    });

    const update   = (field, value) => setSettings((prev) => ({ ...prev, [field]: value }));
    const toggleDay = (day) => setSettings((prev) => ({
        ...prev,
        workingDays: prev.workingDays.includes(day)
            ? prev.workingDays.filter((d) => d !== day)
            : [...prev.workingDays, day],
    }));

    const handleSave = async () => {
        try {
            setLoading(true);
            localStorage.setItem('businessSettings', JSON.stringify(settings));
            toast.success('Settings saved');
        } catch {
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
        <div className="space-y-3">

            {/* Business Info */}
            <SectionCard icon={Store} title="Business Information">
                <BizInput icon={Store} label="Business Name" value={settings.businessName} onChange={(v) => update('businessName', v)} placeholder="Your business name" />
                <BizInput label="Tagline" value={settings.tagline} onChange={(v) => update('tagline', v)} placeholder="Short tagline..." />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <BizInput icon={Phone} label="Phone" value={settings.phone} onChange={(v) => update('phone', v)} placeholder="+91 XXXXX XXXXX" />
                    <BizInput icon={Mail}  label="Email" value={settings.email} onChange={(v) => update('email', v)} placeholder="contact@business.com" />
                </div>
                <BizInput icon={Globe} label="Website" value={settings.website} onChange={(v) => update('website', v)} placeholder="https://www.example.com" />
            </SectionCard>

            {/* Location */}
            <SectionCard icon={MapPin} title="Location">
                <BizInput label="Address" value={settings.address} onChange={(v) => update('address', v)} placeholder="Street address" />
                <div className="grid grid-cols-3 gap-2">
                    <BizInput label="City"     value={settings.city}    onChange={(v) => update('city', v)}    placeholder="City" />
                    <BizInput label="State"    value={settings.state}   onChange={(v) => update('state', v)}   placeholder="State" />
                    <BizInput label="ZIP Code" value={settings.zipCode} onChange={(v) => update('zipCode', v)} placeholder="ZIP" />
                </div>
            </SectionCard>

            {/* Working Hours */}
            <SectionCard icon={Clock} title="Working Hours">
                <div className="grid grid-cols-2 gap-2">
                    <TimeInput label="Opening Time" value={settings.openTime}  onChange={(v) => update('openTime', v)} />
                    <TimeInput label="Closing Time" value={settings.closeTime} onChange={(v) => update('closeTime', v)} />
                </div>

                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                        Working Days
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                        {ALL_DAYS.map((day) => {
                            const active = settings.workingDays.includes(day);
                            return (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`px-2.5 py-1.5 text-[10px] font-medium capitalize rounded-lg border transition-all active:scale-95 ${
                                        active
                                            ? 'border-white bg-white text-black'
                                            : 'border-white/[0.06] bg-white/[0.02] text-white/30 hover:text-white/60 hover:border-white/[0.12]'
                                    }`}
                                >
                                    {day.slice(0, 3)}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </SectionCard>

            {/* Booking Settings */}
            <SectionCard title="Booking Settings">
                <div className="grid grid-cols-3 gap-2">
                    <BizInput label="Max / Slot"      value={settings.maxBookingsPerSlot}  onChange={(v) => update('maxBookingsPerSlot', Number(v))}  type="number" placeholder="1" />
                    <BizInput label="Advance (days)"  value={settings.advanceBookingDays}  onChange={(v) => update('advanceBookingDays', Number(v))}  type="number" placeholder="30" />
                    <BizInput label="Tax Rate (%)"    value={settings.taxRate}              onChange={(v) => update('taxRate', Number(v))}             type="number" placeholder="18" />
                </div>
            </SectionCard>

            {/* Save / Reset */}
            <div className="flex gap-2">
                <button
                    onClick={handleReset}
                    className="px-3 py-2 rounded-lg border border-white/[0.06] bg-white/[0.02] text-xs text-white/40 hover:text-white/60 hover:bg-white/[0.04] transition-all"
                >
                    Reset
                </button>
                <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
                >
                    {loading ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</>
                    ) : (
                        <><Save className="w-3.5 h-3.5" /> Save Settings</>
                    )}
                </button>
            </div>

            {/* Note */}
            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <p className="text-[10px] text-white/20 leading-relaxed">
                    Business settings are saved locally. When a backend settings API is added, these will sync automatically.
                </p>
            </div>
        </div>
    );
}

// ============================================
// SECTION CARD
// ============================================

function SectionCard({ icon: Icon, title, children }) {
    return (
        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2">
                {Icon && <Icon className="w-3.5 h-3.5 text-white/25" />}
                <label className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                    {title}
                </label>
            </div>
            {children}
        </div>
    );
}

// ============================================
// BIZ INPUT
// ============================================

function BizInput({ icon: Icon, label, value, onChange, placeholder, type = 'text' }) {
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
                    className={`w-full py-2.5 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/25 focus:outline-none focus:border-white/20 transition-colors ${
                        Icon ? 'pl-9' : ''
                    }`}
                />
            </div>
        </div>
    );
}

// ============================================
// TIME INPUT
// ============================================

function TimeInput({ label, value, onChange }) {
    return (
        <div>
            <label className="text-[10px] text-white/40 font-medium mb-1.5 block uppercase tracking-wide">
                {label}
            </label>
            <input
                type="time"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full py-2.5 px-3 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white focus:outline-none focus:border-white/20 transition-colors [color-scheme:dark]"
            />
        </div>
    );
}