'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Search } from 'lucide-react';
import adminService from '@/services/adminService';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

const TIME_SLOTS = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00',
    '11:00-12:00', '12:00-13:00', '13:00-14:00',
    '14:00-15:00', '15:00-16:00', '16:00-17:00',
    '17:00-18:00'
];

const VEHICLE_TYPES = [
    'sedan', 'suv', 'hatchback', 'truck', 'van', 'bike', 'other'
];

export default function CreateBookingModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1 - Booking type
    const [bookingType, setBookingType] = useState('walkin');

    // Step 1 - Customer
    const [walkInCustomer, setWalkInCustomer] = useState({
        name: '', phone: '', email: ''
    });
    const [customerSearch, setCustomerSearch] = useState('');
    const [customers, setCustomers] = useState([]);
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);

    // Step 2 - Service
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [selectedVehicleType, setSelectedVehicleType] = useState(null);
    const [servicesLoading, setServicesLoading] = useState(false);

    // Step 3 - Date & Time
    const [bookingDate, setBookingDate] = useState('');
    const [timeSlot, setTimeSlot] = useState('');
    const [availability, setAvailability] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    // Step 4 - Details
    const [location, setLocation] = useState({
        address: 'Walk-in / At Shop',
        city: 'Walk-in',
        state: '', zipCode: '', landmark: ''
    });
    const [vehicleDetails, setVehicleDetails] = useState({
        type: '', brand: '', model: '', color: '', plateNumber: ''
    });
    const [specialNotes, setSpecialNotes] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('cash');

    // Load services
    useEffect(() => {
        const loadServices = async () => {
            try {
                setServicesLoading(true);
                const response = await adminService.getAllServices({
                    isActive: true,
                    limit: 100
                });
                if (response.success) {
                    setServices(response.data);
                }
            } catch (error) {
                toast.error('Failed to load services');
            } finally {
                setServicesLoading(false);
            }
        };
        loadServices();
    }, []);

    // Search customers
    useEffect(() => {
        if (bookingType !== 'online' || customerSearch.length < 2) {
            setCustomers([]);
            return;
        }
        const timer = setTimeout(async () => {
            try {
                setSearchLoading(true);
                const response = await adminService.getAllUsers({
                    search: customerSearch,
                    limit: 5
                });
                if (response.success) {
                    setCustomers(response.data.users);
                }
            } catch (error) {
                // silent
            } finally {
                setSearchLoading(false);
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [customerSearch, bookingType]);

    // Check availability
    useEffect(() => {
        if (!selectedService || !bookingDate) return;

        const checkAvailability = async () => {
            try {
                setAvailabilityLoading(true);
                const response = await axiosInstance.get(
                    '/bookings/availability',
                    {
                        params: {
                            serviceId: selectedService._id,
                            date: bookingDate
                        }
                    }
                );
                if (response.data.success) {
                    setAvailability(response.data.data.slots || []);
                }
            } catch (error) {
                // silent
            } finally {
                setAvailabilityLoading(false);
            }
        };
        checkAvailability();
    }, [selectedService, bookingDate]);

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
                vehicleTypeId: selectedVehicleType._id,
                bookingDate,
                timeSlot,
                location,
                vehicleDetails,
                specialNotes,
                paymentMethod
            };

            if (bookingType === 'walkin') {
                payload.walkInCustomer = walkInCustomer;
            } else {
                payload.customerId = selectedCustomer._id;
            }

            await adminService.createAdminBooking(payload);
            onSuccess();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to create booking'
            );
        } finally {
            setLoading(false);
        }
    };

    const canProceedStep1 = bookingType === 'walkin'
        ? walkInCustomer.name.trim()
        : selectedCustomer !== null;

    const canProceedStep2 = selectedService && selectedVehicleType;
    const canProceedStep3 = bookingDate && timeSlot;
    const canProceedStep4 = vehicleDetails.type;

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            Admin
                        </p>
                        <h2 className="text-white text-lg font-light">
                            Create Booking
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Step Indicators */}
                <div className="flex items-center px-6 py-3 border-b border-neutral-800 gap-2 shrink-0">
                    {['Customer', 'Service', 'Schedule', 'Details'].map((s, i) => (
                        <div key={s} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 ${
                                step === i + 1
                                    ? 'text-white'
                                    : step > i + 1
                                    ? 'text-neutral-500'
                                    : 'text-neutral-700'
                            }`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs border ${
                                    step === i + 1
                                        ? 'border-white bg-white text-black'
                                        : step > i + 1
                                        ? 'border-neutral-600 text-neutral-500'
                                        : 'border-neutral-800 text-neutral-700'
                                }`}>
                                    {i + 1}
                                </div>
                                <span className="text-xs hidden sm:block">{s}</span>
                            </div>
                            {i < 3 && (
                                <div className={`h-px flex-1 w-4 ${
                                    step > i + 1
                                        ? 'bg-neutral-600'
                                        : 'bg-neutral-800'
                                }`} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* ── STEP 1: Customer ── */}
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Booking Type */}
                            <div>
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                    Booking Type
                                </p>
                                <div className="grid grid-cols-2 gap-3">
                                    {['walkin', 'online'].map((type) => (
                                        <button
                                            key={type}
                                            onClick={() => {
                                                setBookingType(type);
                                                setSelectedCustomer(null);
                                                setCustomerSearch('');
                                            }}
                                            className={`p-4 border text-left transition-colors ${
                                                bookingType === type
                                                    ? 'border-white bg-white/5'
                                                    : 'border-neutral-800 hover:border-neutral-600'
                                            }`}
                                        >
                                            <p className="text-sm text-white capitalize mb-1">
                                                {type === 'walkin' ? 'Walk-in' : 'Online'}
                                            </p>
                                            <p className="text-xs text-neutral-500">
                                                {type === 'walkin'
                                                    ? 'Customer at shop'
                                                    : 'Registered customer'
                                                }
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Walk-in Customer */}
                            {bookingType === 'walkin' && (
                                <div className="space-y-4">
                                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                        Customer Info
                                    </p>
                                    <Input
                                        label="Name *"
                                        value={walkInCustomer.name}
                                        onChange={(v) => setWalkInCustomer(p => ({ ...p, name: v }))}
                                        placeholder="Full name"
                                    />
                                    <Input
                                        label="Phone"
                                        value={walkInCustomer.phone}
                                        onChange={(v) => setWalkInCustomer(p => ({ ...p, phone: v }))}
                                        placeholder="+91 XXXXX XXXXX"
                                    />
                                    <Input
                                        label="Email"
                                        value={walkInCustomer.email}
                                        onChange={(v) => setWalkInCustomer(p => ({ ...p, email: v }))}
                                        placeholder="customer@email.com"
                                    />
                                </div>
                            )}

                            {/* Online Customer Search */}
                            {bookingType === 'online' && (
                                <div className="space-y-3">
                                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                        Search Customer
                                    </p>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-600" />
                                        <input
                                            type="text"
                                            value={customerSearch}
                                            onChange={(e) => {
                                                setCustomerSearch(e.target.value);
                                                setSelectedCustomer(null);
                                            }}
                                            placeholder="Search by name or email..."
                                            className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm pl-10 pr-4 py-2.5 focus:outline-none focus:border-neutral-600"
                                        />
                                    </div>

                                    {searchLoading && (
                                        <p className="text-xs text-neutral-500">Searching...</p>
                                    )}

                                    {customers.length > 0 && !selectedCustomer && (
                                        <div className="border border-neutral-800 divide-y divide-neutral-800">
                                            {customers.map((customer) => (
                                                <button
                                                    key={customer._id}
                                                    onClick={() => {
                                                        setSelectedCustomer(customer);
                                                        setCustomerSearch(
                                                            `${customer.firstName} ${customer.lastName}`
                                                        );
                                                        setCustomers([]);
                                                    }}
                                                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-neutral-900 transition-colors text-left"
                                                >
                                                    <div>
                                                        <p className="text-sm text-white">
                                                            {customer.firstName} {customer.lastName}
                                                        </p>
                                                        <p className="text-xs text-neutral-500">
                                                            {customer.email}
                                                        </p>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {selectedCustomer && (
                                        <div className="border border-white/20 bg-white/5 px-4 py-3 flex items-center justify-between">
                                            <div>
                                                <p className="text-sm text-white">
                                                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                                                </p>
                                                <p className="text-xs text-neutral-400">
                                                    {selectedCustomer.email}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    setSelectedCustomer(null);
                                                    setCustomerSearch('');
                                                }}
                                                className="text-neutral-500 hover:text-white"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 2: Service ── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            <div>
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                    Select Service
                                </p>
                                {servicesLoading ? (
                                    <div className="space-y-2">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="h-16 bg-neutral-800 animate-pulse" />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {services.map((service) => (
                                            <button
                                                key={service._id}
                                                onClick={() => {
                                                    setSelectedService(service);
                                                    setSelectedVehicleType(null);
                                                }}
                                                className={`w-full flex items-center justify-between p-4 border text-left transition-colors ${
                                                    selectedService?._id === service._id
                                                        ? 'border-white bg-white/5'
                                                        : 'border-neutral-800 hover:border-neutral-600'
                                                }`}
                                            >
                                                <div>
                                                    <p className="text-sm text-white">
                                                        {service.name}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 capitalize mt-0.5">
                                                        {service.category} · from ₹{service.startingPrice}
                                                    </p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Vehicle Type */}
                            {selectedService && (
                                <div>
                                    <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                        Vehicle Type
                                    </p>
                                    <div className="space-y-2">
                                        {selectedService.vehicleTypes
                                            ?.filter(v => v.isActive)
                                            .map((vt) => (
                                                <button
                                                    key={vt._id}
                                                    onClick={() => setSelectedVehicleType(vt)}
                                                    className={`w-full flex items-center justify-between p-4 border text-left transition-colors ${
                                                        selectedVehicleType?._id === vt._id
                                                            ? 'border-white bg-white/5'
                                                            : 'border-neutral-800 hover:border-neutral-600'
                                                    }`}
                                                >
                                                    <div>
                                                        <p className="text-sm text-white">
                                                            {vt.label}
                                                        </p>
                                                        <p className="text-xs text-neutral-500 mt-0.5">
                                                            {vt.duration} min
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-white font-medium">
                                                        ₹{vt.price?.toLocaleString('en-IN')}
                                                    </p>
                                                </button>
                                            ))
                                        }
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── STEP 3: Schedule ── */}
                    {step === 3 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                                    Booking Date
                                </label>
                                <input
                                    type="date"
                                    value={bookingDate}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => {
                                        setBookingDate(e.target.value);
                                        setTimeSlot('');
                                    }}
                                    className="w-full bg-black border border-neutral-800 text-white text-sm px-4 py-3 focus:outline-none focus:border-neutral-600"
                                />
                            </div>

                            {bookingDate && (
                                <div>
                                    <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                        Time Slot
                                        {availabilityLoading && (
                                            <span className="ml-2 normal-case text-neutral-600">
                                                checking...
                                            </span>
                                        )}
                                    </p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {TIME_SLOTS.map((slot) => {
                                            const available = isSlotAvailable(slot);
                                            return (
                                                <button
                                                    key={slot}
                                                    onClick={() => available && setTimeSlot(slot)}
                                                    disabled={!available}
                                                    className={`p-3 border text-xs font-mono transition-colors ${
                                                        timeSlot === slot
                                                            ? 'border-white bg-white text-black'
                                                            : !available
                                                            ? 'border-neutral-900 text-neutral-700 cursor-not-allowed'
                                                            : 'border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-white'
                                                    }`}
                                                >
                                                    {slot}
                                                    {!available && (
                                                        <span className="block text-neutral-700 text-xs font-sans mt-0.5">
                                                            Booked
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

                    {/* ── STEP 4: Details ── */}
                    {step === 4 && (
                        <div className="space-y-6">

                            {/* Location */}
                            <div>
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                    Location
                                </p>
                                <div className="space-y-3">
                                    <Input
                                        label="Address"
                                        value={location.address}
                                        onChange={(v) => setLocation(p => ({ ...p, address: v }))}
                                        placeholder="Street address"
                                    />
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            label="City"
                                            value={location.city}
                                            onChange={(v) => setLocation(p => ({ ...p, city: v }))}
                                            placeholder="City"
                                        />
                                        <Input
                                            label="State"
                                            value={location.state}
                                            onChange={(v) => setLocation(p => ({ ...p, state: v }))}
                                            placeholder="State"
                                        />
                                    </div>
                                    <Input
                                        label="Landmark"
                                        value={location.landmark}
                                        onChange={(v) => setLocation(p => ({ ...p, landmark: v }))}
                                        placeholder="Near landmark (optional)"
                                    />
                                </div>
                            </div>

                            {/* Vehicle Details */}
                            <div>
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                    Vehicle Details
                                </p>
                                <div className="space-y-3">
                                    <div>
                                        <label className="block text-xs text-neutral-500 mb-2">
                                            Vehicle Type *
                                        </label>
                                        <select
                                            value={vehicleDetails.type}
                                            onChange={(e) => setVehicleDetails(p => ({ ...p, type: e.target.value }))}
                                            className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 capitalize"
                                        >
                                            <option value="">Select type</option>
                                            {VEHICLE_TYPES.map(t => (
                                                <option key={t} value={t} className="capitalize">
                                                    {t}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            label="Brand"
                                            value={vehicleDetails.brand}
                                            onChange={(v) => setVehicleDetails(p => ({ ...p, brand: v }))}
                                            placeholder="e.g. Maruti"
                                        />
                                        <Input
                                            label="Model"
                                            value={vehicleDetails.model}
                                            onChange={(v) => setVehicleDetails(p => ({ ...p, model: v }))}
                                            placeholder="e.g. Swift"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <Input
                                            label="Color"
                                            value={vehicleDetails.color}
                                            onChange={(v) => setVehicleDetails(p => ({ ...p, color: v }))}
                                            placeholder="e.g. White"
                                        />
                                        <Input
                                            label="Plate Number"
                                            value={vehicleDetails.plateNumber}
                                            onChange={(v) => setVehicleDetails(p => ({ ...p, plateNumber: v }))}
                                            placeholder="KA 01 AB 1234"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment */}
                            <div>
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                    Payment Method
                                </p>
                                <div className="grid grid-cols-3 gap-2">
                                    {['cash', 'card', 'online'].map((method) => (
                                        <button
                                            key={method}
                                            onClick={() => setPaymentMethod(method)}
                                            className={`p-3 border text-xs capitalize transition-colors ${
                                                paymentMethod === method
                                                    ? 'border-white bg-white/5 text-white'
                                                    : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
                                            }`}
                                        >
                                            {method}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Special Notes */}
                            <div>
                                <label className="block text-xs text-neutral-500 tracking-widest uppercase mb-2">
                                    Special Notes
                                </label>
                                <textarea
                                    value={specialNotes}
                                    onChange={(e) => setSpecialNotes(e.target.value)}
                                    placeholder="Any special instructions..."
                                    rows={3}
                                    className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600 resize-none"
                                />
                            </div>

                            {/* Summary */}
                            <div className="border border-neutral-800 p-4 space-y-2">
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                    Summary
                                </p>
                                <SummaryRow
                                    label="Customer"
                                    value={
                                        bookingType === 'walkin'
                                            ? walkInCustomer.name
                                            : `${selectedCustomer?.firstName} ${selectedCustomer?.lastName}`
                                    }
                                />
                                <SummaryRow label="Service" value={selectedService?.name} />
                                <SummaryRow label="Vehicle" value={selectedVehicleType?.label} />
                                <SummaryRow label="Date" value={bookingDate} />
                                <SummaryRow label="Slot" value={timeSlot} mono />
                                <SummaryRow
                                    label="Amount"
                                    value={`₹${selectedVehicleType?.price?.toLocaleString('en-IN')}`}
                                    highlight
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3 shrink-0">
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                        >
                            Back
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={() => {
                            if (step < 4) {
                                setStep(step + 1);
                            } else {
                                handleSubmit();
                            }
                        }}
                        disabled={
                            loading ||
                            (step === 1 && !canProceedStep1) ||
                            (step === 2 && !canProceedStep2) ||
                            (step === 3 && !canProceedStep3) ||
                            (step === 4 && !canProceedStep4)
                        }
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Creating...
                            </>
                        ) : step < 4 ? (
                            'Next'
                        ) : (
                            'Create Booking'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Reusable Input ──
function Input({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div>
            <label className="block text-xs text-neutral-500 mb-1.5">
                {label}
            </label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 transition-colors"
            />
        </div>
    );
}

// ── Summary Row ──
function SummaryRow({ label, value, highlight, mono }) {
    return (
        <div className="flex items-center justify-between">
            <p className="text-xs text-neutral-600">{label}</p>
            <p className={`text-sm ${
                highlight
                    ? 'text-white font-medium'
                    : mono
                    ? 'font-mono text-neutral-400'
                    : 'text-neutral-400'
            }`}>
                {value || '—'}
            </p>
        </div>
    );
}