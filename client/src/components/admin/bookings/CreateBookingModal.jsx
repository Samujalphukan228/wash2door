'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Search, ChevronLeft, Check } from 'lucide-react';
import adminService from '@/services/adminService';
import serviceService from '@/services/serviceService';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

// ✅ 12-hour format time slots
const TIME_SLOTS = [
    '08:30 AM-10:30 AM',
    '10:30 AM-12:00 PM',
    '12:00 PM-02:30 PM',
    '02:30 PM-04:00 PM',
    '04:00 PM-05:30 PM',
];

// ✅ UPDATED: Step descriptions
const STEPS = [
    { label: 'Schedule', desc: 'When?' },
    { label: 'Service',  desc: 'What service?' },
    { label: 'Customer', desc: 'Who & where?' }
];

/* ── Shared styles ── */
const inputCls = `
    w-full bg-white/[0.03] border border-white/[0.08]
    text-white/80 text-sm placeholder-white/20
    px-3 py-2.5 rounded-lg
    focus:outline-none focus:border-white/20 focus:bg-white/[0.05]
    transition-all duration-150
`;

const sectionLabel = `text-[10px] text-white/25 uppercase tracking-widest font-medium mb-3 block`;

/**
 * Convert 12-hour format "08:00 AM" to 24-hour (8)
 */
function convertTo24Hour(time12) {
    const [time, period] = time12.split(' ');
    let [hours] = time.split(':').map(Number);

    if (period === 'PM' && hours !== 12) {
        hours += 12;
    } else if (period === 'AM' && hours === 12) {
        hours = 0;
    }

    return hours;
}

/**
 * Check if a time slot has passed (handles 12-hour format)
 */
function isSlotPassed(slot, selectedDate) {
    const now = new Date();
    
    const [year, month, day] = selectedDate.split('-').map(Number);
    const selected = new Date(year, month - 1, day, 0, 0, 0, 0);
    
    const todayYear = now.getFullYear();
    const todayMonth = String(now.getMonth() + 1).padStart(2, '0');
    const todayDay = String(now.getDate()).padStart(2, '0');
    const todayStr = `${todayYear}-${todayMonth}-${todayDay}`;

    if (selectedDate > todayStr) return false;
    if (selectedDate < todayStr) return true;

    const startTimePart = slot.split('-')[0].trim();
    const startHour = convertTo24Hour(startTimePart);

    const currentHour = now.getHours();
    const currentMin = now.getMinutes();

    if (currentHour > startHour) return true;
    if (currentHour === startHour && currentMin > 0) return true;

    return false;
}

