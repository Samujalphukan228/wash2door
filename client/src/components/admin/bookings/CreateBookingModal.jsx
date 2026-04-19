'use client';

import { useState, useEffect, useCallback, memo } from 'react';
import {
    X, Loader2, Search, ChevronLeft, ChevronRight, Check,
    Calendar, Clock, CreditCard, User, MapPin, Package,
    UserPlus, History, Star, Trash2, Pencil, Save,
    Settings, Plus, Filter, MoreHorizontal, Edit2,
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

const sortTimeSlots = (slots) => {
    return [...slots].sort((a, b) => {
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
};

const ALL_TIME_SLOTS = sortTimeSlots([...REGULAR_TIME_SLOTS, ...ADMIN_ONLY_SLOTS]);

const STEPS = [
    { key: 'customer', label: 'Customer', icon: User },
    { key: 'service', label: 'Service', icon: Package },
    { key: 'schedule', label: 'Schedule', icon: Calendar },
];

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

// ============================================
// DELETE CONFIRMATION POPUP
// ============================================

function DeleteConfirmPopup({ customer, onConfirm, onCancel, loading }) {
    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 z-[60]" onClick={onCancel} />

            {/* Popup */}
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-[280px] bg-neutral-950 border border-white/[0.08] rounded-2xl p-4 space-y-4">

                {/* Icon + Title */}
                <div className="flex flex-col items-center text-center gap-2 pt-1">
                    <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                        <Trash2 className="w-4 h-4 text-white/40" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold text-white">Delete Customer?</p>
                        <p className="text-[10px] text-white/30 mt-0.5">
                            This will permanently remove this customer
                        </p>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                    <div className="w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center text-[10px] font-semibold text-white/50 shrink-0">
                        {customer.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium text-white/80 truncate">
                            {customer.name}
                        </p>
                        <p className="text-[9px] text-white/30 font-mono truncate">
                            {customer.phone}
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.09] text-white/60 text-[11px] font-medium transition-colors disabled:opacity-40"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 py-2.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-white/80 text-[11px] font-semibold transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 className="w-3 h-3" />
                                Delete
                            </>
                        )}
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

    // Customer state
    const [walkInCustomer, setWalkInCustomer] = useState({ name: '', phone: '', address: '', city: 'Duliajan' });
    const [location, setLocation] = useState({ address: 'Walk-in / At Shop', city: 'Duliajan' });
    const [saveToDb, setSaveToDb] = useState(true);
    const [walkinSearch, setWalkinSearch] = useState('');
    const [savedWalkinCustomers, setSavedWalkinCustomers] = useState([]);
    const [recentWalkinCustomers, setRecentWalkinCustomers] = useState([]);
    const [walkinSearchLoading, setWalkinSearchLoading] = useState(false);
    const [selectedWalkinCustomer, setSelectedWalkinCustomer] = useState(null);
    const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);
    const [deletingCustomerId, setDeletingCustomerId] = useState(null);
    const [deleteConfirmCustomer, setDeleteConfirmCustomer] = useState(null);
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', city: '' });
    const [editLoading, setEditLoading] = useState(false);

    // Service state
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [servicesLoading, setServicesLoading] = useState(false);
    const [serviceSearch, setServiceSearch] = useState('');

    // Schedule state
    const [bookingDate, setBookingDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [availability, setAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // ============================================
    // EFFECTS
    // ============================================

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

    useEffect(() => {
        (async () => {
            try {
                const res = await adminService.getRecentWalkInCustomers(5);
                if (res.success) setRecentWalkinCustomers(res.data || []);
            } catch (error) {
                console.error(error);
            }
        })();
    }, []);

    useEffect(() => {
        if (walkinSearch.length < 2) {
            setSavedWalkinCustomers([]);
            return;
        }
        const t = setTimeout(async () => {
            setWalkinSearchLoading(true);
            try {
                const res = await adminService.searchWalkInCustomers(walkinSearch);
                setSavedWalkinCustomers(res.success ? (res.data || []) : []);
            } catch {
                setSavedWalkinCustomers([]);
            } finally {
                setWalkinSearchLoading(false);
            }
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
            } catch {
                setAvailability([]);
            } finally {
                setAvailabilityLoading(false);
            }
        })();
    }, [bookingDate]);

    // ============================================
    // HANDLERS
    // ============================================

    const handleSelectWalkinCustomer = useCallback((customer) => {
        setSelectedWalkinCustomer(customer);
        setWalkInCustomer({
            name: customer.name,
            phone: customer.phone,
            address: customer.address || '',
            city: customer.city || 'Duliajan',
        });
        setLocation({
            address: customer.address || 'Walk-in / At Shop',
            city: customer.city || 'Duliajan',
        });
        setShowNewCustomerForm(false);
        setWalkinSearch('');
    }, []);

    const handleClearCustomer = useCallback(() => {
        setSelectedWalkinCustomer(null);
        setWalkInCustomer({ name: '', phone: '', address: '', city: 'Duliajan' });
        setLocation({ address: 'Walk-in / At Shop', city: 'Duliajan' });
    }, []);

    // Opens the confirm popup instead of deleting immediately
    const handleDeleteWalkinCustomer = useCallback((customer) => {
        setDeleteConfirmCustomer(customer);
    }, []);

    // Called when admin confirms deletion in the popup
    const handleConfirmDelete = useCallback(async () => {
        const customer = deleteConfirmCustomer;
        if (!customer) return;
        try {
            setDeletingCustomerId(customer._id);
            await adminService.deleteWalkInCustomer(customer._id);
            setSavedWalkinCustomers((prev) => prev.filter((c) => c._id !== customer._id));
            setRecentWalkinCustomers((prev) => prev.filter((c) => c._id !== customer._id));
            if (selectedWalkinCustomer?._id === customer._id) handleClearCustomer();
            toast.success('Customer deleted');
            setDeleteConfirmCustomer(null);
        } catch {
            toast.error('Failed to delete');
        } finally {
            setDeletingCustomerId(null);
        }
    }, [deleteConfirmCustomer, selectedWalkinCustomer, handleClearCustomer]);

    const handleSaveEdit = useCallback(async () => {
        try {
            setEditLoading(true);
            const res = await adminService.updateWalkInCustomer(editingCustomer._id, editForm);
            if (res.success) {
                const updated = res.data;
                setRecentWalkinCustomers((prev) =>
                    prev.map((c) => (c._id === updated._id ? updated : c))
                );
                if (selectedWalkinCustomer?._id === updated._id)
                    handleSelectWalkinCustomer(updated);
                toast.success('Updated!');
                setEditingCustomer(null);
            }
        } catch {
            toast.error('Failed to update');
        } finally {
            setEditLoading(false);
        }
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
                walkInCustomer: {
                    name: walkInCustomer.name,
                    phone: walkInCustomer.phone,
                },
                phone: walkInCustomer.phone,
                saveCustomer: selectedWalkinCustomer ? false : saveToDb,
            };
            await adminService.createAdminBooking(payload);
            toast.success('Booking created!');
            onSuccess();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error');
        } finally {
            setLoading(false);
        }
    }, [selectedService, bookingDate, timeSlot, location, paymentMethod, walkInCustomer, selectedWalkinCustomer, saveToDb, onSuccess]);

    const goToStep = (s) => setStep(s);

    const canProceed = {
        1: (selectedWalkinCustomer || (showNewCustomerForm && walkInCustomer.name && walkInCustomer.phone)) && location.address,
        2: !!selectedService,
        3: !!bookingDate && !!timeSlot,
    };

    const filteredServices = serviceSearch
        ? services.filter((s) =>
              s.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
              s.category?.name?.toLowerCase().includes(serviceSearch.toLowerCase())
          )
        : services;

    const customersList = walkinSearch.length >= 2 ? savedWalkinCustomers : recentWalkinCustomers;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50" onClick={onClose} />

            {/* Modal */}
            <div className="fixed inset-2 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-[460px] sm:max-h-[85vh] bg-neutral-950 rounded-2xl overflow-hidden z-50 flex flex-col border border-white/[0.08]">

                {/* Header */}
                <div className="shrink-0 px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            {step > 1 ? (
                                <button
                                    onClick={() => goToStep(step - 1)}
                                    className="w-8 h-8 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] flex items-center justify-center transition-colors"
                                >
                                    <ChevronLeft className="w-4 h-4 text-white/60" />
                                </button>
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                                    <Calendar className="w-4 h-4 text-white/80" />
                                </div>
                            )}
                            <div>
                                <h2 className="text-sm font-semibold text-white">New Booking</h2>
                                <p className="text-[10px] text-white/40">
                                    Step {step} of 3 · {STEPS[step - 1].label}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 rounded-lg hover:bg-white/[0.06] flex items-center justify-center transition-colors"
                        >
                            <X className="w-3.5 h-3.5 text-white/40" />
                        </button>
                    </div>

                    {/* Step Indicator */}
                    <div className="flex gap-1 p-1 bg-white/[0.04] rounded-lg">
                        {STEPS.map((s, i) => (
                            <button
                                key={s.key}
                                onClick={() => {
                                    if (i + 1 < step) goToStep(i + 1);
                                }}
                                disabled={i + 1 > step}
                                className={`
                                    flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium rounded-md transition-all
                                    ${step === i + 1
                                        ? 'bg-white/10 text-white'
                                        : i + 1 < step
                                            ? 'text-white/50 hover:text-white/70 cursor-pointer'
                                            : 'text-white/20 cursor-not-allowed'
                                    }
                                `}
                            >
                                {i + 1 < step ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                ) : (
                                    <s.icon className="w-3 h-3" />
                                )}
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
                            showNewCustomerForm={showNewCustomerForm}
                            setShowNewCustomerForm={setShowNewCustomerForm}
                            walkInCustomer={walkInCustomer}
                            setWalkInCustomer={setWalkInCustomer}
                            saveToDb={saveToDb}
                            setSaveToDb={setSaveToDb}
                            onClearCustomer={handleClearCustomer}
                            location={location}
                            setLocation={setLocation}
                            editingCustomer={editingCustomer}
                            setEditingCustomer={setEditingCustomer}
                            editForm={editForm}
                            setEditForm={setEditForm}
                            editLoading={editLoading}
                            onSaveEdit={handleSaveEdit}
                        />
                    )}
                    {step === 2 && (
                        <ServiceStep
                            services={filteredServices}
                            servicesLoading={servicesLoading}
                            selectedService={selectedService}
                            setSelectedService={setSelectedService}
                            serviceSearch={serviceSearch}
                            setServiceSearch={setServiceSearch}
                        />
                    )}
                    {step === 3 && (
                        <ScheduleStep
                            bookingDate={bookingDate}
                            setBookingDate={setBookingDate}
                            timeSlot={timeSlot}
                            setTimeSlot={setTimeSlot}
                            availability={availability}
                            availabilityLoading={availabilityLoading}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            walkInCustomer={walkInCustomer}
                            selectedService={selectedService}
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
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Processing...
                            </>
                        ) : step < 3 ? (
                            <>
                                Continue
                                <ChevronRight className="w-3.5 h-3.5" />
                            </>
                        ) : (
                            'Create Booking'
                        )}
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Popup */}
            {deleteConfirmCustomer && (
                <DeleteConfirmPopup
                    customer={deleteConfirmCustomer}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => {
                        if (!deletingCustomerId) setDeleteConfirmCustomer(null);
                    }}
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
    onDeleteCustomer, deletingCustomerId,
    showNewCustomerForm, setShowNewCustomerForm,
    walkInCustomer, setWalkInCustomer,
    saveToDb, setSaveToDb, onClearCustomer,
    location, setLocation,
    editingCustomer, setEditingCustomer,
    editForm, setEditForm, editLoading, onSaveEdit,
}) {
    return (
        <div className="px-4 py-3 space-y-4">
            {/* Selected Customer Banner */}
            {selectedWalkinCustomer && !editingCustomer && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/[0.08] border border-emerald-500/20">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-emerald-400">
                            {selectedWalkinCustomer.name?.charAt(0)?.toUpperCase()}
                        </span>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-white truncate">
                            {selectedWalkinCustomer.name}
                        </p>
                        <p className="text-[10px] text-white/40 font-mono">
                            {selectedWalkinCustomer.phone}
                        </p>
                    </div>
                    <button
                        onClick={onClearCustomer}
                        className="w-7 h-7 rounded-lg hover:bg-white/[0.06] flex items-center justify-center"
                    >
                        <X className="w-3.5 h-3.5 text-white/40" />
                    </button>
                </div>
            )}

            {/* Search */}
            {!selectedWalkinCustomer && !editingCustomer && (
                <>
                    <div>
                        <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                            Find Customer
                        </label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                            <input
                                type="text"
                                value={walkinSearch}
                                onChange={(e) => setWalkinSearch(e.target.value)}
                                placeholder="Search by name or phone..."
                                className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                            />
                            {walkinSearchLoading && (
                                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30 animate-spin" />
                            )}
                        </div>
                    </div>

                    {/* Customer List */}
                    {customersList.length > 0 && (
                        <div className="space-y-1.5">
                            <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide px-1">
                                {walkinSearch.length >= 2 ? 'Search Results' : 'Recent Customers'}
                            </p>
                            <div className="space-y-1 max-h-48 overflow-y-auto">
                                {customersList.map((c) => (
                                    <CustomerRow
                                        key={c._id}
                                        customer={c}
                                        selected={selectedWalkinCustomer?._id === c._id}
                                        onSelect={() => onSelectCustomer(c)}
                                        onDelete={() => onDeleteCustomer(c)}
                                        onEdit={() => {
                                            setEditingCustomer(c);
                                            setEditForm({
                                                name: c.name,
                                                phone: c.phone,
                                                address: c.address || '',
                                                city: c.city || '',
                                            });
                                        }}
                                        deleting={deletingCustomerId === c._id}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* New Customer */}
                    {!showNewCustomerForm ? (
                        <button
                            onClick={() => {
                                setShowNewCustomerForm(true);
                                setSaveToDb(true);
                            }}
                            className="w-full p-3 rounded-xl border border-dashed border-white/10 hover:border-white/20 hover:bg-white/[0.02] transition-all flex items-center justify-center gap-2 text-white/40 hover:text-white/60"
                        >
                            <UserPlus className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium">New Customer</span>
                        </button>
                    ) : (
                        <NewCustomerForm
                            walkInCustomer={walkInCustomer}
                            setWalkInCustomer={setWalkInCustomer}
                            saveToDb={saveToDb}
                            setSaveToDb={setSaveToDb}
                            onCancel={() => setShowNewCustomerForm(false)}
                        />
                    )}
                </>
            )}

            {/* Edit Customer */}
            {editingCustomer && (
                <EditCustomerForm
                    editForm={editForm}
                    setEditForm={setEditForm}
                    editLoading={editLoading}
                    onSave={onSaveEdit}
                    onCancel={() => setEditingCustomer(null)}
                />
            )}

            {/* Location */}
            <div className="space-y-2">
                <label className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                    Service Location
                </label>
                <div className="space-y-2">
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                        <input
                            type="text"
                            value={location.address}
                            onChange={(e) => setLocation({ ...location, address: e.target.value })}
                            placeholder="Address"
                            className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                        />
                    </div>
                    <input
                        type="text"
                        value={location.city}
                        onChange={(e) => setLocation({ ...location, city: e.target.value })}
                        placeholder="City"
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
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
            className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-colors cursor-pointer group ${
                selected
                    ? 'bg-emerald-500/[0.08] border border-emerald-500/20'
                    : 'bg-white/[0.02] hover:bg-white/[0.04] border border-transparent'
            }`}
            onClick={() => {
                if (!expanded) onSelect();
            }}
        >
            {/* Avatar */}
            <div className="w-7 h-7 rounded-md bg-white/[0.06] flex items-center justify-center text-[10px] font-semibold text-white/50 shrink-0">
                {customer.name?.charAt(0)?.toUpperCase() || '?'}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                    <p className="text-[11px] font-medium text-white/80 truncate">
                        {customer.name}
                    </p>
                    {customer.totalBookings > 0 && (
                        <span className="flex items-center gap-0.5 px-1 py-0.5 rounded bg-emerald-500/15 text-[8px] text-emerald-400 font-semibold shrink-0">
                            <Star className="w-2 h-2" />
                            {customer.totalBookings}
                        </span>
                    )}
                </div>
                <p className="text-[9px] text-white/30 font-mono truncate">{customer.phone}</p>
            </div>

            {/* Action buttons — shown when expanded */}
            {expanded && (
                <div
                    className="flex items-center gap-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                            setExpanded(false);
                        }}
                        className="w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.15] flex items-center justify-center transition-colors"
                        title="Edit"
                    >
                        <Edit2 className="w-3 h-3 text-white/50" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                            setExpanded(false);
                        }}
                        disabled={deleting}
                        className="w-6 h-6 rounded-md bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.15] flex items-center justify-center transition-colors disabled:opacity-50"
                        title="Delete"
                    >
                        {deleting ? (
                            <Loader2 className="w-3 h-3 text-white/40 animate-spin" />
                        ) : (
                            <Trash2 className="w-3 h-3 text-white/40" />
                        )}
                    </button>
                </div>
            )}

            {/* Always-visible toggle */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setExpanded((prev) => !prev);
                }}
                className={`w-6 h-6 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                    expanded
                        ? 'bg-white/[0.08] text-white/50'
                        : 'bg-white/[0.04] text-white/25 hover:bg-white/[0.08] hover:text-white/50'
                }`}
                title="More options"
            >
                <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

// ============================================
// NEW CUSTOMER FORM
// ============================================

function NewCustomerForm({ walkInCustomer, setWalkInCustomer, saveToDb, setSaveToDb, onCancel }) {
    return (
        <div className="p-3 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-wide">
                    New Customer
                </span>
                <button
                    onClick={onCancel}
                    className="text-[10px] text-white/30 hover:text-white/50"
                >
                    Cancel
                </button>
            </div>

            {/* Save toggle */}
            <div className="flex gap-1 p-1 bg-white/[0.04] rounded-lg">
                <button
                    onClick={() => setSaveToDb(true)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-medium rounded-md transition-all ${
                        saveToDb
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'text-white/30 hover:text-white/50'
                    }`}
                >
                    <Save className="w-3 h-3" />
                    Save Regular
                </button>
                <button
                    onClick={() => setSaveToDb(false)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[10px] font-medium rounded-md transition-all ${
                        !saveToDb
                            ? 'bg-white/10 text-white'
                            : 'text-white/30 hover:text-white/50'
                    }`}
                >
                    <Clock className="w-3 h-3" />
                    One-time
                </button>
            </div>

            <div className="space-y-2">
                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-1.5 block uppercase tracking-wide">
                        Name <span className="text-white/20">*</span>
                    </label>
                    <input
                        type="text"
                        value={walkInCustomer.name}
                        onChange={(e) => setWalkInCustomer({ ...walkInCustomer, name: e.target.value })}
                        placeholder="Customer name"
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                    />
                </div>
                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-1.5 block uppercase tracking-wide">
                        Phone <span className="text-white/20">*</span>
                    </label>
                    <input
                        type="text"
                        value={walkInCustomer.phone}
                        onChange={(e) => setWalkInCustomer({ ...walkInCustomer, phone: e.target.value })}
                        placeholder="Phone number"
                        className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                    />
                </div>
            </div>
        </div>
    );
}

// ============================================
// EDIT CUSTOMER FORM
// ============================================

function EditCustomerForm({ editForm, setEditForm, editLoading, onSave, onCancel }) {
    return (
        <div className="p-3 rounded-xl border border-blue-500/20 bg-blue-500/[0.05] space-y-3">
            <div className="flex items-center justify-between">
                <span className="text-[10px] text-blue-400 font-medium uppercase tracking-wide">
                    Edit Customer
                </span>
                <button
                    onClick={onCancel}
                    className="text-[10px] text-white/30 hover:text-white/50"
                >
                    Cancel
                </button>
            </div>

            <div className="space-y-2">
                <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Name"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />
                <input
                    type="text"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    placeholder="Phone"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />
                <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    placeholder="Address"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />
                <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                    placeholder="City"
                    className="w-full px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />
            </div>

            <button
                onClick={onSave}
                disabled={editLoading || !editForm.name || !editForm.phone}
                className="w-full py-2.5 rounded-lg bg-white hover:bg-white/90 text-black text-xs font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
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
    services, servicesLoading, selectedService,
    setSelectedService, serviceSearch, setServiceSearch,
}) {
    if (servicesLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-5 h-5 text-white/30 animate-spin mb-2" />
                <p className="text-[11px] text-white/30">Loading services...</p>
            </div>
        );
    }

    return (
        <div className="px-4 py-3 space-y-3">
            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => setServiceSearch(e.target.value)}
                    placeholder="Search services..."
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white placeholder-white/30 focus:outline-none focus:border-white/20"
                />
            </div>

            {/* Services List */}
            {services.length === 0 ? (
                <EmptyState icon={Package} title="No services found" desc="Try a different search" />
            ) : (
                <div className="space-y-1.5">
                    {services.map((service) => (
                        <button
                            key={service._id}
                            onClick={() => setSelectedService(service)}
                            className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all active:scale-[0.99] ${
                                selectedService?._id === service._id
                                    ? 'bg-white text-black'
                                    : 'bg-white/[0.03] hover:bg-white/[0.06]'
                            }`}
                        >
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                                    selectedService?._id === service._id
                                        ? 'bg-black/10'
                                        : 'bg-white/[0.08] text-white/60'
                                }`}
                            >
                                {service.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p
                                    className={`text-xs font-medium truncate ${
                                        selectedService?._id === service._id
                                            ? 'text-black'
                                            : 'text-white/80'
                                    }`}
                                >
                                    {service.name}
                                </p>
                                <p
                                    className={`text-[10px] mt-0.5 ${
                                        selectedService?._id === service._id
                                            ? 'text-black/50'
                                            : 'text-white/30'
                                    }`}
                                >
                                    {service.category?.name || service.tier} · ₹
                                    {(service.discountPrice || service.price || 0).toLocaleString('en-IN')}
                                </p>
                            </div>
                            {selectedService?._id === service._id && (
                                <div className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center shrink-0">
                                    <Check className="w-3 h-3 text-black" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// STEP 3: SCHEDULE
// ============================================

function ScheduleStep({
    bookingDate, setBookingDate,
    timeSlot, setTimeSlot,
    availability, availabilityLoading,
    paymentMethod, setPaymentMethod,
    walkInCustomer, selectedService,
}) {
    return (
        <div className="px-4 py-3 space-y-4">
            {/* Date */}
            <div>
                <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                    Date
                </label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <input
                        type="date"
                        value={bookingDate}
                        min={getTodayString()}
                        onChange={(e) => {
                            setBookingDate(e.target.value);
                            setTimeSlot('');
                        }}
                        className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white focus:outline-none focus:border-white/20 [color-scheme:dark]"
                    />
                </div>
            </div>

            {/* Time Slots */}
            {bookingDate && (
                <div>
                    <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                        Time Slot
                    </label>

                    {availabilityLoading ? (
                        <div className="flex justify-center py-6">
                            <Loader2 className="w-4 h-4 text-white/30 animate-spin" />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {/* Regular Slots */}
                            <div className="space-y-1.5">
                                <p className="text-[9px] text-white/25 font-semibold uppercase tracking-wide px-1">
                                    Regular Hours
                                </p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {ALL_TIME_SLOTS.filter((s) => !isAdminOnlySlot(s)).map((slot) => {
                                        const slotData = availability.find((a) => a.slot === slot);
                                        const passed = isSlotPassed(slot, bookingDate);
                                        const booked = slotData && !slotData.available && !passed;
                                        const disabled = passed || booked;

                                        return (
                                            <TimeSlotChip
                                                key={slot}
                                                slot={slot}
                                                selected={timeSlot === slot}
                                                disabled={disabled}
                                                passed={passed}
                                                booked={booked}
                                                onClick={() => !disabled && setTimeSlot(slot)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Admin Slots */}
                            <div className="space-y-1.5">
                                <p className="text-[9px] text-purple-400/60 font-semibold uppercase tracking-wide px-1 flex items-center gap-1">
                                    <span className="w-3 h-3 rounded-full bg-purple-500/20 flex items-center justify-center text-[7px] text-purple-400 font-bold">
                                        A
                                    </span>
                                    Admin Hours
                                </p>
                                <div className="grid grid-cols-2 gap-1.5">
                                    {ALL_TIME_SLOTS.filter((s) => isAdminOnlySlot(s)).map((slot) => {
                                        const slotData = availability.find((a) => a.slot === slot);
                                        const passed = isSlotPassed(slot, bookingDate);
                                        const booked = slotData && !slotData.available && !passed;
                                        const disabled = passed || booked;

                                        return (
                                            <TimeSlotChip
                                                key={slot}
                                                slot={slot}
                                                selected={timeSlot === slot}
                                                disabled={disabled}
                                                passed={passed}
                                                booked={booked}
                                                isAdmin
                                                onClick={() => !disabled && setTimeSlot(slot)}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Payment */}
            <div>
                <label className="text-[10px] text-white/40 font-medium mb-2 block uppercase tracking-wide">
                    Payment
                </label>
                <div className="flex gap-1.5">
                    {[
                        { key: 'cash', label: 'Cash', icon: CreditCard },
                        { key: 'online', label: 'Online', icon: CreditCard },
                        { key: 'pending', label: 'Pending', icon: Clock },
                    ].map((m) => (
                        <button
                            key={m.key}
                            onClick={() => setPaymentMethod(m.key)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-[10px] font-medium transition-all ${
                                paymentMethod === m.key
                                    ? 'bg-white text-black'
                                    : 'bg-white/[0.04] text-white/40 hover:bg-white/[0.08]'
                            }`}
                        >
                            {paymentMethod === m.key && <Check className="w-3 h-3" />}
                            {m.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Summary */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.04] space-y-2">
                <p className="text-[9px] text-white/30 font-semibold uppercase tracking-wide">
                    Summary
                </p>
                <SummaryItem label="Customer" value={walkInCustomer.name} />
                <SummaryItem label="Service" value={selectedService?.name} />
                <SummaryItem
                    label="Date"
                    value={
                        bookingDate
                            ? new Date(bookingDate + 'T00:00:00').toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                              })
                            : null
                    }
                />
                <SummaryItem label="Time" value={timeSlot} />
                <SummaryItem label="Payment" value={paymentMethod} />
                <div className="pt-2 border-t border-white/[0.04]">
                    <SummaryItem
                        label="Total"
                        value={`₹${(selectedService?.discountPrice || selectedService?.price || 0).toLocaleString('en-IN')}`}
                        highlight
                    />
                </div>
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
            className={`relative p-2.5 rounded-lg border text-[10px] font-medium transition-all text-center ${
                selected
                    ? isAdmin
                        ? 'border-purple-500/40 bg-purple-500/[0.15] text-white'
                        : 'bg-white text-black border-white'
                    : disabled
                        ? 'border-white/[0.04] bg-white/[0.01] text-white/15 cursor-not-allowed'
                        : isAdmin
                            ? 'border-purple-500/10 bg-purple-500/[0.03] text-white/50 hover:bg-purple-500/[0.08]'
                            : 'border-white/[0.06] bg-white/[0.02] text-white/50 hover:bg-white/[0.06]'
            }`}
        >
            {isAdmin && !selected && (
                <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-purple-500 text-white text-[7px] font-bold flex items-center justify-center">
                    A
                </span>
            )}
            <span className="block">{slot}</span>
            {passed && <span className="block text-[8px] text-white/15 mt-0.5">Passed</span>}
            {!passed && booked && <span className="block text-[8px] text-white/15 mt-0.5">Booked</span>}
            {selected && (
                <span
                    className={`absolute top-1.5 left-1.5 w-3 h-3 rounded-full flex items-center justify-center ${
                        isAdmin ? 'bg-purple-400' : 'bg-black/20'
                    }`}
                >
                    <Check className={`w-2 h-2 ${isAdmin ? 'text-white' : 'text-black'}`} />
                </span>
            )}
        </button>
    );
}

// ============================================
// SUMMARY ITEM
// ============================================

function SummaryItem({ label, value, highlight }) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className="text-[10px] text-white/30 shrink-0">{label}</span>
            <span
                className={`text-[11px] text-right truncate capitalize ${
                    highlight ? 'text-white font-bold text-sm' : 'text-white/60'
                }`}
            >
                {value || '—'}
            </span>
        </div>
    );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({ icon: Icon, title, desc }) {
    return (
        <div className="flex flex-col items-center justify-center py-10 px-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-white/20" />
            </div>
            <p className="text-xs font-medium text-white/60 mb-0.5">{title}</p>
            <p className="text-[10px] text-white/30">{desc}</p>
        </div>
    );
}