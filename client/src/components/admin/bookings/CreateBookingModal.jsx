'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
    X, Loader2, Search, ChevronLeft, ChevronRight, Check,
    Calendar, Clock, CreditCard, User, MapPin, Package,
    UserPlus, Star, Trash2, Save, MoreHorizontal, Edit2,
    Tag, Percent, AlertTriangle, Sparkles, Phone, Home,
    Building2, ArrowRight, CheckCircle2, XCircle, Banknote,
    Wifi, Timer, ShieldCheck, Zap,
} from 'lucide-react';
import adminService from '@/services/adminService';
import serviceService from '@/services/serviceService';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

// ============================================
// CONSTANTS & UTILS
// ============================================

const REGULAR_TIME_SLOTS = [
    '08:30 AM-10:30 AM', '10:30 AM-12:00 PM', '12:00 PM-02:30 PM',
    '02:30 PM-04:00 PM', '04:00 PM-05:30 PM',
];
const ADMIN_ONLY_SLOTS = [
    '05:30 PM-07:00 PM', '07:00 PM-08:30 PM', '08:30 PM-10:00 PM',
];
const sortTimeSlots = (slots) => [...slots].sort((a, b) => {
    const getHour = (slot) => {
        const time = slot.split('-')[0].trim();
        const [hourMin, period] = time.split(' ');
        let hour = parseInt(hourMin.split(':')[0]);
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return hour;
    };
    return getHour(a) - getHour(b);
});
const ALL_TIME_SLOTS = sortTimeSlots([...REGULAR_TIME_SLOTS, ...ADMIN_ONLY_SLOTS]);
const STEPS = [
    { key: 'customer', label: 'Customer', icon: User },
    { key: 'service', label: 'Service', icon: Package },
    { key: 'schedule', label: 'Schedule', icon: Calendar },
];
const QUICK_DISCOUNTS = [5, 10, 15, 20, 25, 50];

function isSlotPassed(slot, selectedDate) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    if (selectedDate > todayStr) return false;
    if (selectedDate < todayStr) return true;
    const parts = slot.split(/[-–—]/);
    if (parts.length < 2) return false;
    const match = parts[1].trim().match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
    if (!match) return false;
    let endHour = parseInt(match[1], 10);
    const endMinutes = parseInt(match[2], 10);
    const period = match[3].toUpperCase();
    if (period === 'PM' && endHour !== 12) endHour += 12;
    else if (period === 'AM' && endHour === 12) endHour = 0;
    return (now.getHours() * 60 + now.getMinutes()) >= (endHour * 60 + endMinutes);
}

function getTodayString() {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
}

const isAdminOnlySlot = (slot) => ADMIN_ONLY_SLOTS.includes(slot);

function calcFinalPrice(basePrice, discountPct) {
    if (!discountPct || discountPct <= 0) return basePrice;
    const pct = Math.min(100, Math.max(0, parseFloat(discountPct) || 0));
    return Math.round(basePrice - (basePrice * pct) / 100);
}

function getDaysInMonth(year, month) {
    return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
    return new Date(year, month, 1).getDay();
}

// ============================================
// BOTTOM SHEET (reusable)
// ============================================

function BottomSheet({ open, onClose, title, subtitle, children }) {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            requestAnimationFrame(() => {
                requestAnimationFrame(() => setAnimating(true));
            });
            document.body.style.overflow = 'hidden';
        } else {
            setAnimating(false);
            const t = setTimeout(() => setVisible(false), 300);
            document.body.style.overflow = '';
            return () => clearTimeout(t);
        }
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!visible) return null;

    return (
        <>
            <div
                className="fixed inset-0 z-[80] transition-all duration-300"
                style={{
                    background: animating ? 'rgba(0,0,0,0.75)' : 'rgba(0,0,0,0)',
                    backdropFilter: animating ? 'blur(4px)' : 'blur(0px)',
                }}
                onClick={onClose}
            />
            <div
                className="fixed bottom-0 left-0 right-0 z-[90] flex flex-col"
                style={{
                    maxHeight: '92vh',
                    background: 'linear-gradient(180deg, #111111 0%, #0a0a0a 100%)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '20px 20px 0 0',
                    transform: animating ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)',
                    boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
                }}
            >
                <div className="flex justify-center pt-3 pb-2 shrink-0">
                    <div className="w-10 h-1 rounded-full bg-white/10" />
                </div>
                <div className="flex items-center justify-between px-5 py-3 shrink-0">
                    <div>
                        <p className="text-[13px] font-semibold text-white tracking-tight">{title}</p>
                        {subtitle && <p className="text-[10px] text-white/30 mt-0.5">{subtitle}</p>}
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
                        style={{ background: 'rgba(255,255,255,0.06)' }}
                    >
                        <X className="w-3.5 h-3.5 text-white/40" />
                    </button>
                </div>
                <div className="h-px mx-5 shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {children}
                </div>
            </div>
        </>
    );
}

// ============================================
// DISCOUNT PROMPT SHEET (auto-popup after service select)
// ============================================

function DiscountPromptSheet({ open, onClose, service, onApplyDiscount, onSkip }) {
    const [visible, setVisible] = useState(false);
    const [animating, setAnimating] = useState(false);

    useEffect(() => {
        if (open) {
            setVisible(true);
            requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)));
        } else {
            setAnimating(false);
            const t = setTimeout(() => setVisible(false), 300);
            return () => clearTimeout(t);
        }
    }, [open]);

    if (!visible || !service) return null;

    const price = service.discountPrice || service.price || 0;

    return (
        <>
            <div
                className="fixed inset-0 z-[80] transition-all duration-300"
                style={{
                    background: animating ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0)',
                    backdropFilter: animating ? 'blur(6px)' : 'blur(0px)',
                }}
                onClick={onSkip}
            />
            <div
                className="fixed bottom-0 left-0 right-0 z-[90]"
                style={{
                    background: 'linear-gradient(180deg, #131313 0%, #0d0d0d 100%)',
                    borderTop: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '24px 24px 0 0',
                    transform: animating ? 'translateY(0)' : 'translateY(100%)',
                    transition: 'transform 0.4s cubic-bezier(0.32, 0.72, 0, 1)',
                    boxShadow: '0 -24px 80px rgba(0,0,0,0.6)',
                    paddingBottom: 'env(safe-area-inset-bottom, 0px)',
                }}
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 rounded-full bg-white/10" />
                </div>

                <div className="px-5 pt-3 pb-8 space-y-5">
                    {/* Header */}
                    <div className="flex items-start gap-3">
                        <div
                            className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
                        >
                            <Tag className="w-5 h-5 text-white/40" />
                        </div>
                        <div className="flex-1">
                            <p className="text-[15px] font-bold text-white tracking-tight">Apply a discount?</p>
                            <p className="text-[11px] text-white/30 mt-1 leading-relaxed">
                                Would you like to offer a discount on this service?
                            </p>
                        </div>
                    </div>

                    {/* Service pill */}
                    <div
                        className="flex items-center gap-3 p-3.5 rounded-2xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[14px] font-bold text-white/40"
                            style={{ background: 'rgba(255,255,255,0.06)' }}
                        >
                            {service.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-white/75 truncate">{service.name}</p>
                            <p className="text-[10px] text-white/30 mt-0.5">
                                {service.category?.name || service.tier}
                            </p>
                        </div>
                        <div className="text-right shrink-0">
                            <p className="text-[15px] font-bold text-white font-mono">₹{price.toLocaleString('en-IN')}</p>
                            <p className="text-[9px] text-white/25 mt-0.5">base price</p>
                        </div>
                    </div>

                    {/* Quick discount chips for instant apply */}
                    <div className="space-y-2.5">
                        <p className="text-[10px] text-white/20 font-semibold uppercase tracking-widest">Quick Apply</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[5, 10, 15, 20, 25, 50].map((pct) => {
                                const saved = Math.round((price * pct) / 100);
                                const final = price - saved;
                                return (
                                    <button
                                        key={pct}
                                        onClick={() => onApplyDiscount(String(pct))}
                                        className="py-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95"
                                        style={{
                                            background: 'rgba(255,255,255,0.04)',
                                            border: '1px solid rgba(255,255,255,0.07)',
                                        }}
                                    >
                                        <span className="text-sm font-bold text-white/70">{pct}%</span>
                                        <span className="text-[9px] font-mono text-white/20">
                                            ₹{final.toLocaleString('en-IN')}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2.5">
                        <button
                            onClick={onSkip}
                            className="flex-1 py-4 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.07)',
                                color: 'rgba(255,255,255,0.4)',
                            }}
                        >
                            No Discount
                        </button>
                        <button
                            onClick={() => onApplyDiscount(null)}
                            className="flex-1 py-4 rounded-2xl text-[13px] font-bold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                            style={{
                                background: 'white',
                                color: 'black',
                            }}
                        >
                            <Percent className="w-4 h-4" />
                            Custom %
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

