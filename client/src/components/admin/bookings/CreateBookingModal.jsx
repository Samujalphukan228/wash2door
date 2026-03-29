// src/components/admin/bookings/CreateBookingModal.jsx
'use client';

import { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, Search, ChevronLeft, ChevronRight, Check, Calendar, Clock, CreditCard, User, MapPin, Package, UserPlus, History, Star, Trash2 } from 'lucide-react';
import adminService from '@/services/adminService';
import serviceService from '@/services/serviceService';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

// Time slots in 12-hour format
const TIME_SLOTS = [
    '08:30 AM-10:30 AM',
    '10:30 AM-12:00 PM',
    '12:00 PM-02:30 PM',
    '02:30 PM-04:00 PM',
    '04:00 PM-05:30 PM',
];

const STEPS = [
    { label: 'Schedule', desc: 'When?', icon: Calendar },
    { label: 'Service', desc: 'What?', icon: Package },
    { label: 'Customer', desc: 'Who & Where?', icon: User }
];

// Animation variants
const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const modalVariants = {
    hidden: { opacity: 0, y: '100%' },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: { type: 'spring', damping: 30, stiffness: 300 }
    },
    exit: { 
        opacity: 0, 
        y: '100%',
        transition: { duration: 0.25 }
    }
};

const stepVariants = {
    enter: (direction) => ({
        x: direction > 0 ? 50 : -50,
        opacity: 0,
    }),
    center: {
        x: 0,
        opacity: 1,
        transition: { type: 'spring', stiffness: 300, damping: 30 }
    },
    exit: (direction) => ({
        x: direction > 0 ? -50 : 50,
        opacity: 0,
        transition: { duration: 0.2 }
    })
};

// Utility functions
function convertTo24Hour(time12) {
    const [time, period] = time12.split(' ');
    let [hours] = time.split(':').map(Number);
    if (period === 'PM' && hours !== 12) hours += 12;
    else if (period === 'AM' && hours === 12) hours = 0;
    return hours;
}

function isSlotPassed(slot, selectedDate) {
    const now = new Date();
    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    
    if (selectedDate > todayStr) return false;
    if (selectedDate < todayStr) return true;

    const startHour = convertTo24Hour(slot.split('-')[0].trim());
    const currentHour = now.getHours();
    
    return currentHour >= startHour;
}

function getTodayString() {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
}

// Sub-components
const InputField = memo(function InputField({ label, value, onChange, placeholder, type = 'text', required }) {
    return (
        <div className="space-y-2">
            <label className="block text-[10px] text-white/30 uppercase tracking-widest font-medium">
                {label} {required && <span className="text-white/50">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-white/[0.03] border border-white/[0.08] text-white/80 text-sm placeholder-white/20 px-4 py-3 rounded-xl focus:outline-none focus:border-white/20 focus:bg-white/[0.05] transition-all duration-150"
            />
        </div>
    );
});

const TimeSlotButton = memo(function TimeSlotButton({ slot, selected, disabled, passed, booked, onClick }) {
    return (
        <motion.button
            onClick={onClick}
            disabled={disabled}
            className={`
                relative p-3.5 rounded-xl border text-xs font-medium transition-all duration-150
                ${selected
                    ? 'border-white/30 bg-white/[0.1] text-white shadow-lg shadow-white/5'
                    : disabled
                    ? 'border-white/[0.04] bg-white/[0.01] text-white/20 cursor-not-allowed'
                    : 'border-white/[0.08] bg-white/[0.02] text-white/60 hover:border-white/[0.15] hover:text-white/80 hover:bg-white/[0.04]'
                }
            `}
            whileTap={!disabled ? { scale: 0.98 } : {}}
        >
            <span className="block">{slot}</span>
            {passed && (
                <span className="block text-[10px] text-white/20 mt-1">Passed</span>
            )}
            {!passed && booked && (
                <span className="block text-[10px] text-white/20 mt-1">Booked</span>
            )}
            <AnimatePresence>
                {selected && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute top-2 right-2 w-4 h-4 rounded-full bg-white flex items-center justify-center"
                    >
                        <Check className="w-2.5 h-2.5 text-black" />
                    </motion.span>
                )}
            </AnimatePresence>
        </motion.button>
    );
});

