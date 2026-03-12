'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Search, ChevronLeft, Check } from 'lucide-react';
import adminService from '@/services/adminService';
import serviceService from '@/services/serviceService';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00',
    '11:00-12:00', '12:00-13:00', '13:00-14:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00',
    '17:00-18:00'
];

const STEPS = [
    { label: 'Customer', desc: 'Who is booking?' },
    { label: 'Service',  desc: 'What service?'   },
    { label: 'Schedule', desc: 'When?'            },
    { label: 'Details',  desc: 'Final details'    }
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

export default function CreateBookingModal({ onClose, onSuccess }) {
    const [step, setStep]       = useState(1);
    const [loading, setLoading] = useState(false);

    /* Step 1 */
    const [bookingType,      setBookingType]      = useState('walkin');
    const [walkInCustomer,   setWalkInCustomer]   = useState({ name: '', phone: '' });
    const [customerSearch,   setCustomerSearch]   = useState('');
    const [customers,        setCustomers]        = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchLoading,    setSearchLoading]    = useState(false);

    /* Step 2 */
    const [services,        setServices]        = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [servicesLoading, setServicesLoading] = useState(false);

    /* Step 3 */
    const [bookingDate,          setBookingDate]          = useState('');
    const [timeSlot,             setTimeSlot]             = useState('');
    const [availability,         setAvailability]         = useState([]);
    const [availabilityLoading,  setAvailabilityLoading]  = useState(false);

    /* Step 4 */
    const [location, setLocation] = useState({
        address: 'Walk-in / At Shop', city: 'Walk-in', landmark: ''
    });
    const [specialNotes,   setSpecialNotes]   = useState('');
    const [paymentMethod,  setPaymentMethod]  = useState('cash');

    /* Load services */
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

    /* Search customers */
    useEffect(() => {
        if (bookingType !== 'online' || customerSearch.length < 2) {
            setCustomers([]); return;
        }
        const t = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const res = await adminService.getAllUsers({ search: customerSearch, limit: 5 });
                if (res.success) setCustomers(res.data.users);
            } catch { }
            finally { setSearchLoading(false); }
        }, 400);
        return () => clearTimeout(t);
    }, [customerSearch, bookingType]);

    /* Check availability */
    useEffect(() => {
        if (!selectedService || !bookingDate) return;
        (async () => {
            try {
                setAvailabilityLoading(true);
                const res = await axiosInstance.get('/bookings/availability', {
                    params: { serviceId: selectedService._id, date: bookingDate }
                });
                if (res.data.success) setAvailability(res.data.data.slots || []);
            } catch { }
            finally { setAvailabilityLoading(false); }
        })();
    }, [selectedService, bookingDate]);

    const isSlotAvailable = (slot) => {
        const found = availability.find(a => a.slot === slot);
        return found ? found.available : true;
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const payload = {
                bookingType, serviceId: selectedService._id,
                variantId: selectedVariant._id, bookingDate,
                timeSlot, location, specialNotes, paymentMethod
            };
            if (bookingType === 'walkin') payload.walkInCustomer = walkInCustomer;
            else payload.customerId = selectedCustomer._id;
            await adminService.createAdminBooking(payload);
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to create booking');
        } finally { setLoading(false); }
    };

    const canProceed = {
        1: bookingType === 'walkin' ? walkInCustomer.name.trim() : selectedCustomer !== null,
        2: selectedService && selectedVariant,
        3: bookingDate && timeSlot,
        4: true
    };

    const activeVariants = selectedService?.variants?.filter(v => v.isActive) || [];

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 hidden sm:block" onClick={onClose} />

            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
                <div className="
                    pointer-events-auto
                    w-full sm:max-w-lg sm:max-h-[92vh]
                    h-full sm:h-auto
                    flex flex-col
                    bg-[#0a0a0a]
                    sm:rounded-xl
                    border-0 sm:border sm:border-white/[0.08]
                    shadow-2xl shadow-black/80
                    overflow-hidden
                ">
                    {/* Top gradient line */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent shrink-0" />

                    {/* ── Header ── */}
                    <div className="shrink-0 flex items-center gap-3 px-4 py-4">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
                            className="
                                w-8 h-8 rounded-lg flex items-center justify-center
                                border border-white/[0.06] bg-white/[0.03]
                                text-white/35 hover:text-white/70
                                transition-all duration-150
                            "
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/25 uppercase tracking-widest">
                                Step {step} of 4
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
                            className="
                                w-8 h-8 rounded-lg flex items-center justify-center
                                border border-white/[0.06] bg-white/[0.03]
                                text-white/30 hover:text-white/70
                                transition-all duration-150
                            "
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* ── Step Indicators ── */}
                    <div className="shrink-0 px-4 pb-4">
                        {/* Progress track */}
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

                        {/* Step dots */}
                        <div className="flex items-center justify-between">
                            {STEPS.map((s, i) => (
                                <div key={s.label} className="flex items-center gap-1.5">
                                    <div className={`
                                        w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-semibold
                                        transition-all duration-200
                                        ${step === i + 1
                                            ? 'bg-white text-black shadow-lg shadow-white/20'
                                            : step > i + 1
                                            ? 'bg-white/20 text-white/60'
                                            : 'bg-white/[0.06] text-white/20'
                                        }
                                    `}>
                                        {step > i + 1
                                            ? <Check className="w-2.5 h-2.5" />
                                            : i + 1
                                        }
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

                    {/* ── Divider ── */}
                    <div className="h-px bg-white/[0.05] shrink-0" />

                    {/* ── Scrollable Content ── */}
                    <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">

                        {/* STEP 1 — Customer */}
                        {step === 1 && (
                            <div className="space-y-5">
                                <div>
                                    <span className={sectionLabel}>Booking Type</span>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { value: 'walkin', label: 'Walk-in',    sub: 'At shop, no account' },
                                            { value: 'online', label: 'Online',     sub: 'Registered customer' }
                                        ].map(({ value, label, sub }) => (
                                            <button
                                                key={value}
                                                onClick={() => {
                                                    setBookingType(value);
                                                    setSelectedCustomer(null);
                                                    setCustomerSearch('');
                                                }}
                                                className={`
                                                    p-3.5 rounded-lg border text-left transition-all duration-150
                                                    ${bookingType === value
                                                        ? 'border-white/25 bg-white/[0.06]'
                                                        : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
                                                    }
                                                `}
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

                                        {/* Results */}
                                        {customers.length > 0 && !selectedCustomer && (
                                            <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04]">
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

                                        {/* Selected */}
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
                                                    onClick={() => { setSelectedService(s); setSelectedVariant(null); }}
                                                    className={`
                                                        w-full flex items-center justify-between p-3.5 rounded-lg
                                                        border text-left transition-all duration-150
                                                        ${selectedService?._id === s._id
                                                            ? 'border-white/25 bg-white/[0.06]'
                                                            : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
                                                        }
                                                    `}
                                                >
                                                    <div>
                                                        <p className="text-sm text-white/80">{s.name}</p>
                                                        <p className="text-[11px] text-white/30 mt-0.5">
                                                            {s.category?.name || s.tier}
                                                            <span className="mx-1.5 text-white/15">·</span>
                                                            from ₹{s.startingPrice?.toLocaleString('en-IN')}
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

                                {selectedService && activeVariants.length > 0 && (
                                    <div>
                                        <div className="h-px bg-white/[0.05] mb-4" />
                                        <span className={sectionLabel}>Select Variant</span>
                                        <div className="space-y-1.5">
                                            {activeVariants.map((v) => (
                                                <button
                                                    key={v._id}
                                                    onClick={() => setSelectedVariant(v)}
                                                    className={`
                                                        w-full flex items-center justify-between p-3.5 rounded-lg
                                                        border text-left transition-all duration-150
                                                        ${selectedVariant?._id === v._id
                                                            ? 'border-white/25 bg-white/[0.06]'
                                                            : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
                                                        }
                                                    `}
                                                >
                                                    <div>
                                                        <p className="text-sm text-white/80">{v.name}</p>
                                                        <p className="text-[11px] text-white/30 mt-0.5">
                                                            {v.duration} min
                                                        </p>
                                                    </div>
                                                    <div className="text-right flex items-center gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold text-white tabular-nums">
                                                                ₹{(v.discountPrice ?? v.price)?.toLocaleString('en-IN')}
                                                            </p>
                                                            {v.discountPrice && v.discountPrice < v.price && (
                                                                <p className="text-[11px] text-white/25 line-through tabular-nums">
                                                                    ₹{v.price?.toLocaleString('en-IN')}
                                                                </p>
                                                            )}
                                                        </div>
                                                        {selectedVariant?._id === v._id && (
                                                            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center shrink-0">
                                                                <Check className="w-3 h-3 text-black" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 3 — Schedule */}
                        {step === 3 && (
                            <div className="space-y-5">
                                <div>
                                    <span className={sectionLabel}>Booking Date</span>
                                    <input
                                        type="date"
                                        value={bookingDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => { setBookingDate(e.target.value); setTimeSlot(''); }}
                                        className={`${inputCls} [color-scheme:dark]`}
                                    />
                                </div>

                                {bookingDate && (
                                    <div>
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`${sectionLabel} mb-0`}>Time Slot</span>
                                            {availabilityLoading && (
                                                <div className="flex items-center gap-1.5">
                                                    <Loader2 className="w-3 h-3 text-white/25 animate-spin" />
                                                    <span className="text-[10px] text-white/25">Checking…</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            {TIME_SLOTS.map((slot) => {
                                                const available = isSlotAvailable(slot);
                                                const selected  = timeSlot === slot;

                                                return (
                                                    <button
                                                        key={slot}
                                                        onClick={() => available && setTimeSlot(slot)}
                                                        disabled={!available}
                                                        className={`
                                                            relative p-3 rounded-lg border text-xs font-mono
                                                            transition-all duration-150
                                                            ${selected
                                                                ? 'border-white/30 bg-white/[0.08] text-white'
                                                                : !available
                                                                ? 'border-white/[0.04] bg-white/[0.01] text-white/15 cursor-not-allowed'
                                                                : 'border-white/[0.07] bg-white/[0.02] text-white/50 hover:border-white/[0.14] hover:text-white/70'
                                                            }
                                                        `}
                                                    >
                                                        {slot}
                                                        {!available && (
                                                            <span className="block text-[10px] text-white/15 mt-0.5 font-sans">
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
                            </div>
                        )}

                        {/* STEP 4 — Details */}
                        {step === 4 && (
                            <div className="space-y-5">

                                {/* Location */}
                                <div>
                                    <span className={sectionLabel}>Location</span>
                                    <div className="space-y-2.5">
                                        <FieldInput
                                            label="Address *"
                                            value={location.address}
                                            onChange={(v) => setLocation(p => ({ ...p, address: v }))}
                                            placeholder="Street address"
                                        />
                                        <FieldInput
                                            label="City *"
                                            value={location.city}
                                            onChange={(v) => setLocation(p => ({ ...p, city: v }))}
                                            placeholder="City"
                                        />
                                        <FieldInput
                                            label="Landmark"
                                            value={location.landmark}
                                            onChange={(v) => setLocation(p => ({ ...p, landmark: v }))}
                                            placeholder="Optional"
                                        />
                                    </div>
                                </div>

                                <div className="h-px bg-white/[0.05]" />

                                {/* Payment */}
                                <div>
                                    <span className={sectionLabel}>Payment Method</span>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['cash', 'card', 'online'].map((m) => (
                                            <button
                                                key={m}
                                                onClick={() => setPaymentMethod(m)}
                                                className={`
                                                    p-3 rounded-lg border text-xs font-medium capitalize
                                                    transition-all duration-150
                                                    ${paymentMethod === m
                                                        ? 'border-white/25 bg-white/[0.07] text-white/80'
                                                        : 'border-white/[0.07] bg-white/[0.02] text-white/35 hover:border-white/[0.12]'
                                                    }
                                                `}
                                            >
                                                {m}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="h-px bg-white/[0.05]" />

                                {/* Notes */}
                                <div>
                                    <label className="block text-[10px] text-white/25 uppercase tracking-widest font-medium mb-2">
                                        Special Notes
                                    </label>
                                    <textarea
                                        value={specialNotes}
                                        onChange={(e) => setSpecialNotes(e.target.value)}
                                        placeholder="Vehicle details, special requests…"
                                        rows={3}
                                        className={`${inputCls} resize-none`}
                                    />
                                </div>

                                <div className="h-px bg-white/[0.05]" />

                                {/* Summary */}
                                <div>
                                    <span className={sectionLabel}>Summary</span>
                                    <div className="rounded-lg border border-white/[0.07] bg-white/[0.02] p-4 space-y-2.5">
                                        <SummaryRow
                                            label="Customer"
                                            value={bookingType === 'walkin'
                                                ? walkInCustomer.name
                                                : `${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`
                                            }
                                        />
                                        <SummaryRow label="Service" value={selectedService?.name} />
                                        <SummaryRow label="Variant" value={selectedVariant?.name} />
                                        <SummaryRow label="Date"    value={bookingDate} mono />
                                        <SummaryRow label="Time"    value={timeSlot}    mono />
                                        <div className="h-px bg-white/[0.05]" />
                                        <SummaryRow
                                            label="Total"
                                            value={`₹${(selectedVariant?.discountPrice ?? selectedVariant?.price)?.toLocaleString('en-IN')}`}
                                            highlight
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div className="shrink-0 h-px bg-white/[0.05]" />
                    <div className="shrink-0 px-4 py-4 flex gap-2">
                        {step > 1 && (
                            <button
                                onClick={() => setStep(step - 1)}
                                className="
                                    hidden sm:flex items-center px-4 py-2.5 rounded-lg
                                    border border-white/[0.08] bg-white/[0.03]
                                    text-xs text-white/40 hover:text-white/70
                                    hover:border-white/[0.14] hover:bg-white/[0.05]
                                    transition-all duration-150
                                "
                            >
                                Back
                            </button>
                        )}

                        <button
                            onClick={() => step < 4 ? setStep(step + 1) : handleSubmit()}
                            disabled={loading || !canProceed[step]}
                            className="
                                flex-1 flex items-center justify-center gap-2
                                py-2.5 rounded-lg
                                bg-white text-black text-sm font-medium
                                hover:bg-white/90 active:bg-white/80
                                disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed
                                shadow-lg shadow-white/10
                                transition-all duration-150
                            "
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>Creating…</span>
                                </>
                            ) : step < 4 ? (
                                'Continue'
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