// ============================================
// CALENDAR PICKER
// ============================================

function CalendarPicker({ value, onChange, onClose }) {
    const today = new Date();
    const [viewYear, setViewYear] = useState(value ? parseInt(value.split('-')[0]) : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(value ? parseInt(value.split('-')[1]) - 1 : today.getMonth());

    const todayStr = getTodayString();
    const daysInMonth = getDaysInMonth(viewYear, viewMonth);
    const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
    const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];
    const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const handleDay = (day) => {
        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        if (dateStr < todayStr) return;
        onChange(dateStr);
        onClose();
    };

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const selectedDisplay = value
        ? new Date(value + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })
        : null;

    return (
        <div className="pb-8">
            {selectedDisplay && (
                <div className="mx-5 mt-4 mb-2">
                    <div
                        className="flex items-center gap-2 px-3 py-2 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <div className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white/60" />
                        </div>
                        <span className="text-[11px] text-white/50">Selected:</span>
                        <span className="text-[11px] text-white font-medium">{selectedDisplay}</span>
                    </div>
                </div>
            )}

            <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                    <button
                        onClick={prevMonth}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <ChevronLeft className="w-4 h-4 text-white/40" />
                    </button>
                    <div className="text-center">
                        <p className="text-sm font-semibold text-white">{MONTH_NAMES[viewMonth]}</p>
                        <p className="text-[10px] text-white/25">{viewYear}</p>
                    </div>
                    <button
                        onClick={nextMonth}
                        className="w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                        <ChevronRight className="w-4 h-4 text-white/40" />
                    </button>
                </div>

                <div className="grid grid-cols-7 gap-1">
                    {DAY_NAMES.map(d => (
                        <div key={d} className="h-8 flex items-center justify-center">
                            <span className="text-[9px] font-bold text-white/20 uppercase tracking-wider">{d}</span>
                        </div>
                    ))}
                    {cells.map((day, idx) => {
                        if (!day) return <div key={`e-${idx}`} />;
                        const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const isPast = dateStr < todayStr;
                        const isToday = dateStr === todayStr;
                        const isSelected = dateStr === value;
                        const isWeekend = (idx % 7 === 0 || idx % 7 === 6);
                        return (
                            <button
                                key={day}
                                onClick={() => handleDay(day)}
                                disabled={isPast}
                                className="h-9 w-full rounded-xl text-[11px] font-medium transition-all flex items-center justify-center relative active:scale-95"
                                style={{
                                    background: isSelected ? 'white' : isToday ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    color: isSelected ? 'black' : isPast ? 'rgba(255,255,255,0.1)' : isWeekend ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.6)',
                                    border: isToday && !isSelected ? '1px solid rgba(255,255,255,0.12)' : '1px solid transparent',
                                    cursor: isPast ? 'not-allowed' : 'pointer',
                                    fontWeight: isSelected ? 700 : isToday ? 600 : 400,
                                }}
                            >
                                {day}
                                {isToday && !isSelected && (
                                    <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.4)' }} />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="px-5 space-y-3 pt-1">
                <div className="h-px" style={{ background: 'rgba(255,255,255,0.04)' }} />
                <p className="text-[10px] text-white/20 font-semibold uppercase tracking-widest">Quick Select</p>
                <div className="grid grid-cols-2 gap-2">
                    {[
                        { label: 'Today', sublabel: 'Right now', offset: 0 },
                        { label: 'Tomorrow', sublabel: 'Next day', offset: 1 },
                        { label: 'In 2 days', sublabel: (() => { const d = new Date(); d.setDate(d.getDate() + 2); return d.toLocaleDateString('en-IN', { weekday: 'short' }); })(), offset: 2 },
                        { label: 'In 3 days', sublabel: (() => { const d = new Date(); d.setDate(d.getDate() + 3); return d.toLocaleDateString('en-IN', { weekday: 'short' }); })(), offset: 3 },
                    ].map(({ label, sublabel, offset }) => {
                        const d = new Date();
                        d.setDate(d.getDate() + offset);
                        const ds = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        const sel = ds === value;
                        return (
                            <button
                                key={label}
                                onClick={() => { onChange(ds); onClose(); }}
                                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all active:scale-95"
                                style={{ background: sel ? 'white' : 'rgba(255,255,255,0.04)', border: sel ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0" style={{ background: sel ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)' }}>
                                    <Calendar className="w-3 h-3" style={{ color: sel ? 'black' : 'rgba(255,255,255,0.3)' }} />
                                </div>
                                <div className="text-left">
                                    <p className="text-[11px] font-semibold" style={{ color: sel ? 'black' : 'rgba(255,255,255,0.7)' }}>{label}</p>
                                    <p className="text-[9px]" style={{ color: sel ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.2)' }}>{sublabel}</p>
                                </div>
                                {sel && <Check className="w-3.5 h-3.5 text-black ml-auto" />}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// ============================================
// DISCOUNT BOTTOM SHEET (full custom)
// ============================================

function DiscountSheet({ open, onClose, discountPct, setDiscountPct, discountReason, setDiscountReason, basePrice, initialPct }) {
    const [localPct, setLocalPct] = useState(discountPct || initialPct || '');
    const [localReason, setLocalReason] = useState(discountReason);

    useEffect(() => {
        if (open) {
            setLocalPct(discountPct || initialPct || '');
            setLocalReason(discountReason);
        }
    }, [open]);

    const pctNum = Math.min(100, Math.max(0, parseFloat(localPct) || 0));
    const discountAmount = Math.round((basePrice * pctNum) / 100);
    const finalPrice = basePrice - discountAmount;
    const hasDiscount = pctNum > 0;
    const discountColor = pctNum >= 50 ? '#10b981' : pctNum >= 25 ? '#3b82f6' : pctNum >= 10 ? '#8b5cf6' : 'rgba(255,255,255,0.5)';

    const handleInput = (val) => {
        const n = val.replace(/[^0-9.]/g, '');
        if (n === '' || parseFloat(n) <= 100) setLocalPct(n);
    };

    const handleApply = () => {
        setDiscountPct(localPct);
        setDiscountReason(localReason);
        onClose();
    };

    const handleClear = () => {
        setLocalPct('');
        setLocalReason('');
        setDiscountPct('');
        setDiscountReason('');
        onClose();
    };

    return (
        <BottomSheet open={open} onClose={onClose} title="Apply Discount" subtitle="Set a percentage off the service price">
            <div className="pb-10">
                {/* Hero price display */}
                <div className="px-5 py-5">
                    <div
                        className="rounded-2xl p-5 relative overflow-hidden"
                        style={{
                            background: hasDiscount ? 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)' : 'rgba(255,255,255,0.02)',
                            border: hasDiscount ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.04)',
                        }}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest mb-2">
                                    {hasDiscount ? 'Final Price' : 'Service Price'}
                                </p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-3xl font-bold text-white tracking-tight font-mono">
                                        ₹{finalPrice.toLocaleString('en-IN')}
                                    </span>
                                    {hasDiscount && (
                                        <span className="text-sm text-white/25 line-through font-mono">
                                            ₹{basePrice.toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>
                                {hasDiscount && (
                                    <div className="mt-2 flex items-center gap-1.5">
                                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ background: `${discountColor}20` }}>
                                            <Tag className="w-2.5 h-2.5" style={{ color: discountColor }} />
                                            <span className="text-[10px] font-bold" style={{ color: discountColor }}>{pctNum}% OFF</span>
                                        </div>
                                        <span className="text-[10px] text-white/25 font-mono">Save ₹{discountAmount.toLocaleString('en-IN')}</span>
                                    </div>
                                )}
                            </div>
                            {hasDiscount && (
                                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${discountColor}15`, border: `1px solid ${discountColor}25` }}>
                                    <span className="text-lg font-black" style={{ color: discountColor }}>{pctNum}</span>
                                </div>
                            )}
                        </div>
                        {hasDiscount && (
                            <div className="mt-4 space-y-1.5">
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pctNum}%`, background: `linear-gradient(90deg, ${discountColor}80, ${discountColor})` }} />
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-[9px] text-white/20">₹0</span>
                                    <span className="text-[9px] text-white/20 font-mono">₹{basePrice.toLocaleString('en-IN')}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-5 space-y-5">
                    <div className="space-y-2.5">
                        <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">Quick Select</p>
                        <div className="grid grid-cols-3 gap-2">
                            {QUICK_DISCOUNTS.map((pct) => {
                                const sel = localPct === String(pct);
                                const amt = Math.round((basePrice * pct) / 100);
                                return (
                                    <button
                                        key={pct}
                                        onClick={() => setLocalPct(sel ? '' : String(pct))}
                                        className="py-3.5 rounded-2xl flex flex-col items-center gap-1 transition-all active:scale-95"
                                        style={{ background: sel ? 'white' : 'rgba(255,255,255,0.03)', border: sel ? 'none' : '1px solid rgba(255,255,255,0.06)' }}
                                    >
                                        <span className="text-sm font-bold" style={{ color: sel ? 'black' : 'rgba(255,255,255,0.7)' }}>{pct}%</span>
                                        <span className="text-[9px] font-mono" style={{ color: sel ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.2)' }}>−₹{amt.toLocaleString('en-IN')}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">Custom Amount</p>
                        <div className="relative">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                <Percent className="w-3 h-3 text-white/30" />
                            </div>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={localPct}
                                onChange={(e) => handleInput(e.target.value)}
                                placeholder="0"
                                className="w-full pl-12 pr-16 py-3.5 rounded-xl text-base font-bold text-white placeholder-white/15 focus:outline-none transition-all font-mono"
                                style={{ background: 'rgba(255,255,255,0.04)', border: pctNum > 0 ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.06)' }}
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-white/20 font-medium">% off</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-[10px] text-white/25 font-semibold uppercase tracking-widest">
                            Reason <span className="text-white/15 normal-case font-normal ml-1">(optional)</span>
                        </p>
                        <input
                            type="text"
                            value={localReason}
                            onChange={(e) => setLocalReason(e.target.value)}
                            placeholder="e.g. Loyal customer, Festival offer..."
                            className="w-full px-4 py-3.5 rounded-xl text-[12px] text-white placeholder-white/15 focus:outline-none transition-all"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                        />
                    </div>

                    <div className="flex gap-2 pt-1">
                        {(discountPct || localPct) && (
                            <button
                                onClick={handleClear}
                                className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[12px] font-medium transition-all active:scale-95"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}
                            >
                                <XCircle className="w-3.5 h-3.5" />
                                Remove
                            </button>
                        )}
                        <button
                            onClick={handleApply}
                            className="flex-1 py-3.5 rounded-xl flex items-center justify-center gap-2 text-[12px] font-semibold transition-all active:scale-95"
                            style={{ background: hasDiscount ? 'white' : 'rgba(255,255,255,0.08)', color: hasDiscount ? 'black' : 'rgba(255,255,255,0.4)' }}
                        >
                            {hasDiscount ? (
                                <><CheckCircle2 className="w-4 h-4" />Apply {pctNum}% Discount</>
                            ) : (
                                <><Check className="w-4 h-4" />No Discount</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </BottomSheet>
    );
}

// ============================================
// NEW CUSTOMER BOTTOM SHEET
// ============================================

function NewCustomerSheet({ open, onClose, walkInCustomer, setWalkInCustomer, saveToDb, setSaveToDb, onDone }) {
    const [localCustomer, setLocalCustomer] = useState({ name: '', phone: '', address: '', city: 'Duliajan' });
    const [localSave, setLocalSave] = useState(true);

    useEffect(() => {
        if (open) {
            setLocalCustomer({ name: walkInCustomer.name || '', phone: walkInCustomer.phone || '', address: walkInCustomer.address || '', city: walkInCustomer.city || 'Duliajan' });
            setLocalSave(saveToDb);
        }
    }, [open]);

    const canSave = localCustomer.name.trim() && localCustomer.phone.trim();

    const handleDone = () => {
        setWalkInCustomer(localCustomer);
        setSaveToDb(localSave);
        onDone(localCustomer);
        onClose();
    };

    const fields = [
        { key: 'name', label: 'Full Name', placeholder: 'Customer name', icon: User, type: 'text', required: true },
        { key: 'phone', label: 'Phone Number', placeholder: '+91 00000 00000', icon: Phone, type: 'tel', required: true },
        { key: 'address', label: 'Address', placeholder: 'Street, locality...', icon: Home, type: 'text', required: false },
        { key: 'city', label: 'City', placeholder: 'City', icon: Building2, type: 'text', required: false },
    ];

    return (
        <BottomSheet open={open} onClose={onClose} title="New Customer" subtitle="Add a customer to this booking">
            <div className="pb-10">
                <div className="px-5 pt-4 pb-2">
                    <div className="flex gap-1.5 p-1 rounded-2xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        {[
                            { val: true, label: 'Save as Regular', icon: Save },
                            { val: false, label: 'One-time', icon: Timer },
                        ].map(({ val, label, icon: Icon }) => (
                            <button
                                key={String(val)}
                                onClick={() => setLocalSave(val)}
                                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all text-[11px] font-semibold"
                                style={{
                                    background: localSave === val ? 'rgba(255,255,255,0.08)' : 'transparent',
                                    color: localSave === val ? 'white' : 'rgba(255,255,255,0.25)',
                                    border: localSave === val ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
                                }}
                            >
                                <Icon className="w-3 h-3" />
                                {label}
                            </button>
                        ))}
                    </div>
                    <p className="text-[9px] text-white/20 mt-2 text-center">
                        {localSave ? 'Customer will be saved for future bookings' : 'Customer details will not be stored'}
                    </p>
                </div>

                <div className="px-5 pt-3 space-y-3">
                    {fields.map((field) => {
                        const Icon = field.icon;
                        return (
                            <div key={field.key} className="space-y-1.5">
                                <label className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-widest text-white/25">
                                    {field.label}
                                    {field.required && <span className="text-white/15">*</span>}
                                </label>
                                <div className="relative">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center transition-all" style={{ background: localCustomer[field.key] ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' }}>
                                        <Icon className="w-3 h-3 text-white/30" />
                                    </div>
                                    <input
                                        type={field.type}
                                        value={localCustomer[field.key]}
                                        onChange={(e) => setLocalCustomer({ ...localCustomer, [field.key]: e.target.value })}
                                        placeholder={field.placeholder}
                                        className="w-full pl-12 pr-4 py-3.5 rounded-xl text-[12px] text-white placeholder-white/15 focus:outline-none transition-all"
                                        style={{ background: 'rgba(255,255,255,0.04)', border: localCustomer[field.key] ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.05)' }}
                                    />
                                    {localCustomer[field.key] && (
                                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-white/20" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="px-5 pt-5">
                    <button
                        onClick={handleDone}
                        disabled={!canSave}
                        className="w-full py-4 rounded-2xl text-[13px] font-bold flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
                        style={{ background: canSave ? 'white' : 'rgba(255,255,255,0.06)', color: canSave ? 'black' : 'rgba(255,255,255,0.2)', cursor: canSave ? 'pointer' : 'not-allowed' }}
                    >
                        <UserPlus className="w-4 h-4" />
                        {canSave ? 'Add Customer' : 'Fill required fields'}
                    </button>
                </div>
            </div>
        </BottomSheet>
    );
}

// ============================================
// DELETE CONFIRM POPUP
// ============================================

function DeleteConfirmPopup({ customer, onConfirm, onCancel, loading }) {
    return (
        <>
            <div
                className="fixed inset-0 z-[100] transition-all duration-200"
                style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
                onClick={!loading ? onCancel : undefined}
            />
            <div
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[110] w-[300px]"
                style={{ background: 'linear-gradient(180deg, #161616 0%, #111111 100%)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
            >
                <div className="pt-6 pb-2 flex flex-col items-center gap-3 px-5">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <Trash2 className="w-5 h-5 text-white/30" />
                    </div>
                    <div className="text-center">
                        <p className="text-[13px] font-semibold text-white">Delete Customer?</p>
                        <p className="text-[10px] text-white/30 mt-1 leading-relaxed">This customer will be permanently<br />removed from your records</p>
                    </div>
                </div>
                <div className="px-4 py-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <span className="text-[13px] font-bold text-white/40">{customer.name?.charAt(0)?.toUpperCase() || '?'}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[12px] font-semibold text-white/70 truncate">{customer.name}</p>
                            <p className="text-[10px] text-white/25 font-mono truncate mt-0.5">{customer.phone}</p>
                        </div>
                    </div>
                </div>
                <div className="px-4 pb-5 flex gap-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl text-[11px] font-semibold transition-all active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.06)', opacity: loading ? 0.5 : 1 }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl text-[11px] font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5"
                        style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                        {loading ? <><Loader2 className="w-3 h-3 animate-spin" />Deleting...</> : <><Trash2 className="w-3 h-3" />Delete</>}
                    </button>
                </div>
            </div>
        </>
    );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function CreateBookingModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Customer
    const [walkInCustomer, setWalkInCustomer] = useState({ name: '', phone: '', address: '', city: 'Duliajan' });
    const [location, setLocation] = useState({ address: 'Walk-in / At Shop', city: 'Duliajan' });
    const [saveToDb, setSaveToDb] = useState(true);
    const [walkinSearch, setWalkinSearch] = useState('');
    const [savedWalkinCustomers, setSavedWalkinCustomers] = useState([]);
    const [recentWalkinCustomers, setRecentWalkinCustomers] = useState([]);
    const [walkinSearchLoading, setWalkinSearchLoading] = useState(false);
    const [selectedWalkinCustomer, setSelectedWalkinCustomer] = useState(null);
    const [showNewCustomerSheet, setShowNewCustomerSheet] = useState(false);
    const [deletingCustomerId, setDeletingCustomerId] = useState(null);
    const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', city: '' });
    const [editLoading, setEditLoading] = useState(false);

    // Service
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [serviceSearch, setServiceSearch] = useState('');

    // Discount
    const [discountPct, setDiscountPct] = useState('');
    const [discountReason, setDiscountReason] = useState('');
    const [showDiscountSheet, setShowDiscountSheet] = useState(false);
    const [showDiscountPrompt, setShowDiscountPrompt] = useState(false);
    const [discountSheetInitialPct, setDiscountSheetInitialPct] = useState('');

    // Schedule
    const [bookingDate, setBookingDate] = useState('');
    const [showCalendarSheet, setShowCalendarSheet] = useState(false);
    const [timeSlot, setTimeSlot] = useState('');
    const [availability, setAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // Derived
    const basePrice = selectedService?.discountPrice || selectedService?.price || 0;
    const discountAmount = basePrice - calcFinalPrice(basePrice, discountPct);
    const finalPrice = calcFinalPrice(basePrice, discountPct);
    const hasDiscount = parseFloat(discountPct) > 0;

    useEffect(() => {
        (async () => {
            try {
                setServicesLoading(true);
                const res = await serviceService.getAll({ isActive: true, limit: 100 });
                if (res.success) setServices(res.data);
            } catch { toast.error('Failed to load services'); }
            finally { setServicesLoading(false); }
        })();
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const res = await adminService.getRecentWalkInCustomers(5);
                if (res.success) setRecentWalkinCustomers(res.data || []);
            } catch (e) { console.error(e); }
        })();
    }, []);

    useEffect(() => {
        if (walkinSearch.length < 2) { setSavedWalkinCustomers([]); return; }
        const t = setTimeout(async () => {
            setWalkinSearchLoading(true);
            try {
                const res = await adminService.searchWalkInCustomers(walkinSearch);
                setSavedWalkinCustomers(res.success ? (res.data || []) : []);
            } catch { setSavedWalkinCustomers([]); }
            finally { setWalkinSearchLoading(false); }
        }, 400);
        return () => clearTimeout(t);
    }, [walkinSearch]);

    useEffect(() => {
        if (!bookingDate) return;
        (async () => {
            try {
                setAvailabilityLoading(true);
                const res = await axiosInstance.get('/bookings/availability', {
                    params: { date: bookingDate, includeAdminSlots: 'true' },
                });
                if (res.data.success) setAvailability(res.data.data.slots || []);
            } catch { setAvailability([]); }
            finally { setAvailabilityLoading(false); }
        })();
    }, [bookingDate]);

    // When service changes, reset discount and show prompt
    const handleSelectService = useCallback((service) => {
        setSelectedService(service);
        setDiscountPct('');
        setDiscountReason('');
        // Show discount prompt after a tiny delay so selection animation feels clean
        setTimeout(() => setShowDiscountPrompt(true), 200);
    }, []);

    const handleDiscountPromptApply = useCallback((pct) => {
        setShowDiscountPrompt(false);
        if (pct !== null) {
            // Quick apply: set directly
            setDiscountPct(pct);
            setDiscountSheetInitialPct('');
        } else {
            // Open full discount sheet
            setDiscountSheetInitialPct('');
            setTimeout(() => setShowDiscountSheet(true), 300);
        }
    }, []);

    const handleDiscountPromptSkip = useCallback(() => {
        setShowDiscountPrompt(false);
        setDiscountPct('');
        setDiscountReason('');
    }, []);

    const handleSelectWalkinCustomer = useCallback((customer) => {
        setSelectedWalkinCustomer(customer);
        setWalkInCustomer({ name: customer.name, phone: customer.phone, address: customer.address || '', city: customer.city || 'Duliajan' });
        setLocation({ address: customer.address || 'Walk-in / At Shop', city: customer.city || 'Duliajan' });
        setWalkinSearch('');
    }, []);

    const handleClearCustomer = useCallback(() => {
        setSelectedWalkinCustomer(null);
        setWalkInCustomer({ name: '', phone: '', address: '', city: 'Duliajan' });
        setLocation({ address: 'Walk-in / At Shop', city: 'Duliajan' });
    }, []);

    const handleDeleteWalkinCustomer = useCallback((customer) => {
        setDeleteConfirmCustomer(customer);
    }, []);

    const handleConfirmDelete = useCallback(async () => {
        const customer = deleteConfirmCustomer;
        if (!customer) return;
        try {
            setDeletingCustomerId(customer._id);
            await adminService.deleteWalkInCustomer(customer._id);
            setSavedWalkinCustomers(prev => prev.filter(c => c._id !== customer._id));
            setRecentWalkinCustomers(prev => prev.filter(c => c._id !== customer._id));
            if (selectedWalkinCustomer?._id === customer._id) handleClearCustomer();
            toast.success('Customer deleted');
            setDeleteConfirmCustomer(null);
        } catch { toast.error('Failed to delete'); }
        finally { setDeletingCustomerId(null); }
    }, [deleteConfirmCustomer, selectedWalkinCustomer, handleClearCustomer]);

    const handleSaveEdit = useCallback(async () => {
        try {
            setEditLoading(true);
            const res = await adminService.updateWalkInCustomer(editingCustomer._id, editForm);
            if (res.success) {
                const updated = res.data;
                setRecentWalkinCustomers(prev => prev.map(c => c._id === updated._id ? updated : c));
                if (selectedWalkinCustomer?._id === updated._id) handleSelectWalkinCustomer(updated);
                toast.success('Updated!');
                setEditingCustomer(null);
            }
        } catch { toast.error('Failed to update'); }
        finally { setEditLoading(false); }
    }, [editingCustomer, editForm, selectedWalkinCustomer, handleSelectWalkinCustomer]);

    const handleSubmit = useCallback(async () => {
        try {
            setLoading(true);
            const payload = {
                bookingType: 'walkin',
                serviceId: selectedService._id,
                bookingDate,
                timeSlot,
                location,
                paymentMethod,
                walkInCustomer: { name: walkInCustomer.name, phone: walkInCustomer.phone },
                phone: walkInCustomer.phone,
                saveCustomer: selectedWalkinCustomer ? false : saveToDb,
                discountPercentage: parseFloat(discountPct) || 0,
                discountReason: discountReason.trim() || '',
                finalPrice,
            };
            await adminService.createAdminBooking(payload);
            toast.success('Booking created!');
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        } finally { setLoading(false); }
    }, [selectedService, bookingDate, timeSlot, location, paymentMethod, walkInCustomer, selectedWalkinCustomer, saveToDb, discountPct, discountReason, finalPrice, onSuccess]);

    const goToStep = (s) => setStep(s);

    const canProceed = {
        1: (selectedWalkinCustomer || (walkInCustomer.name && walkInCustomer.phone)) && location.address,
        2: !!selectedService,
        3: !!bookingDate && !!timeSlot,
    };

    const filteredServices = serviceSearch
        ? services.filter(s => s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.category?.name?.toLowerCase().includes(serviceSearch.toLowerCase()))
        : services;

    const customersList = walkinSearch.length >= 2 ? savedWalkinCustomers : recentWalkinCustomers;

    const formattedDate = bookingDate
        ? new Date(bookingDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
        : null;

    return (
        <>
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={onClose} />

            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[460px] sm:max-h-[85vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">

                {/* Header */}
                <div className="shrink-0 px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            {step > 1 ? (
                                <button onClick={() => goToStep(step - 1)} className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors">
                                    <ChevronLeft className="w-4 h-4 text-white/60" />
                                </button>
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white/80" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-sm font-semibold text-white">New Booking</h2>
                                <p className="text-[10px] text-white/40">Step {step} of 3 · {STEPS[step - 1].label}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors">
                            <X className="w-3.5 h-3.5 text-white/40" />
                        </button>
                    </div>

                    <div className="flex gap-1 p-1 bg-white/[0.04] rounded-lg">
                        {STEPS.map((s, i) => (
                            <button
                                key={s.key}
                                onClick={() => { if (i + 1 < step) goToStep(i + 1); }}
                                disabled={i + 1 > step}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium rounded-md transition-all ${step === i + 1 ? 'bg-white/10 text-white' : i + 1 < step ? 'text-white/50 hover:text-white/70 cursor-pointer' : 'text-white/20 cursor-not-allowed'}`}
                            >
                                {i + 1 < step ? <Check className="w-3 h-3 text-emerald-400" /> : <s.icon className="w-3 h-3" />}
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {step === 1 && (
                        <CustomerStep
                            walkinSearch={walkinSearch}
                            setWalkinSearch={setWalkinSearch}
                            walkinSearchLoading={walkinSearchLoading}
                            customersList={customersList}
                            selectedWalkinCustomer={selectedWalkinCustomer}
                            onSelectCustomer={handleSelectWalkinCustomer}
                            onDeleteCustomer={handleDeleteWalkinCustomer}
                            deletingCustomerId={deletingCustomerId}
                            onClearCustomer={handleClearCustomer}
                            location={location}
                            setLocation={setLocation}
                            editingCustomer={editingCustomer}
                            setEditingCustomer={setEditingCustomer}
                            editForm={editForm}
                            setEditForm={setEditForm}
                            editLoading={editLoading}
                            onSaveEdit={handleSaveEdit}
                            walkInCustomer={walkInCustomer}
                            onAddNew={() => setShowNewCustomerSheet(true)}
                        />
                    )}
                    {step === 2 && (
                        <ServiceStep
                            services={filteredServices}
                            servicesLoading={servicesLoading}
                            selectedService={selectedService}
                            setSelectedService={handleSelectService}
                            serviceSearch={serviceSearch}
                            setServiceSearch={setServiceSearch}
                            discountPct={discountPct}
                            discountAmount={discountAmount}
                            finalPrice={finalPrice}
                            hasDiscount={hasDiscount}
                            basePrice={basePrice}
                            onOpenDiscount={() => setShowDiscountSheet(true)}
                        />
                    )}
                    {step === 3 && (
                        <ScheduleStep
                            bookingDate={bookingDate}
                            formattedDate={formattedDate}
                            onOpenCalendar={() => setShowCalendarSheet(true)}
                            timeSlot={timeSlot}
                            setTimeSlot={setTimeSlot}
                            availability={availability}
                            availabilityLoading={availabilityLoading}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            walkInCustomer={walkInCustomer}
                            selectedService={selectedService}
                            discountPct={discountPct}
                            discountAmount={discountAmount}
                            finalPrice={finalPrice}
                            hasDiscount={hasDiscount}
                            basePrice={basePrice}
                        />
                    )}
                </div>

                {/* Footer */}
                <div className="shrink-0 p-3 border-t border-white/[0.06]">
                    <button
                        onClick={step < 3 ? () => goToStep(step + 1) : handleSubmit}
                        disabled={loading || !canProceed[step]}
                        className="w-full py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Processing...</>
                        ) : step < 3 ? (
                            <>Continue<ChevronRight className="w-3.5 h-3.5" /></>
                        ) : 'Create Booking'}
                    </button>
                </div>
            </div>

            {/* Discount prompt auto-popup */}
            <DiscountPromptSheet
                open={showDiscountPrompt}
                onClose={handleDiscountPromptSkip}
                service={selectedService}
                onApplyDiscount={handleDiscountPromptApply}
                onSkip={handleDiscountPromptSkip}
            />

            {/* Full Discount Sheet */}
            <DiscountSheet
                open={showDiscountSheet}
                onClose={() => setShowDiscountSheet(false)}
                discountPct={discountPct}
                setDiscountPct={setDiscountPct}
                discountReason={discountReason}
                setDiscountReason={setDiscountReason}
                basePrice={basePrice}
                initialPct={discountSheetInitialPct}
            />

            <NewCustomerSheet
                open={showNewCustomerSheet}
                onClose={() => setShowNewCustomerSheet(false)}
                walkInCustomer={walkInCustomer}
                setWalkInCustomer={setWalkInCustomer}
                saveToDb={saveToDb}
                setSaveToDb={setSaveToDb}
                onDone={(customer) => {
                    setSelectedWalkinCustomer(null);
                    setLocation({ address: customer.address || 'Walk-in / At Shop', city: customer.city || 'Duliajan' });
                }}
            />

            <BottomSheet open={showCalendarSheet} onClose={() => setShowCalendarSheet(false)} title="Pick a Date" subtitle="Select your preferred booking date">
                <CalendarPicker
                    value={bookingDate}
                    onChange={(d) => { setBookingDate(d); setTimeSlot(''); }}
                    onClose={() => setShowCalendarSheet(false)}
                />
            </BottomSheet>

            {deleteConfirmCustomer && (
                <DeleteConfirmPopup
                    customer={deleteConfirmCustomer}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => { if (!deletingCustomerId) setDeleteConfirmCustomer(null); }}
                    loading={deletingCustomerId === deleteConfirmCustomer._id}
                />
            )}
        </>
    );
}

// ============================================
// STEP 1: CUSTOMER
// ============================================

function CustomerStep({
    walkinSearch, setWalkinSearch, walkinSearchLoading,
    customersList, selectedWalkinCustomer, onSelectCustomer,
    onDeleteCustomer, deletingCustomerId, onClearCustomer,
    location, setLocation,
    editingCustomer, setEditingCustomer,
    editForm, setEditForm, editLoading, onSaveEdit,
    walkInCustomer, onAddNew,
}) {
    return (
        <div className="px-4 py-3 space-y-4">
            {selectedWalkinCustomer && !editingCustomer && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(16,185,129,0.12)' }}>
                        <span className="text-sm font-bold text-emerald-400">{selectedWalkinCustomer.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-white truncate">{selectedWalkinCustomer.name}</p>
                            <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[8px] font-bold text-emerald-400" style={{ background: 'rgba(16,185,129,0.15)' }}>Selected</span>
                        </div>
                        <p className="text-[10px] text-white/30 font-mono mt-0.5">{selectedWalkinCustomer.phone}</p>
                    </div>
                    <button onClick={onClearCustomer} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <X className="w-3.5 h-3.5 text-white/30" />
                    </button>
                </div>
            )}

            {!selectedWalkinCustomer && walkInCustomer.name && !editingCustomer && (
                <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.07)' }}>
                        <span className="text-sm font-bold text-white/40">{walkInCustomer.name?.charAt(0)?.toUpperCase()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white/80 truncate">{walkInCustomer.name}</p>
                        <p className="text-[10px] text-white/30 font-mono mt-0.5">{walkInCustomer.phone}</p>
                    </div>
                    <button onClick={onAddNew} className="px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>Edit</button>
                </div>
            )}

            {!selectedWalkinCustomer && !editingCustomer && (
                <>
                    <div>
                        <label className="text-[10px] text-white/30 font-semibold mb-2 block uppercase tracking-widest">Find Customer</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                                <Search className="w-3 h-3 text-white/30" />
                            </div>
                            <input
                                type="text"
                                value={walkinSearch}
                                onChange={(e) => setWalkinSearch(e.target.value)}
                                placeholder="Search by name or phone..."
                                className="w-full pl-11 pr-10 py-3 rounded-xl text-[12px] text-white placeholder-white/20 focus:outline-none transition-all"
                                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                            />
                            {walkinSearchLoading && <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 animate-spin" />}
                        </div>
                    </div>

                    {customersList.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[9px] text-white/20 font-semibold uppercase tracking-widest px-0.5">
                                {walkinSearch.length >= 2 ? 'Search Results' : 'Recent Customers'}
                            </p>
                            <div className="space-y-1 max-h-52 overflow-y-auto">
                                {customersList.map((c) => (
                                    <CustomerRow
                                        key={c._id}
                                        customer={c}
                                        selected={selectedWalkinCustomer?._id === c._id}
                                        onSelect={() => onSelectCustomer(c)}
                                        onDelete={() => onDeleteCustomer(c)}
                                        onEdit={() => { setEditingCustomer(c); setEditForm({ name: c.name, phone: c.phone, address: c.address || '', city: c.city || '' }); }}
                                        deleting={deletingCustomerId === c._id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={onAddNew}
                        className="w-full p-3.5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
                        style={{ border: '1px dashed rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.01)', color: 'rgba(255,255,255,0.3)' }}
                    >
                        <UserPlus className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-semibold">New Customer</span>
                    </button>
                </>
            )}

            {editingCustomer && (
                <EditCustomerForm editForm={editForm} setEditForm={setEditForm} editLoading={editLoading} onSave={onSaveEdit} onCancel={() => setEditingCustomer(null)} />
            )}

            <div className="space-y-2">
                <label className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">Service Location</label>
                <div className="space-y-2">
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <MapPin className="w-3 h-3 text-white/30" />
                        </div>
                        <input
                            type="text"
                            value={location.address}
                            onChange={(e) => setLocation({ ...location, address: e.target.value })}
                            placeholder="Address"
                            className="w-full pl-11 pr-4 py-3 rounded-xl text-[12px] text-white placeholder-white/20 focus:outline-none transition-all"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                        />
                    </div>
                    <input
                        type="text"
                        value={location.city}
                        onChange={(e) => setLocation({ ...location, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-4 py-3 rounded-xl text-[12px] text-white placeholder-white/20 focus:outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================
// CUSTOMER ROW
// ============================================

function CustomerRow({ customer, selected, onSelect, onDelete, onEdit, deleting }) {
    const [expanded, setExpanded] = useState(false);
    return (
        <div
            className="flex items-center gap-2.5 p-2.5 rounded-xl transition-all cursor-pointer"
            style={{ background: selected ? 'rgba(16,185,129,0.06)' : expanded ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: selected ? '1px solid rgba(16,185,129,0.18)' : '1px solid rgba(255,255,255,0.04)' }}
            onClick={() => { if (!expanded) onSelect(); }}
        >
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                {customer.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-semibold text-white/70 truncate">{customer.name}</p>
                    {customer.totalBookings > 0 && (
                        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(16,185,129,0.12)' }}>
                            <Star className="w-2 h-2 text-emerald-400" />
                            <span className="text-[8px] text-emerald-400 font-bold">{customer.totalBookings}</span>
                        </span>
                    )}
                </div>
                <p className="text-[9px] text-white/25 font-mono mt-0.5 truncate">{customer.phone}</p>
            </div>
            {expanded && (
                <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                    <button onClick={e => { e.stopPropagation(); onEdit(); setExpanded(false); }} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <Edit2 className="w-3 h-3 text-white/40" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); onDelete(); setExpanded(false); }} disabled={deleting} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 disabled:opacity-50" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        {deleting ? <Loader2 className="w-3 h-3 text-white/30 animate-spin" /> : <Trash2 className="w-3 h-3 text-white/30" />}
                    </button>
                </div>
            )}
            <button
                onClick={e => { e.stopPropagation(); setExpanded(p => !p); }}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-95 shrink-0"
                style={{ background: expanded ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' }}
            >
                <MoreHorizontal className="w-3.5 h-3.5 text-white/25" />
            </button>
        </div>
    );
}

// ============================================
// EDIT CUSTOMER FORM
// ============================================

function EditCustomerForm({ editForm, setEditForm, editLoading, onSave, onCancel }) {
    return (
        <div className="p-4 rounded-2xl space-y-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.06)' }}>
                        <Edit2 className="w-2.5 h-2.5 text-white/30" />
                    </div>
                    <span className="text-[10px] text-white/30 font-semibold uppercase tracking-widest">Edit Customer</span>
                </div>
                <button onClick={onCancel} className="text-[10px] text-white/25 hover:text-white/50 transition-colors">Cancel</button>
            </div>
            <div className="space-y-2">
                {[{ key: 'name', placeholder: 'Name' }, { key: 'phone', placeholder: 'Phone' }, { key: 'address', placeholder: 'Address' }, { key: 'city', placeholder: 'City' }].map((f) => (
                    <input key={f.key} type="text" value={editForm[f.key]} onChange={e => setEditForm({ ...editForm, [f.key]: e.target.value })} placeholder={f.placeholder}
                        className="w-full px-3.5 py-3 rounded-xl text-[12px] text-white placeholder-white/20 focus:outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    />
                ))}
            </div>
            <button onClick={onSave} disabled={editLoading || !editForm.name || !editForm.phone}
                className="w-full py-3 rounded-xl text-[12px] font-semibold transition-all active:scale-[0.98] disabled:opacity-30"
                style={{ background: 'white', color: 'black' }}
            >
                {editLoading ? 'Saving...' : 'Save Changes'}
            </button>
        </div>
    );
}

// ============================================
// STEP 2: SERVICE
// ============================================

function ServiceStep({
    services, servicesLoading, selectedService, setSelectedService,
    serviceSearch, setServiceSearch,
    discountPct, discountAmount, finalPrice, hasDiscount, basePrice,
    onOpenDiscount,
}) {
    if (servicesLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-5 h-5 text-white/20 animate-spin mb-3" />
                <p className="text-[11px] text-white/20">Loading services...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* Sticky search + discount status */}
            <div className="px-4 pt-3 pb-2 space-y-2">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <Search className="w-3 h-3 text-white/30" />
                    </div>
                    <input
                        type="text"
                        value={serviceSearch}
                        onChange={e => setServiceSearch(e.target.value)}
                        placeholder="Search services..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl text-[12px] text-white placeholder-white/20 focus:outline-none transition-all"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                    />
                </div>

                {/* Discount status bar — only shown when service selected */}
                {selectedService && (
                    <button
                        onClick={onOpenDiscount}
                        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all active:scale-[0.99]"
                        style={{
                            background: hasDiscount ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)',
                            border: hasDiscount ? '1px solid rgba(255,255,255,0.10)' : '1px dashed rgba(255,255,255,0.07)',
                        }}
                    >
                        <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: hasDiscount ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' }}>
                                <Tag className="w-3.5 h-3.5 text-white/30" />
                            </div>
                            <div className="text-left">
                                <p className="text-[11px] font-semibold" style={{ color: hasDiscount ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}>
                                    {hasDiscount ? `${discountPct}% discount applied` : 'Add discount'}
                                </p>
                                {hasDiscount && (
                                    <p className="text-[9px] font-mono" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                        ₹{basePrice.toLocaleString('en-IN')} → ₹{finalPrice.toLocaleString('en-IN')}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {hasDiscount && <span className="text-[10px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>−₹{discountAmount.toLocaleString('en-IN')}</span>}
                            <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                        </div>
                    </button>
                )}
            </div>

            {/* Scrollable service list */}
            <div className="flex-1 overflow-y-auto px-4 pb-4">
                {services.length === 0 ? (
                    <EmptyState icon={Package} title="No services found" desc="Try a different search" />
                ) : (
                    <div className="space-y-1.5">
                        {services.map(service => {
                            const sel = selectedService?._id === service._id;
                            return (
                                <button
                                    key={service._id}
                                    onClick={() => setSelectedService(service)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.99]"
                                    style={{ background: sel ? 'white' : 'rgba(255,255,255,0.03)', border: sel ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
                                >
                                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-[13px] font-bold shrink-0"
                                        style={{ background: sel ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)', color: sel ? 'black' : 'rgba(255,255,255,0.4)' }}>
                                        {service.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-[12px] font-semibold truncate" style={{ color: sel ? 'black' : 'rgba(255,255,255,0.75)' }}>{service.name}</p>
                                        <p className="text-[10px] mt-0.5" style={{ color: sel ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.25)' }}>
                                            {service.category?.name || service.tier} · ₹{(service.discountPrice || service.price || 0).toLocaleString('en-IN')}
                                        </p>
                                    </div>
                                    {sel && (
                                        <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(0,0,0,0.1)' }}>
                                            <Check className="w-3 h-3 text-black" />
                                        </div>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// ============================================
// STEP 3: SCHEDULE
// ============================================

function ScheduleStep({
    bookingDate, formattedDate, onOpenCalendar,
    timeSlot, setTimeSlot,
    availability, availabilityLoading,
    paymentMethod, setPaymentMethod,
    walkInCustomer, selectedService,
    discountPct, discountAmount, finalPrice, hasDiscount, basePrice,
}) {
    const paymentMethods = [
        { key: 'cash', label: 'Cash', icon: Banknote },
        { key: 'online', label: 'Online', icon: Wifi },
        { key: 'pending', label: 'Pending', icon: Timer },
    ];

    return (
        <div className="px-4 py-3 space-y-4">
            <div>
                <label className="text-[10px] text-white/30 font-semibold mb-2 block uppercase tracking-widest">Date</label>
                <button
                    onClick={onOpenCalendar}
                    className="w-full flex items-center gap-3 p-3.5 rounded-xl transition-all active:scale-[0.99]"
                    style={{ background: bookingDate ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.02)', border: bookingDate ? '1px solid rgba(255,255,255,0.09)' : '1px dashed rgba(255,255,255,0.08)' }}
                >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: bookingDate ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.04)' }}>
                        <Calendar className="w-4 h-4 text-white/30" />
                    </div>
                    <div className="flex-1 text-left">
                        <p className="text-[12px] font-semibold" style={{ color: bookingDate ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)' }}>{formattedDate || 'Select a date'}</p>
                        {bookingDate && <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Tap to change</p>}
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-white/20 shrink-0" />
                </button>
            </div>

            {bookingDate && (
                <div>
                    <label className="text-[10px] text-white/30 font-semibold mb-2 block uppercase tracking-widest">Time Slot</label>
                    {availabilityLoading ? (
                        <div className="flex justify-center py-8"><Loader2 className="w-4 h-4 text-white/20 animate-spin" /></div>
                    ) : (
                        <div className="space-y-3">
                            <SlotGroup label="Regular Hours" slots={ALL_TIME_SLOTS.filter(s => !isAdminOnlySlot(s))} availability={availability} bookingDate={bookingDate} timeSlot={timeSlot} setTimeSlot={setTimeSlot} isAdmin={false} />
                            <SlotGroup label="Admin Hours" slots={ALL_TIME_SLOTS.filter(s => isAdminOnlySlot(s))} availability={availability} bookingDate={bookingDate} timeSlot={timeSlot} setTimeSlot={setTimeSlot} isAdmin={true} />
                        </div>
                    )}
                </div>
            )}

            <div>
                <label className="text-[10px] text-white/30 font-semibold mb-2 block uppercase tracking-widest">Payment Method</label>
                <div className="flex gap-1.5">
                    {paymentMethods.map(m => {
                        const sel = paymentMethod === m.key;
                        const Icon = m.icon;
                        return (
                            <button key={m.key} onClick={() => setPaymentMethod(m.key)}
                                className="flex-1 flex flex-col items-center gap-1.5 py-3 rounded-xl text-[10px] font-semibold transition-all active:scale-95"
                                style={{ background: sel ? 'white' : 'rgba(255,255,255,0.04)', color: sel ? 'black' : 'rgba(255,255,255,0.3)', border: sel ? 'none' : '1px solid rgba(255,255,255,0.05)' }}
                            >
                                <Icon className="w-3.5 h-3.5" />{m.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="p-4 rounded-2xl space-y-2.5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="text-[9px] text-white/20 font-semibold uppercase tracking-widest">Booking Summary</p>
                <div className="space-y-2">
                    {[{ label: 'Customer', value: walkInCustomer.name }, { label: 'Service', value: selectedService?.name }, { label: 'Date', value: formattedDate }, { label: 'Time', value: timeSlot }, { label: 'Payment', value: paymentMethod }].map(item => (
                        <SummaryItem key={item.label} label={item.label} value={item.value} />
                    ))}
                </div>
                <div className="pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    {hasDiscount ? (
                        <div className="space-y-1.5">
                            <div className="flex justify-between">
                                <span className="text-[10px] text-white/25">Original</span>
                                <span className="text-[10px] text-white/25 line-through font-mono">₹{basePrice.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[10px] text-white/25 flex items-center gap-1"><Tag className="w-2.5 h-2.5" />Discount ({discountPct}%)</span>
                                <span className="text-[10px] text-white/25 font-mono">−₹{discountAmount.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between items-center pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                                <span className="text-[11px] text-white/50 font-semibold">Total</span>
                                <span className="text-lg font-bold text-white font-mono">₹{finalPrice.toLocaleString('en-IN')}</span>
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between items-center">
                            <span className="text-[11px] text-white/50 font-semibold">Total</span>
                            <span className="text-lg font-bold text-white font-mono">₹{basePrice.toLocaleString('en-IN')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ============================================
// SLOT GROUP
// ============================================

function SlotGroup({ label, slots, availability, bookingDate, timeSlot, setTimeSlot, isAdmin }) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 px-0.5">
                {isAdmin && (
                    <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-purple-400" style={{ background: 'rgba(168,85,247,0.15)' }}>A</div>
                )}
                <p className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: isAdmin ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.2)' }}>{label}</p>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
                {slots.map(slot => {
                    const slotData = availability.find(a => a.slot === slot);
                    const passed = isSlotPassed(slot, bookingDate);
                    const booked = slotData && !slotData.available && !passed;
                    const disabled = passed || booked;
                    return <TimeSlotChip key={slot} slot={slot} selected={timeSlot === slot} disabled={disabled} passed={passed} booked={booked} isAdmin={isAdmin} onClick={() => !disabled && setTimeSlot(slot)} />;
                })}
            </div>
        </div>
    );
}

// ============================================
// TIME SLOT CHIP
// ============================================

function TimeSlotChip({ slot, selected, disabled, passed, booked, isAdmin, onClick }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="relative p-2.5 rounded-xl text-center transition-all active:scale-95"
            style={{
                background: selected ? (isAdmin ? 'rgba(168,85,247,0.15)' : 'white') : disabled ? 'rgba(255,255,255,0.01)' : isAdmin ? 'rgba(168,85,247,0.04)' : 'rgba(255,255,255,0.03)',
                border: selected ? (isAdmin ? '1px solid rgba(168,85,247,0.4)' : '1px solid white') : disabled ? '1px solid rgba(255,255,255,0.03)' : isAdmin ? '1px solid rgba(168,85,247,0.1)' : '1px solid rgba(255,255,255,0.06)',
                cursor: disabled ? 'not-allowed' : 'pointer',
            }}
        >
            {isAdmin && !selected && !disabled && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7px] font-black text-white" style={{ background: 'rgba(168,85,247,0.8)' }}>A</span>
            )}
            {selected && (
                <span className="absolute top-1.5 left-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ background: isAdmin ? 'rgba(168,85,247,0.4)' : 'rgba(0,0,0,0.15)' }}>
                    <Check className="w-2 h-2" style={{ color: isAdmin ? 'white' : 'black' }} />
                </span>
            )}
            <span className="block text-[10px] font-semibold" style={{ color: selected ? (isAdmin ? 'rgba(216,180,254,0.9)' : 'black') : disabled ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.5)' }}>
                {slot}
            </span>
            {(passed || booked) && <span className="block text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.12)' }}>{passed ? 'Passed' : 'Booked'}</span>}
        </button>
    );
}

// ============================================
// SUMMARY ITEM
// ============================================

function SummaryItem({ label, value }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] shrink-0" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
            <span className="text-[11px] text-right truncate capitalize font-medium" style={{ color: 'rgba(255,255,255,0.55)' }}>{value || '—'}</span>
        </div>
    );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ icon: Icon, title, desc }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <Icon className="w-5 h-5 text-white/15" />
            </div>
            <p className="text-[12px] font-semibold text-white/40 mb-1">{title}</p>
            <p className="text-[10px] text-white/20">{desc}</p>
        </div>
    );
}