export default function CreateBookingModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    /* Step 1 - Schedule */
    const [bookingDate, setBookingDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [availability, setAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    /* Step 2 - Service */
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [servicesLoading, setServicesLoading] = useState(false);

    /* Step 3 - Customer & Location */
    const [bookingType, setBookingType] = useState('walkin');
    const [walkInCustomer, setWalkInCustomer] = useState({ name: '', phone: '' });
    const [customerSearch, setCustomerSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [location, setLocation] = useState({
        address: 'Walk-in / At Shop',
        city: 'Walk-in'
    });

    // Refresh current time every minute
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);
        return () => clearInterval(interval);
    }, []);

    /* Load services */
    useEffect(() => {
        (async () => {
            try {
                setServicesLoading(true);
                const res = await serviceService.getAll({ isActive: true, limit: 100 });
                if (res.success) setServices(res.data);
            } catch { 
                toast.error('Failed to load services'); 
            } finally { 
                setServicesLoading(false); 
            }
        })();
    }, []);

    /* Search customers */
    useEffect(() => {
        if (bookingType !== 'online' || customerSearch.length < 2) {
            setCustomers([]);
            return;
        }
        const t = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await adminService.getAllUsers({ search: customerSearch, limit: 5 });
                console.log('Customer search response:', res);
                if (res.success) {
                    setCustomers(res.data.users || []);
                } else {
                    console.error('Search failed:', res.message);
                    setCustomers([]);
                }
            } catch (err) {
                console.error('Customer search error:', err);
                setCustomers([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(t);
    }, [customerSearch, bookingType]);

    /* Check availability */
    useEffect(() => {
        if (!bookingDate) return;
        
        (async () => {
            try {
                setAvailabilityLoading(true);
                const res = await axiosInstance.get('/bookings/availability', {
                    params: { date: bookingDate }
                });
                if (res.data.success) {
                    setAvailability(res.data.data.slots || []);
                }
            } catch (err) {
                console.error('Availability check failed:', err);
                setAvailability([]);
            } finally {
                setAvailabilityLoading(false);
            }
        })();
    }, [bookingDate]);

    // Clear selected time slot if it becomes passed
    useEffect(() => {
        if (timeSlot && bookingDate && isSlotPassed(timeSlot, bookingDate)) {
            setTimeSlot('');
        }
    }, [currentTime, timeSlot, bookingDate]);

    const isSlotAvailable = (slot) => {
        const found = availability.find(a => a.slot === slot);
        return found ? found.available : true;
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            
            const payload = {
                bookingType,
                serviceId: selectedService._id,
                bookingDate,
                timeSlot,
                location,
                paymentMethod
            };

            if (bookingType === 'walkin') {
                payload.walkInCustomer = walkInCustomer;
                payload.phone = walkInCustomer.phone;
            } else {
                payload.customerId = selectedCustomer._id;
                payload.phone = selectedCustomer?.phone || '';
            }
            
            await adminService.createAdminBooking(payload);
            toast.success('Booking created successfully!');
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create booking');
        } finally { 
            setLoading(false); 
        }
    };

    // ✅ UPDATED: Moved location validation to step 3
    const canProceed = {
        1: bookingDate && timeSlot,
        2: selectedService !== null,
        3: (bookingType === 'walkin' ? walkInCustomer.name.trim() : selectedCustomer !== null) && 
           location.address.trim() && location.city.trim()
    };

    return (
        <>
            {/* Backdrop */}
            <div 
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" 
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="
                    pointer-events-auto
                    w-full h-[100dvh] sm:h-auto
                    sm:max-w-lg sm:max-h-[92vh]
                    flex flex-col
                    bg-[#0a0a0a]
                    sm:rounded-xl
                    border-0 sm:border sm:border-white/[0.08]
                    shadow-2xl shadow-black/80
                    overflow-hidden
                ">
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent shrink-0" />

                    {/* Header */}
                    <div className="shrink-0 flex items-center gap-3 px-4 py-4 bg-[#0a0a0a]">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white/35 hover:text-white/70 transition-all duration-150"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/25 uppercase tracking-widest">
                                Step {step} of 3
                            </p>
                            <p className="text-sm font-medium text-white/80 mt-0.5">
                                {STEPS[step - 1].label}
                                <span className="text-white/30 font-normal ml-2 text-xs">
                                    {STEPS[step - 1].desc}
                                </span>
                            </p>
                        </div>

                        <button 
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border border-white/[0.06] bg-white/[0.03] text-white/30 hover:text-white/70 transition-all duration-150"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Step Indicators */}
                    <div className="shrink-0 px-4 pb-4">
                        <div className="relative flex items-center gap-1 mb-3">
                            {STEPS.map((s, i) => (
                                <div
                                    key={s.label}
                                    className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                                        i + 1 <= step ? 'bg-white/60' : 'bg-white/[0.08]'
                                    }`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            {STEPS.map((s, i) => (
                                <div key={s.label} className="flex items-center gap-1.5">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold transition-all duration-200 ${
                                        step === i + 1
                                            ? 'bg-white text-black shadow-lg shadow-white/20'
                                            : step > i + 1
                                            ? 'bg-white/20 text-white/60'
                                            : 'bg-white/[0.06] text-white/20'
                                    }`}>
                                        {step > i + 1 ? <Check className="w-2.5 h-2.5" /> : i + 1}
                                    </div>
                                    <span className={`text-[10px] transition-colors duration-200 ${
                                        step === i + 1 ? 'text-white/60' : 'text-white/20'
                                    }`}>
                                        {s.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="h-px bg-white/[0.05] shrink-0" />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6 pb-28 sm:pb-6">

                        {/* STEP 1 — Schedule (Date, Time, Payment - NO Location) */}
                        {step === 1 && (
                            <div className="space-y-5">
                                {/* Date */}
                                <div>
                                    <span className={sectionLabel}>Booking Date</span>
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        min={(() => {
                                            const today = new Date();
                                            const year = today.getFullYear();
                                            const month = String(today.getMonth() + 1).padStart(2, '0');
                                            const day = String(today.getDate()).padStart(2, '0');
                                            return `${year}-${month}-${day}`;
                                        })()}
                                        onChange={(e) => { 
                                            setBookingDate(e.target.value); 
                                            setTimeSlot(''); 
                                        }}
                                        className={`${inputCls} [color-scheme:dark]`}
                                    />
                                </div>

                                {/* Time Slots */}
                                {bookingDate && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`${sectionLabel} mb-0`}>Time Slot</span>
                                            <div className="flex items-center gap-3">
                                                {bookingDate === (() => {
                                                    const t = new Date();
                                                    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
                                                })() && (
                                                    <span className="text-[10px] text-white/20 font-mono">
                                                        Now {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                    </span>
                                                )}
                                                {availabilityLoading && (
                                                    <div className="flex items-center gap-1.5">
                                                        <Loader2 className="w-3 h-3 text-white/25 animate-spin" />
                                                        <span className="text-[10px] text-white/25">Checking…</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {TIME_SLOTS.map((slot) => {
                                                const available = isSlotAvailable(slot);
                                                const passed = isSlotPassed(slot, bookingDate);
                                                const disabled = !available || passed;
                                                const selected = timeSlot === slot;

                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => !disabled && setTimeSlot(slot)}
                                                        disabled={disabled}
                                                        className={`relative p-3 rounded-lg border text-xs font-medium transition-all duration-150 ${
                                                            selected
                                                                ? 'border-white/30 bg-white/[0.08] text-white'
                                                                : disabled
                                                                ? 'border-white/[0.04] bg-white/[0.01] text-white/15 cursor-not-allowed'
                                                                : 'border-white/[0.07] bg-white/[0.02] text-white/50 hover:border-white/[0.14] hover:text-white/70'
                                                        }`}
                                                    >
                                                        {slot}
                                                        {passed && (
                                                            <span className="block text-[10px] text-white/15 mt-0.5">
                                                                Passed
                                                            </span>
                                                        )}
                                                        {!passed && !available && (
                                                            <span className="block text-[10px] text-white/15 mt-0.5">
                                                                Booked
                                                            </span>
                                                        )}
                                                        {selected && (
                                                            <span className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full bg-white flex items-center justify-center">
                                                                <Check className="w-2 h-2 text-black" />
                                                            </span>
                                                        )}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="h-px bg-white/[0.05]" />

                                {/* Payment */}
                                <div>
                                    <span className={sectionLabel}>Payment Method</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['cash', 'card', 'online'].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setPaymentMethod(m)}
                                                className={`p-3 rounded-lg border text-xs font-medium capitalize transition-all duration-150 ${
                                                    paymentMethod === m
                                                        ? 'border-white/25 bg-white/[0.07] text-white/80'
                                                        : 'border-white/[0.07] bg-white/[0.02] text-white/35 hover:border-white/[0.12]'
                                                }`}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* STEP 2 — Service */}
                        {step === 2 && (
                            <div className="space-y-5">
                                <div>
                                    <span className={sectionLabel}>Select Service</span>
                                    {servicesLoading ? (
                                        <div className="space-y-2">
                                            {[...Array(4)].map((_, i) => (
                                                <div key={i} className="h-16 rounded-lg bg-white/[0.03] animate-pulse" />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="space-y-1.5">
                                            {services.map((s) => (
                                                <button
                                                    key={s._id}
                                                    onClick={() => setSelectedService(s)}
                                                    className={`w-full flex items-center justify-between p-3.5 rounded-lg border text-left transition-all duration-150 ${
                                                        selectedService?._id === s._id
                                                            ? 'border-white/25 bg-white/[0.06]'
                                                            : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="text-sm text-white/80">{s.name}</p>
                                                        <p className="text-[11px] text-white/30 mt-0.5">
                                                            {s.category?.name || s.tier}
                                                            <span className="mx-1.5 text-white/15">·</span>
                                                            ₹{(s.discountPrice || s.price || 0).toLocaleString('en-IN')}
                                                        </p>
                                                    </div>
                                                    {selectedService?._id === s._id && (
                                                        <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                                                            <Check className="w-3 h-3 text-black" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* STEP 3 — Customer & Location */}
                        {step === 3 && (
                            <div className="space-y-5">
                                {/* Booking Type */}
                                <div>
                                    <span className={sectionLabel}>Booking Type</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'walkin', label: 'Walk-in', sub: 'At shop, no account' },
                                            { value: 'online', label: 'Online', sub: 'Registered customer' }
                                        ].map(({ value, label, sub }) => (
                                            <button
                                                key={value}
                                                onClick={() => {
                                                    setBookingType(value);
                                                    setSelectedCustomer(null);
                                                    setCustomerSearch('');
                                                }}
                                                className={`p-3.5 rounded-lg border text-left transition-all duration-150 ${
                                                    bookingType === value
                                                        ? 'border-white/25 bg-white/[0.06]'
                                                        : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
                                                }`}
                                            >
                                                <div className="flex items-center justify-between mb-1">
                                                    <p className="text-sm text-white/80 font-medium">{label}</p>
                                                    {bookingType === value && (
                                                        <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                                            <Check className="w-2.5 h-2.5 text-black" />
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-white/30">{sub}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Walk-in Customer Details */}
                                {bookingType === 'walkin' && (
                                    <div className="space-y-3">
                                        <FieldInput
                                            label="Customer Name *"
                                            value={walkInCustomer.name}
                                            onChange={(v) => setWalkInCustomer(p => ({ ...p, name: v }))}
                                            placeholder="Full name"
                                        />
                                        <FieldInput
                                            label="Phone"
                                            value={walkInCustomer.phone}
                                            onChange={(v) => setWalkInCustomer(p => ({ ...p, phone: v }))}
                                            placeholder="+91 XXXXX XXXXX"
                                        />
                                    </div>
                                )}

                                {/* Online Customer Search */}
                                {bookingType === 'online' && (
                                    <div className="space-y-2">
                                        <span className={sectionLabel}>Search Customer</span>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 pointer-events-none" />
                                            <input
                                                type="text"
                                                value={customerSearch}
                                                onChange={(e) => {
                                                    setCustomerSearch(e.target.value);
                                                    setSelectedCustomer(null);
                                                }}
                                                placeholder="Search by name or email…"
                                                className={`${inputCls} pl-9`}
                                            />
                                            {searchLoading && (
                                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25 animate-spin" />
                                            )}
                                        </div>

                                        {customers.length > 0 && !selectedCustomer && (
                                            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04] max-h-48 overflow-y-auto">
                                                {customers.map((c) => (
                                                    <button
                                                        key={c._id}
                                                        onClick={() => {
                                                            setSelectedCustomer(c);
                                                            setCustomerSearch(`${c.firstName} ${c.lastName}`);
                                                            setCustomers([]);
                                                        }}
                                                        className="w-full px-4 py-3 text-left hover:bg-white/[0.04] transition-colors"
                                                    >
                                                        <p className="text-sm text-white/70">{c.firstName} {c.lastName}</p>
                                                        <p className="text-[11px] text-white/30 font-mono mt-0.5">{c.email}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {selectedCustomer && (
                                            <div className="flex items-center justify-between px-3.5 py-3 rounded-lg border border-white/[0.12] bg-white/[0.05]">
                                                <div>
                                                    <p className="text-sm text-white/80 font-medium">
                                                        {selectedCustomer.firstName} {selectedCustomer.lastName}
                                                    </p>
                                                    <p className="text-[11px] text-white/30 font-mono mt-0.5">
                                                        {selectedCustomer.email}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}
                                                    className="w-6 h-6 rounded-md flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="h-px bg-white/[0.05]" />

                                {/* ✅ MOVED: Location Section */}
                                <div>
                                    <span className={sectionLabel}>Service Location</span>
                                    <div className="space-y-2.5">
                                        <FieldInput
                                            label="Address *"
                                            value={location.address}
                                            onChange={(v) => setLocation(p => ({ ...p, address: v }))}
                                            placeholder="Street address or 'Walk-in / At Shop'"
                                        />
                                        <FieldInput
                                            label="City *"
                                            value={location.city}
                                            onChange={(v) => setLocation(p => ({ ...p, city: v }))}
                                            placeholder="City"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/[0.05]" />

                                {/* Summary */}
                                <div>
                                    <span className={sectionLabel}>Summary</span>
                                    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 space-y-2.5">
                                        <SummaryRow
                                            label="Date"
                                            value={bookingDate}
                                            mono
                                        />
                                        <SummaryRow label="Time" value={timeSlot} mono />
                                        <SummaryRow label="Service" value={selectedService?.name} />
                                        <SummaryRow
                                            label="Customer"
                                            value={bookingType === 'walkin'
                                                ? walkInCustomer.name
                                                : `${selectedCustomer?.firstName || ''} ${selectedCustomer?.lastName || ''}`
                                            }
                                        />
                                        <SummaryRow 
                                            label="Location" 
                                            value={location.address !== 'Walk-in / At Shop' 
                                                ? `${location.address}, ${location.city}` 
                                                : location.address
                                            } 
                                        />
                                        <div className="h-px bg-white/[0.05]" />
                                        <SummaryRow
                                            label="Total"
                                            value={`₹${((selectedService?.discountPrice || selectedService?.price || 0)).toLocaleString('en-IN')}`}
                                            highlight
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 h-px bg-white/[0.05]" />
                    <div className="shrink-0 px-4 py-4 flex gap-2 bg-[#0a0a0a] border-t border-white/[0.05]">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                disabled={loading}
                                className="hidden sm:flex items-center px-4 py-2.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-xs text-white/40 hover:text-white/70 hover:border-white/[0.14] hover:bg-white/[0.05] transition-all duration-150 disabled:opacity-50"
                            >
                                Back
                            </button>
                        )}

                        <button
                            onClick={() => {
                                if (step < 3) {
                                    setStep(step + 1);
                                } else {
                                    handleSubmit();
                                }
                            }}
                            disabled={loading || !canProceed[step]}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 active:bg-white/80 disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed shadow-lg shadow-white/10 transition-all duration-150"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span className="hidden sm:inline">Creating…</span>
                                </>
                            ) : step < 3 ? (
                                <>
                                    <span>Next</span>
                                    <ChevronLeft className="w-4 h-4 rotate-180" />
                                </>
                            ) : (
                                'Create Booking'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

/* ── Sub-components ── */

function FieldInput({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[10px] text-white/25 uppercase tracking-widest font-medium">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={inputCls}
            />
        </div>
    );
}

function SummaryRow({ label, value, highlight, mono }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] text-white/25 shrink-0">{label}</p>
            <p className={`text-xs text-right ${
                highlight ? 'text-white font-semibold text-sm tabular-nums'
                : mono     ? 'font-mono text-white/50'
                :            'text-white/50'
            }`}>
                {value || '—'}
            </p>
        </div>
    );
}