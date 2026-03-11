'use client';

import { useState } from 'react';
import { X, Loader2, Plus } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = [
    'sedan', 'suv', 'hatchback', 'truck', 'van', 'bike', 'other'
];

export default function VehicleTypeModal({ service, onClose, onSuccess }) {
    const [activeTab, setActiveTab] = useState('add');
    const [loading, setLoading] = useState(false);

    // ── Add Form ──
    const [form, setForm] = useState({
        type: '',
        label: '',
        description: '',
        price: '',
        duration: '',
        features: [''],
        displayOrder: 0
    });
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    // ── Edit State ──
    const [editingVehicle, setEditingVehicle] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);

    // ── Form Helpers ──
    const updateForm = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const updateFeature = (index, value) => {
        setForm(prev => {
            const features = [...prev.features];
            features[index] = value;
            return { ...prev, features };
        });
    };

    const addFeature = () => {
        setForm(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeature = (index) => {
        setForm(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    // ── Image Handling ──
    const handleImageChange = (e, isEdit = false) => {
        const file = e.target.files[0];
        if (!file) return;

        if (isEdit) {
            setEditImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => setEditImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        } else {
            setImage(file);
            const reader = new FileReader();
            reader.onload = (ev) => setImagePreview(ev.target.result);
            reader.readAsDataURL(file);
        }
    };

    // ── Add Vehicle Type ──
    const handleAdd = async () => {
        if (!form.type || !form.price || !form.duration) {
            toast.error('Type, price and duration are required');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('type', form.type);
            formData.append('label', form.label || form.type);
            formData.append('description', form.description);
            formData.append('price', Number(form.price));
            formData.append('duration', Number(form.duration));
            formData.append('displayOrder', Number(form.displayOrder));
            formData.append(
                'features',
                JSON.stringify(form.features.filter(f => f.trim()))
            );

            if (image) {
                formData.append('image', image);
            }

            await axiosInstance.post(
                `/services/${service._id}/vehicles`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            toast.success('Vehicle type added successfully');
            onSuccess();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to add vehicle type'
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Start Editing ──
    const startEdit = (vehicle) => {
        setEditingVehicle(vehicle);
        setEditForm({
            label: vehicle.label || '',
            description: vehicle.description || '',
            price: vehicle.price || '',
            duration: vehicle.duration || '',
            features: vehicle.features?.length ? vehicle.features : [''],
            isActive: vehicle.isActive,
            displayOrder: vehicle.displayOrder || 0
        });
        setEditImage(null);
        setEditImagePreview(null);
    };

    // ── Update Vehicle Type ──
    const handleUpdate = async () => {
        if (!editForm.price || !editForm.duration) {
            toast.error('Price and duration are required');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('label', editForm.label);
            formData.append('description', editForm.description);
            formData.append('price', Number(editForm.price));
            formData.append('duration', Number(editForm.duration));
            formData.append('isActive', editForm.isActive);
            formData.append('displayOrder', Number(editForm.displayOrder));
            formData.append(
                'features',
                JSON.stringify(
                    (editForm.features || []).filter(f => f.trim())
                )
            );

            if (editImage) {
                formData.append('image', editImage);
            }

            await axiosInstance.put(
                `/services/${service._id}/vehicles/${editingVehicle._id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            toast.success('Vehicle type updated');
            setEditingVehicle(null);
            onSuccess();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to update vehicle type'
            );
        } finally {
            setLoading(false);
        }
    };

    // ── Delete Vehicle Type ──
    const handleDelete = async (vehicleTypeId) => {
        if (!confirm('Delete this vehicle type? This cannot be undone.')) return;

        try {
            setLoading(true);
            await axiosInstance.delete(
                `/services/${service._id}/vehicles/${vehicleTypeId}`
            );
            toast.success('Vehicle type deleted');
            onSuccess();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to delete vehicle type'
            );
        } finally {
            setLoading(false);
        }
    };

    const updateEditFeature = (index, value) => {
        setEditForm(prev => {
            const features = [...(prev.features || [])];
            features[index] = value;
            return { ...prev, features };
        });
    };

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* ── Header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            Vehicle Types
                        </p>
                        <h2 className="text-white font-light truncate max-w-xs">
                            {service.name}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* ── Tabs ── */}
                <div className="flex border-b border-neutral-800 shrink-0">
                    {['add', 'manage'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => {
                                setActiveTab(tab);
                                setEditingVehicle(null);
                            }}
                            className={`px-6 py-3 text-xs tracking-widest uppercase transition-colors capitalize ${
                                activeTab === tab
                                    ? 'text-white border-b border-white'
                                    : 'text-neutral-500 hover:text-white'
                            }`}
                        >
                            {tab === 'add' ? 'Add New' : `Manage (${service.vehicleTypes?.length || 0})`}
                        </button>
                    ))}
                </div>

                {/* ── Content ── */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* ── ADD TAB ── */}
                    {activeTab === 'add' && (
                        <div className="space-y-5">

                            {/* Type + Label */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">
                                        Vehicle Type *
                                    </label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => updateForm('type', e.target.value)}
                                        className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 capitalize"
                                    >
                                        <option value="">Select type</option>
                                        {VEHICLE_TYPES.map(t => (
                                            <option key={t} value={t}>
                                                {t}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <VInput
                                    label="Display Label"
                                    value={form.label}
                                    onChange={(v) => updateForm('label', v)}
                                    placeholder="e.g. SUV / MUV"
                                />
                            </div>

                            {/* Price + Duration */}
                            <div className="grid grid-cols-2 gap-3">
                                <VInput
                                    label="Price (₹) *"
                                    value={form.price}
                                    onChange={(v) => updateForm('price', v)}
                                    placeholder="500"
                                    type="number"
                                />
                                <VInput
                                    label="Duration (min) *"
                                    value={form.duration}
                                    onChange={(v) => updateForm('duration', v)}
                                    placeholder="60"
                                    type="number"
                                />
                            </div>

                            {/* Description */}
                            <VInput
                                label="Description"
                                value={form.description}
                                onChange={(v) => updateForm('description', v)}
                                placeholder="Brief description of this vehicle type..."
                            />

                            {/* Display Order */}
                            <VInput
                                label="Display Order"
                                value={form.displayOrder}
                                onChange={(v) => updateForm('displayOrder', v)}
                                placeholder="0"
                                type="number"
                            />

                            {/* Image */}
                            <div>
                                <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">
                                    Vehicle Image
                                </label>
                                <div className="flex items-start gap-4">
                                    {imagePreview ? (
                                        <div className="relative w-24 h-20 bg-neutral-900 overflow-hidden shrink-0">
                                            <img
                                                src={imagePreview}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => {
                                                    setImage(null);
                                                    setImagePreview(null);
                                                }}
                                                className="absolute top-1 right-1 w-4 h-4 bg-black/80 flex items-center justify-center text-white"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="w-24 h-20 border border-dashed border-neutral-800 hover:border-neutral-600 flex flex-col items-center justify-center cursor-pointer transition-colors shrink-0">
                                            <Plus className="w-4 h-4 text-neutral-600 mb-1" />
                                            <span className="text-xs text-neutral-600">
                                                Upload
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleImageChange(e, false)}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                    <p className="text-xs text-neutral-600 mt-2">
                                        Optional. JPG, PNG, WEBP up to 5MB.
                                        Recommended: 800×600px
                                    </p>
                                </div>
                            </div>

                            {/* Features */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-xs text-neutral-500 uppercase tracking-widest">
                                        Features
                                    </label>
                                    <button
                                        onClick={addFeature}
                                        className="text-xs text-neutral-500 hover:text-white transition-colors"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="space-y-2">
                                    {form.features.map((feature, i) => (
                                        <div key={i} className="flex gap-2">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(i, e.target.value)}
                                                placeholder="e.g. Exterior Wash"
                                                className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            />
                                            {form.features.length > 1 && (
                                                <button
                                                    onClick={() => removeFeature(i)}
                                                    className="text-neutral-700 hover:text-white transition-colors px-2"
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── MANAGE TAB ── */}
                    {activeTab === 'manage' && (
                        <div className="space-y-4">
                            {!service.vehicleTypes?.length ? (
                                <p className="text-neutral-500 text-sm text-center py-8">
                                    No vehicle types yet
                                </p>
                            ) : (
                                service.vehicleTypes.map((vt) => (
                                    <div key={vt._id}>
                                        {editingVehicle?._id === vt._id ? (

                                            /* ── Edit Form ── */
                                            <div className="border border-white/20 p-4 space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                                        Editing: {vt.label || vt.type}
                                                    </p>
                                                    <button
                                                        onClick={() => setEditingVehicle(null)}
                                                        className="text-neutral-500 hover:text-white transition-colors"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <VInput
                                                        label="Label"
                                                        value={editForm.label}
                                                        onChange={(v) => setEditForm(p => ({ ...p, label: v }))}
                                                        placeholder="Display label"
                                                    />
                                                    <VInput
                                                        label="Price (₹)"
                                                        value={editForm.price}
                                                        onChange={(v) => setEditForm(p => ({ ...p, price: v }))}
                                                        type="number"
                                                        placeholder="500"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <VInput
                                                        label="Duration (min)"
                                                        value={editForm.duration}
                                                        onChange={(v) => setEditForm(p => ({ ...p, duration: v }))}
                                                        type="number"
                                                        placeholder="60"
                                                    />
                                                    <VInput
                                                        label="Display Order"
                                                        value={editForm.displayOrder}
                                                        onChange={(v) => setEditForm(p => ({ ...p, displayOrder: v }))}
                                                        type="number"
                                                        placeholder="0"
                                                    />
                                                </div>

                                                <VInput
                                                    label="Description"
                                                    value={editForm.description}
                                                    onChange={(v) => setEditForm(p => ({ ...p, description: v }))}
                                                    placeholder="Brief description..."
                                                />

                                                {/* Active Toggle */}
                                                <div className="flex items-center justify-between p-3 border border-neutral-800">
                                                    <p className="text-sm text-white">Active</p>
                                                    <button
                                                        onClick={() => setEditForm(p => ({ ...p, isActive: !p.isActive }))}
                                                        className={`w-10 h-5 rounded-full transition-colors relative ${
                                                            editForm.isActive
                                                                ? 'bg-white'
                                                                : 'bg-neutral-700'
                                                        }`}
                                                    >
                                                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                                                            editForm.isActive
                                                                ? 'translate-x-5'
                                                                : 'translate-x-0.5'
                                                        }`} />
                                                    </button>
                                                </div>

                                                {/* Edit Image */}
                                                <div>
                                                    <label className="block text-xs text-neutral-500 mb-2">
                                                        Vehicle Image
                                                    </label>
                                                    <div className="flex items-start gap-3">
                                                        {/* Current or new preview */}
                                                        <div className="relative w-20 h-16 bg-neutral-900 overflow-hidden shrink-0">
                                                            {editImagePreview ? (
                                                                <img
                                                                    src={editImagePreview}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : vt.image && !vt.image.includes('default') ? (
                                                                <img
                                                                    src={vt.image}
                                                                    alt=""
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <p className="text-neutral-700 text-xs">
                                                                        No img
                                                                    </p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <label className="border border-dashed border-neutral-800 hover:border-neutral-600 px-3 py-2 cursor-pointer transition-colors text-xs text-neutral-500 hover:text-white">
                                                            Change Image
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={(e) => handleImageChange(e, true)}
                                                                className="hidden"
                                                            />
                                                        </label>
                                                    </div>
                                                </div>

                                                {/* Edit Features */}
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <label className="text-xs text-neutral-500">
                                                            Features
                                                        </label>
                                                        <button
                                                            onClick={() => setEditForm(p => ({
                                                                ...p,
                                                                features: [...(p.features || []), '']
                                                            }))}
                                                            className="text-xs text-neutral-500 hover:text-white"
                                                        >
                                                            + Add
                                                        </button>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {(editForm.features || []).map((f, fi) => (
                                                            <div key={fi} className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={f}
                                                                    onChange={(e) => updateEditFeature(fi, e.target.value)}
                                                                    placeholder="Feature..."
                                                                    className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-1.5 focus:outline-none focus:border-neutral-600"
                                                                />
                                                                <button
                                                                    onClick={() => setEditForm(p => ({
                                                                        ...p,
                                                                        features: p.features.filter((_, idx) => idx !== fi)
                                                                    }))}
                                                                    className="text-neutral-700 hover:text-white px-2"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Edit Actions */}
                                                <div className="flex gap-2 pt-2">
                                                    <button
                                                        onClick={() => setEditingVehicle(null)}
                                                        className="flex-1 border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase py-2.5 transition-colors"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={handleUpdate}
                                                        disabled={loading}
                                                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 text-black text-xs tracking-widest uppercase py-2.5 transition-colors flex items-center justify-center gap-2"
                                                    >
                                                        {loading ? (
                                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                        ) : (
                                                            'Save Changes'
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                        ) : (

                                            /* ── Vehicle Card ── */
                                            <div className={`border p-4 ${
                                                vt.isActive
                                                    ? 'border-neutral-800'
                                                    : 'border-neutral-900 opacity-50'
                                            }`}>
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-start gap-3">
                                                        {/* Image */}
                                                        {vt.image && !vt.image.includes('default') && (
                                                            <div className="w-14 h-12 bg-neutral-900 overflow-hidden shrink-0">
                                                                <img
                                                                    src={vt.image}
                                                                    alt={vt.label}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        )}
                                                        <div>
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <p className="text-white text-sm font-medium">
                                                                    {vt.label}
                                                                </p>
                                                                <span className="text-xs border border-neutral-800 text-neutral-500 px-1.5 py-0.5 capitalize">
                                                                    {vt.type}
                                                                </span>
                                                                {!vt.isActive && (
                                                                    <span className="text-xs border border-neutral-800 text-neutral-600 px-1.5 py-0.5">
                                                                        Inactive
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {vt.description && (
                                                                <p className="text-xs text-neutral-500 mt-1">
                                                                    {vt.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 mt-2">
                                                                <span className="text-sm text-white font-medium">
                                                                    ₹{vt.price?.toLocaleString('en-IN')}
                                                                </span>
                                                                <span className="text-xs text-neutral-500">
                                                                    {vt.duration} min
                                                                </span>
                                                            </div>
                                                            {vt.features?.length > 0 && (
                                                                <div className="flex flex-wrap gap-1 mt-2">
                                                                    {vt.features.map((f, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="text-xs border border-neutral-800 text-neutral-600 px-1.5 py-0.5"
                                                                        >
                                                                            {f}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-1 shrink-0">
                                                        <button
                                                            onClick={() => startEdit(vt)}
                                                            className="w-7 h-7 flex items-center justify-center text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                            </svg>
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(vt._id)}
                                                            disabled={loading || service.vehicleTypes.length <= 1}
                                                            className="w-7 h-7 flex items-center justify-center text-neutral-700 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                                            title={service.vehicleTypes.length <= 1 ? 'Cannot delete last vehicle type' : 'Delete'}
                                                        >
                                                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                    >
                        Close
                    </button>

                    {activeTab === 'add' && (
                        <button
                            onClick={handleAdd}
                            disabled={loading || !form.type || !form.price || !form.duration}
                            className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5" />
                                    Add Vehicle Type
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ── Input Component ──
function VInput({ label, value, onChange, placeholder, type = 'text' }) {
    return (
        <div>
            <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
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