const ServiceCard = memo(function ServiceCard({ service, selected, onClick }) {
    return (
        <motion.button
            onClick={onClick}
            className={`
                w-full flex items-center justify-between p-4 rounded-xl border text-left transition-all duration-150
                ${selected
                    ? 'border-white/25 bg-white/[0.08] shadow-lg'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
                }
            `}
            whileTap={{ scale: 0.99 }}
        >
            <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${selected ? 'text-white' : 'text-white/80'}`}>
                    {service.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-white/30">{service.category?.name || service.tier}</span>
                    <span className="text-white/10">·</span>
                    <span className="text-[11px] text-white/50 font-medium">
                        ₹{(service.discountPrice || service.price || 0).toLocaleString('en-IN')}
                    </span>
                </div>
            </div>
            <AnimatePresence>
                {selected && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="w-6 h-6 rounded-full bg-white flex items-center justify-center shrink-0 ml-3"
                    >
                        <Check className="w-3.5 h-3.5 text-black" />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
});

// Walk-in Customer Card
const WalkInCustomerCard = memo(function WalkInCustomerCard({ customer, selected, onSelect, onDelete, deleting }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`
                flex items-center justify-between p-3 rounded-xl border transition-all
                ${selected
                    ? 'border-emerald-500/30 bg-emerald-500/[0.08]'
                    : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
                }
            `}
        >
            <button
                onClick={() => onSelect(customer)}
                className="flex-1 flex items-center gap-3 text-left"
            >
                <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                    <span className="text-sm font-semibold text-white/60">
                        {customer.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className={`text-sm font-medium truncate ${selected ? 'text-white' : 'text-white/80'}`}>
                            {customer.name}
                        </p>
                        {customer.totalBookings > 0 && (
                            <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-emerald-500/15 text-[9px] text-emerald-400 font-medium">
                                <Star className="w-2.5 h-2.5" />
                                {customer.totalBookings}
                            </span>
                        )}
                    </div>
                    <p className="text-[11px] text-white/40 font-mono truncate">
                        {customer.phone}
                    </p>
                </div>
                {selected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-white" />
                    </div>
                )}
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete(customer._id);
                }}
                disabled={deleting}
                className="ml-2 w-7 h-7 rounded-lg flex items-center justify-center text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
            >
                {deleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                )}
            </button>
        </motion.div>
    );
});

const SummaryRow = memo(function SummaryRow({ label, value, highlight, mono }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[11px] text-white/30 shrink-0">{label}</span>
            <span className={`text-xs text-right truncate ${
                highlight ? 'text-white font-semibold text-sm'
                : mono ? 'font-mono text-white/60'
                : 'text-white/60'
            }`}>
                {value || '—'}
            </span>
        </div>
    );
});

const StepIndicator = memo(function StepIndicator({ steps, currentStep }) {
    return (
        <div className="px-4 pb-4 space-y-3">
            <div className="relative flex items-center gap-1">
                {steps.map((_, i) => (
                    <motion.div
                        key={i}
                        className="h-1 flex-1 rounded-full overflow-hidden bg-white/[0.06]"
                    >
                        <motion.div
                            className="h-full bg-white/60 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: i + 1 <= currentStep ? '100%' : '0%' }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                        />
                    </motion.div>
                ))}
            </div>

            <div className="flex items-center justify-between">
                {steps.map((step, i) => {
                    const Icon = step.icon;
                    const isActive = currentStep === i + 1;
                    const isCompleted = currentStep > i + 1;
                    
                    return (
                        <div key={step.label} className="flex items-center gap-2">
                            <motion.div
                                className={`
                                    w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold
                                    ${isActive
                                        ? 'bg-white text-black shadow-lg shadow-white/20'
                                        : isCompleted
                                        ? 'bg-white/20 text-white/70'
                                        : 'bg-white/[0.06] text-white/25'
                                    }
                                `}
                                animate={{ scale: isActive ? 1.1 : 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                            >
                                {isCompleted ? <Check className="w-3 h-3" /> : <Icon className="w-3 h-3" />}
                            </motion.div>
                            <span className={`text-[10px] transition-colors ${
                                isActive ? 'text-white/70' : 'text-white/25'
                            }`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});

export default function CreateBookingModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(0);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Step 1 - Schedule
    const [bookingDate, setBookingDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [availability, setAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // Step 2 - Service
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [servicesLoading, setServicesLoading] = useState(false);

    // Step 3 - Customer & Location
    const [bookingType, setBookingType] = useState('walkin');
    const [walkInCustomer, setWalkInCustomer] = useState({ name: '', phone: '' });
    const [customerSearch, setCustomerSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [location, setLocation] = useState({ address: 'Walk-in / At Shop', city: 'Duliajan' });

    // Walk-in customers from DB
    const [walkinSearch, setWalkinSearch] = useState('');
    const [savedWalkinCustomers, setSavedWalkinCustomers] = useState([]);
    const [recentWalkinCustomers, setRecentWalkinCustomers] = useState([]);
    const [walkinSearchLoading, setWalkinSearchLoading] = useState(false);
    const [selectedWalkinCustomer, setSelectedWalkinCustomer] = useState(null);
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [deletingCustomerId, setDeletingCustomerId] = useState(null);

    // Refresh time every minute
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    // Load services
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

    // Load recent walk-in customers
    useEffect(() => {
        if (bookingType === 'walkin') {
            (async () => {
                try {
                    const res = await adminService.getRecentWalkInCustomers(5);
                    if (res.success) setRecentWalkinCustomers(res.data || []);
                } catch (error) {
                    console.error('Failed to load recent customers:', error);
                }
            })();
        }
    }, [bookingType]);

    // Search walk-in customers
    useEffect(() => {
        if (bookingType !== 'walkin' || walkinSearch.length < 2) {
            setSavedWalkinCustomers([]);
            return;
        }

        const t = setTimeout(async () => {
            setWalkinSearchLoading(true);
            try {
                const res = await adminService.searchWalkInCustomers(walkinSearch);
                if (res.success) setSavedWalkinCustomers(res.data || []);
                else setSavedWalkinCustomers([]);
            } catch {
                setSavedWalkinCustomers([]);
            } finally {
                setWalkinSearchLoading(false);
            }
        }, 400);

        return () => clearTimeout(t);
    }, [walkinSearch, bookingType]);

    // Search online customers
    useEffect(() => {
        if (bookingType !== 'online' || customerSearch.length < 2) {
            setCustomers([]);
            return;
        }
        const t = setTimeout(async () => {
            setSearchLoading(true);
            try {
                const res = await adminService.getAllUsers({ search: customerSearch, limit: 5 });
                if (res.success) setCustomers(res.data.users || []);
                else setCustomers([]);
            } catch {
                setCustomers([]);
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(t);
    }, [customerSearch, bookingType]);

    // Check availability
    useEffect(() => {
        if (!bookingDate) return;
        (async () => {
            try {
                setAvailabilityLoading(true);
                const res = await axiosInstance.get('/bookings/availability', { params: { date: bookingDate } });
                if (res.data.success) setAvailability(res.data.data.slots || []);
            } catch {
                setAvailability([]);
            } finally {
                setAvailabilityLoading(false);
            }
        })();
    }, [bookingDate]);

    // Clear passed time slot
    useEffect(() => {
        if (timeSlot && bookingDate && isSlotPassed(timeSlot, bookingDate)) {
            setTimeSlot('');
        }
    }, [currentTime, timeSlot, bookingDate]);

    const isSlotAvailable = useCallback((slot) => {
        const found = availability.find(a => a.slot === slot);
        return found ? found.available : true;
    }, [availability]);

    const canProceed = useMemo(() => ({
        1: bookingDate && timeSlot,
        2: selectedService !== null,
        3: (bookingType === 'walkin' 
            ? (selectedWalkinCustomer !== null || (showNewCustomerForm && walkInCustomer.name.trim() && walkInCustomer.phone.trim()))
            : selectedCustomer !== null) &&
            location.address.trim() && location.city.trim()
    }), [bookingDate, timeSlot, selectedService, bookingType, walkInCustomer, selectedCustomer, selectedWalkinCustomer, showNewCustomerForm, location]);

    const goToStep = useCallback((newStep) => {
        setDirection(newStep > step ? 1 : -1);
        setStep(newStep);
    }, [step]);

    // Handle select walk-in customer
    const handleSelectWalkinCustomer = useCallback((customer) => {
        setSelectedWalkinCustomer(customer);
        setWalkInCustomer({ name: customer.name, phone: customer.phone });
        setShowNewCustomerForm(false);
        setWalkinSearch('');
        setSavedWalkinCustomers([]);
    }, []);

    // Handle delete walk-in customer
    const handleDeleteWalkinCustomer = useCallback(async (customerId) => {
        try {
            setDeletingCustomerId(customerId);
            await adminService.deleteWalkInCustomer(customerId);
            
            // Remove from lists
            setSavedWalkinCustomers(prev => prev.filter(c => c._id !== customerId));
            setRecentWalkinCustomers(prev => prev.filter(c => c._id !== customerId));
            
            // Clear selection if deleted
            if (selectedWalkinCustomer?._id === customerId) {
                setSelectedWalkinCustomer(null);
                setWalkInCustomer({ name: '', phone: '' });
            }
            
            toast.success('Customer deleted');
        } catch (error) {
            toast.error('Failed to delete customer');
        } finally {
            setDeletingCustomerId(null);
        }
    }, [selectedWalkinCustomer]);

    // Show new customer form
    const handleShowNewForm = useCallback(() => {
        setShowNewCustomerForm(true);
        setSelectedWalkinCustomer(null);
        setWalkInCustomer({ name: '', phone: '' });
    }, []);

    const handleSubmit = useCallback(async () => {
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
    }, [bookingType, selectedService, bookingDate, timeSlot, location, paymentMethod, walkInCustomer, selectedCustomer, onSuccess]);

    const handleNext = useCallback(() => {
        if (step < 3) {
            goToStep(step + 1);
        } else {
            handleSubmit();
        }
    }, [step, goToStep, handleSubmit]);

    const handleBack = useCallback(() => {
        if (step > 1) {
            goToStep(step - 1);
        } else {
            onClose();
        }
    }, [step, goToStep, onClose]);

    const todayString = useMemo(() => getTodayString(), []);
    const isToday = bookingDate === todayString;

    // Customers to display (search results or recent)
    const displayWalkinCustomers = walkinSearch.length >= 2 ? savedWalkinCustomers : recentWalkinCustomers;

    return (
        <>
            {/* Backdrop */}
            <motion.div
                className="fixed inset-0 bg-black/80 z-50"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={onClose}
            />

            {/* Modal */}
            <motion.div
                className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none"
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
            >
                <motion.div
                    className="pointer-events-auto w-full h-[100dvh] sm:h-auto sm:max-w-lg sm:max-h-[92vh] flex flex-col bg-[#0a0a0a] sm:rounded-2xl border-0 sm:border sm:border-white/[0.08] shadow-2xl overflow-hidden"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top gradient */}
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent shrink-0" />

                    {/* Header */}
                    <div className="shrink-0 flex items-center gap-3 px-4 py-4">
                        <motion.button
                            onClick={handleBack}
                            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.08] bg-white/[0.03] text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition-all"
                            whileTap={{ scale: 0.95 }}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </motion.button>

                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                Step {step} of 3
                            </p>
                            <p className="text-sm font-medium text-white/90 mt-0.5 flex items-center gap-2">
                                {STEPS[step - 1].label}
                                <span className="text-white/30 font-normal text-xs">
                                    {STEPS[step - 1].desc}
                                </span>
                            </p>
                        </div>

                        <motion.button
                            onClick={onClose}
                            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/[0.08] bg-white/[0.03] text-white/30 hover:text-white/70 transition-all"
                            whileTap={{ scale: 0.95 }}
                        >
                            <X className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Step Indicator */}
                    <StepIndicator steps={STEPS} currentStep={step} />

                    <div className="h-px bg-white/[0.05] shrink-0" />

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto relative">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.div
                                key={step}
                                custom={direction}
                                variants={stepVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                className="px-4 py-5 space-y-6 pb-28 sm:pb-6"
                            >
                                {/* STEP 1 - Schedule */}
                                {step === 1 && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                                <Calendar className="w-3 h-3" />
                                                Booking Date
                                            </label>
                                            <input
                                                type="date"
                                                value={bookingDate}
                                                min={todayString}
                                                onChange={(e) => { setBookingDate(e.target.value); setTimeSlot(''); }}
                                                className="w-full bg-white/[0.03] border border-white/[0.08] text-white/80 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-white/20 transition-all [color-scheme:dark]"
                                            />
                                        </div>

                                        <AnimatePresence>
                                            {bookingDate && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="space-y-3"
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <label className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                                            <Clock className="w-3 h-3" />
                                                            Time Slot
                                                        </label>
                                                        <div className="flex items-center gap-3">
                                                            {isToday && (
                                                                <span className="text-[10px] text-white/25 font-mono">
                                                                    {currentTime.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                                </span>
                                                            )}
                                                            {availabilityLoading && (
                                                                <Loader2 className="w-3 h-3 text-white/25 animate-spin" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        {TIME_SLOTS.map((slot) => {
                                                            const available = isSlotAvailable(slot);
                                                            const passed = isSlotPassed(slot, bookingDate);
                                                            return (
                                                                <TimeSlotButton
                                                                    key={slot}
                                                                    slot={slot}
                                                                    selected={timeSlot === slot}
                                                                    disabled={!available || passed}
                                                                    passed={passed}
                                                                    booked={!available && !passed}
                                                                    onClick={() => setTimeSlot(slot)}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="h-px bg-white/[0.05]" />

                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                                <CreditCard className="w-3 h-3" />
                                                Payment Method
                                            </label>
                                            <div className="grid grid-cols-3 gap-2">
                                                {['cash', 'card', 'online'].map((m) => (
                                                    <motion.button
                                                        key={m}
                                                        onClick={() => setPaymentMethod(m)}
                                                        className={`
                                                            p-3 rounded-xl border text-xs font-medium capitalize transition-all
                                                            ${paymentMethod === m
                                                                ? 'border-white/25 bg-white/[0.08] text-white/90'
                                                                : 'border-white/[0.07] bg-white/[0.02] text-white/40 hover:border-white/[0.12]'
                                                            }
                                                        `}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        {m}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}

                                {/* STEP 2 - Service */}
                                {step === 2 && (
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                            <Package className="w-3 h-3" />
                                            Select Service
                                        </label>

                                        {servicesLoading ? (
                                            <div className="space-y-2">
                                                {[...Array(4)].map((_, i) => (
                                                    <div key={i} className="h-[72px] rounded-xl bg-white/[0.03] animate-pulse" />
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                                                {services.map((s, i) => (
                                                    <motion.div
                                                        key={s._id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.03 }}
                                                    >
                                                        <ServiceCard
                                                            service={s}
                                                            selected={selectedService?._id === s._id}
                                                            onClick={() => setSelectedService(s)}
                                                        />
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* STEP 3 - Customer & Location */}
                                {step === 3 && (
                                    <>
                                        {/* Booking Type */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                                <User className="w-3 h-3" />
                                                Booking Type
                                            </label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {[
                                                    { value: 'walkin', label: 'Walk-in', desc: 'At shop' },
                                                    { value: 'online', label: 'Online', desc: 'Registered' }
                                                ].map(({ value, label, desc }) => (
                                                    <motion.button
                                                        key={value}
                                                        onClick={() => {
                                                            setBookingType(value);
                                                            setSelectedCustomer(null);
                                                            setCustomerSearch('');
                                                            setSelectedWalkinCustomer(null);
                                                            setWalkinSearch('');
                                                            setShowNewCustomerForm(false);
                                                            setWalkInCustomer({ name: '', phone: '' });
                                                        }}
                                                        className={`
                                                            p-4 rounded-xl border text-left transition-all
                                                            ${bookingType === value
                                                                ? 'border-white/25 bg-white/[0.08]'
                                                                : 'border-white/[0.07] bg-white/[0.02] hover:border-white/[0.12]'
                                                            }
                                                        `}
                                                        whileTap={{ scale: 0.98 }}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <span className={`text-sm font-medium ${bookingType === value ? 'text-white' : 'text-white/70'}`}>
                                                                {label}
                                                            </span>
                                                            {bookingType === value && (
                                                                <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center">
                                                                    <Check className="w-2.5 h-2.5 text-black" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <span className="text-[11px] text-white/30">{desc}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Walk-in Customer */}
                                        <AnimatePresence mode="wait">
                                            {bookingType === 'walkin' && (
                                                <motion.div
                                                    key="walkin"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-4"
                                                >
                                                    {/* Search */}
                                                    <div className="space-y-2">
                                                        <label className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                                            <History className="w-3 h-3" />
                                                            {walkinSearch.length >= 2 ? 'Search Results' : 'Recent Customers'}
                                                        </label>
                                                        <div className="relative">
                                                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                                            <input
                                                                type="text"
                                                                value={walkinSearch}
                                                                onChange={(e) => setWalkinSearch(e.target.value)}
                                                                placeholder="Search by name or phone..."
                                                                className="w-full bg-white/[0.03] border border-white/[0.08] text-white/80 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-white/20 transition-all"
                                                            />
                                                            {walkinSearchLoading && (
                                                                <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 animate-spin" />
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Customer List */}
                                                    {!showNewCustomerForm && displayWalkinCustomers.length > 0 && (
                                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                                            {displayWalkinCustomers.map((customer) => (
                                                                <WalkInCustomerCard
                                                                    key={customer._id}
                                                                    customer={customer}
                                                                    selected={selectedWalkinCustomer?._id === customer._id}
                                                                    onSelect={handleSelectWalkinCustomer}
                                                                    onDelete={handleDeleteWalkinCustomer}
                                                                    deleting={deletingCustomerId === customer._id}
                                                                />
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* No results */}
                                                    {!showNewCustomerForm && displayWalkinCustomers.length === 0 && walkinSearch.length >= 2 && !walkinSearchLoading && (
                                                        <div className="text-center py-4">
                                                            <p className="text-xs text-white/40">No customers found</p>
                                                        </div>
                                                    )}

                                                    {/* Add New Button */}
                                                    {!showNewCustomerForm && (
                                                        <motion.button
                                                            onClick={handleShowNewForm}
                                                            className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/[0.15] bg-white/[0.02] text-white/50 hover:text-white/80 hover:border-white/[0.25] hover:bg-white/[0.04] transition-all"
                                                            whileTap={{ scale: 0.98 }}
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                            <span className="text-xs font-medium">Add New Customer</span>
                                                        </motion.button>
                                                    )}

                                                    {/* New Customer Form */}
                                                    {showNewCustomerForm && (
                                                        <motion.div
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="space-y-3 p-4 rounded-xl border border-white/[0.1] bg-white/[0.02]"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <span className="text-xs text-white/50 font-medium">New Customer</span>
                                                                <button
                                                                    onClick={() => {
                                                                        setShowNewCustomerForm(false);
                                                                        setWalkInCustomer({ name: '', phone: '' });
                                                                    }}
                                                                    className="text-[10px] text-white/30 hover:text-white/60"
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </div>
                                                            <InputField
                                                                label="Customer Name"
                                                                value={walkInCustomer.name}
                                                                onChange={(v) => setWalkInCustomer(p => ({ ...p, name: v }))}
                                                                placeholder="Full name"
                                                                required
                                                            />
                                                            <InputField
                                                                label="Phone"
                                                                value={walkInCustomer.phone}
                                                                onChange={(v) => setWalkInCustomer(p => ({ ...p, phone: v }))}
                                                                placeholder="+91 XXXXX XXXXX"
                                                                required
                                                            />
                                                            <p className="text-[10px] text-white/30 flex items-center gap-1">
                                                                <Star className="w-3 h-3" />
                                                                Customer will be saved for future bookings
                                                            </p>
                                                        </motion.div>
                                                    )}

                                                    {/* Selected Customer Display */}
                                                    {selectedWalkinCustomer && !showNewCustomerForm && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="flex items-center justify-between px-4 py-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05]"
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm text-white font-medium">
                                                                        {selectedWalkinCustomer.name}
                                                                    </p>
                                                                    <p className="text-[11px] text-white/40 font-mono">
                                                                        {selectedWalkinCustomer.phone}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedWalkinCustomer(null);
                                                                    setWalkInCustomer({ name: '', phone: '' });
                                                                }}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )}

                                            {/* Online Customer Search */}
                                            {bookingType === 'online' && (
                                                <motion.div
                                                    key="online"
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="space-y-3"
                                                >
                                                    <label className="block text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                                        Search Customer
                                                    </label>
                                                    <div className="relative">
                                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
                                                        <input
                                                            type="text"
                                                            value={customerSearch}
                                                            onChange={(e) => {
                                                                setCustomerSearch(e.target.value);
                                                                setSelectedCustomer(null);
                                                            }}
                                                            placeholder="Search by name or email…"
                                                            className="w-full bg-white/[0.03] border border-white/[0.08] text-white/80 text-sm pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:border-white/20 transition-all"
                                                        />
                                                        {searchLoading && (
                                                            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25 animate-spin" />
                                                        )}
                                                    </div>

                                                    <AnimatePresence>
                                                        {customers.length > 0 && !selectedCustomer && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                exit={{ opacity: 0, y: -10 }}
                                                                className="rounded-xl border border-white/[0.07] bg-white/[0.02] overflow-hidden divide-y divide-white/[0.04] max-h-48 overflow-y-auto"
                                                            >
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
                                                                        <p className="text-sm text-white/80">{c.firstName} {c.lastName}</p>
                                                                        <p className="text-[11px] text-white/30 font-mono mt-0.5">{c.email}</p>
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>

                                                    {selectedCustomer && (
                                                        <motion.div
                                                            initial={{ opacity: 0, scale: 0.95 }}
                                                            animate={{ opacity: 1, scale: 1 }}
                                                            className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/[0.15] bg-white/[0.05]"
                                                        >
                                                            <div>
                                                                <p className="text-sm text-white/90 font-medium">
                                                                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                                                                </p>
                                                                <p className="text-[11px] text-white/40 font-mono mt-0.5">
                                                                    {selectedCustomer.email}
                                                                </p>
                                                            </div>
                                                            <button
                                                                onClick={() => { setSelectedCustomer(null); setCustomerSearch(''); }}
                                                                className="w-7 h-7 rounded-lg flex items-center justify-center text-white/30 hover:text-white/70 hover:bg-white/[0.08] transition-all"
                                                            >
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        <div className="h-px bg-white/[0.05]" />

                                        {/* Location */}
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-2 text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                                <MapPin className="w-3 h-3" />
                                                Service Location
                                            </label>
                                            <InputField
                                                label="Address"
                                                value={location.address}
                                                onChange={(v) => setLocation(p => ({ ...p, address: v }))}
                                                placeholder="Street address or 'Walk-in / At Shop'"
                                                required
                                            />
                                            <InputField
                                                label="City"
                                                value={location.city}
                                                onChange={(v) => setLocation(p => ({ ...p, city: v }))}
                                                placeholder="City"
                                                required
                                            />
                                        </div>

                                        <div className="h-px bg-white/[0.05]" />

                                        {/* Summary */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] text-white/30 uppercase tracking-widest font-medium">
                                                Summary
                                            </label>
                                            <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 space-y-2.5">
                                                <SummaryRow label="Date" value={bookingDate} mono />
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
                                                    value={`₹${(selectedService?.discountPrice || selectedService?.price || 0).toLocaleString('en-IN')}`}
                                                    highlight
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 border-t border-white/[0.05] bg-[#0a0a0a]/95 backdrop-blur-sm">
                        <div className="px-4 py-4 flex gap-2">
                            {step > 1 && (
                                <motion.button
                                    onClick={() => goToStep(step - 1)}
                                    disabled={loading}
                                    className="hidden sm:flex items-center gap-2 px-5 py-3 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-white/50 hover:text-white/80 hover:border-white/[0.15] transition-all disabled:opacity-50"
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                    Back
                                </motion.button>
                            )}

                            <motion.button
                                onClick={handleNext}
                                disabled={loading || !canProceed[step]}
                                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white text-black text-sm font-medium hover:bg-white/90 active:bg-white/80 disabled:bg-white/10 disabled:text-white/25 disabled:cursor-not-allowed shadow-lg shadow-white/10 transition-all"
                                whileTap={{ scale: 0.98 }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Creating…</span>
                                    </>
                                ) : step < 3 ? (
                                    <>
                                        <span>Continue</span>
                                        <ChevronRight className="w-4 h-4" />
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        <span>Create Booking</span>
                                    </>
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}