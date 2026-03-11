'use client';

import { useState } from 'react';
import { X, Loader2, Plus, Trash2, Upload } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['basic', 'standard', 'premium'];
const VEHICLE_TYPES = [
    'sedan', 'suv', 'hatchback', 'truck', 'van', 'bike', 'other'
];

const defaultVehicle = {
    type: '',
    label: '',
    description: '',
    price: '',
    duration: '',
    features: []
};

export default function CreateServiceModal({ onClose, onSuccess }) {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Basic Info
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [shortDescription, setShortDescription] = useState('');
    const [category, setCategory] = useState('basic');
    const [displayOrder, setDisplayOrder] = useState(0);

    // Arrays
    const [highlights, setHighlights] = useState(['']);
    const [includes, setIncludes] = useState(['']);
    const [excludes, setExcludes] = useState(['']);

    // Vehicle Types
    const [vehicleTypes, setVehicleTypes] = useState([{ ...defaultVehicle }]);

    // Images
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    // ── Array Helpers ──
    const updateArray = (setter, index, value) => {
        setter(prev => {
            const arr = [...prev];
            arr[index] = value;
            return arr;
        });
    };

    const addArrayItem = (setter) => setter(prev => [...prev, '']);

    const removeArrayItem = (setter, index) => {
        setter(prev => prev.filter((_, i) => i !== index));
    };

    // ── Vehicle Type Helpers ──
    const updateVehicle = (index, field, value) => {
        setVehicleTypes(prev => {
            const arr = [...prev];
            arr[index] = { ...arr[index], [field]: value };
            return arr;
        });
    };

    const addVehicle = () => {
        setVehicleTypes(prev => [...prev, { ...defaultVehicle }]);
    };

    const removeVehicle = (index) => {
        if (vehicleTypes.length === 1) {
            toast.error('At least one vehicle type required');
            return;
        }
        setVehicleTypes(prev => prev.filter((_, i) => i !== index));
    };

    const updateVehicleFeature = (vIndex, fIndex, value) => {
        setVehicleTypes(prev => {
            const arr = [...prev];
            const features = [...(arr[vIndex].features || [])];
            features[fIndex] = value;
            arr[vIndex] = { ...arr[vIndex], features };
            return arr;
        });
    };

    // ── Image Handling ──
    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        if (images.length + files.length > 3) {
            toast.error('Maximum 3 images allowed');
            return;
        }
        setImages(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreviews(prev => [...prev, e.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    // ── Submit ──
    const handleSubmit = async () => {
        // Validate
        if (!name.trim()) {
            toast.error('Service name is required');
            return;
        }
        if (!description.trim()) {
            toast.error('Description is required');
            return;
        }

        const validVehicles = vehicleTypes.filter(v =>
            v.type && v.price && v.duration
        );
        if (validVehicles.length === 0) {
            toast.error('At least one complete vehicle type required');
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('shortDescription', shortDescription);
            formData.append('category', category);
            formData.append('displayOrder', displayOrder);
            formData.append(
                'highlights',
                JSON.stringify(highlights.filter(h => h.trim()))
            );
            formData.append(
                'includes',
                JSON.stringify(includes.filter(i => i.trim()))
            );
            formData.append(
                'excludes',
                JSON.stringify(excludes.filter(e => e.trim()))
            );
            formData.append(
                'vehicleTypes',
                JSON.stringify(validVehicles.map(v => ({
                    ...v,
                    label: v.label || v.type,
                    price: Number(v.price),
                    duration: Number(v.duration),
                    features: v.features.filter(f => f.trim())
                })))
            );

            images.forEach(img => {
                formData.append('images', img);
            });

            await axiosInstance.post('/services', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            onSuccess();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to create service'
            );
        } finally {
            setLoading(false);
        }
    };

    const canProceed1 = name.trim() && description.trim() && category;
    const canProceed2 = vehicleTypes.some(v => v.type && v.price && v.duration);

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            New Service
                        </p>
                        <h2 className="text-white text-lg font-light">
                            Create Service
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Steps */}
                <div className="flex items-center gap-0 px-6 py-3 border-b border-neutral-800 shrink-0">
                    {['Basic Info', 'Vehicle Types', 'Images & Features'].map((s, i) => (
                        <div key={s} className="flex items-center">
                            <div className={`flex items-center gap-2 px-3 py-1 text-xs transition-colors ${
                                step === i + 1
                                    ? 'text-white'
                                    : step > i + 1
                                    ? 'text-neutral-500'
                                    : 'text-neutral-700'
                            }`}>
                                <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${
                                    step === i + 1
                                        ? 'border-white bg-white text-black'
                                        : step > i + 1
                                        ? 'border-neutral-600 text-neutral-500'
                                        : 'border-neutral-800 text-neutral-700'
                                }`}>
                                    {i + 1}
                                </div>
                                <span className="hidden sm:block">{s}</span>
                            </div>
                            {i < 2 && (
                                <div className={`h-px w-4 ${
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

                    {/* ── STEP 1: Basic Info ── */}
                    {step === 1 && (
                        <div className="space-y-5">
                            <FInput
                                label="Service Name *"
                                value={name}
                                onChange={setName}
                                placeholder="e.g. Premium Car Wash"
                            />
                            <div>
                                <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">
                                    Category *
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => setCategory(cat)}
                                            className={`py-2.5 border text-xs capitalize transition-colors ${
                                                category === cat
                                                    ? 'border-white bg-white/5 text-white'
                                                    : 'border-neutral-800 text-neutral-500 hover:border-neutral-600'
                                            }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <FTextarea
                                label="Short Description"
                                value={shortDescription}
                                onChange={setShortDescription}
                                placeholder="Brief summary (max 200 chars)"
                                rows={2}
                                max={200}
                            />
                            <FTextarea
                                label="Full Description *"
                                value={description}
                                onChange={setDescription}
                                placeholder="Detailed description of the service..."
                                rows={4}
                            />
                            <FInput
                                label="Display Order"
                                value={displayOrder}
                                onChange={(v) => setDisplayOrder(Number(v))}
                                placeholder="0"
                                type="number"
                            />
                        </div>
                    )}

                    {/* ── STEP 2: Vehicle Types ── */}
                    {step === 2 && (
                        <div className="space-y-6">
                            {vehicleTypes.map((vt, i) => (
                                <div
                                    key={i}
                                    className="border border-neutral-800 p-4 space-y-4"
                                >
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                            Vehicle Type {i + 1}
                                        </p>
                                        {vehicleTypes.length > 1 && (
                                            <button
                                                onClick={() => removeVehicle(i)}
                                                className="text-neutral-700 hover:text-white transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Type *
                                            </label>
                                            <select
                                                value={vt.type}
                                                onChange={(e) => updateVehicle(i, 'type', e.target.value)}
                                                className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600 capitalize"
                                            >
                                                <option value="">Select</option>
                                                {VEHICLE_TYPES.map(t => (
                                                    <option key={t} value={t}>
                                                        {t}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <FInput
                                            label="Label"
                                            value={vt.label}
                                            onChange={(v) => updateVehicle(i, 'label', v)}
                                            placeholder="e.g. SUV / MUV"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <FInput
                                            label="Price (₹) *"
                                            value={vt.price}
                                            onChange={(v) => updateVehicle(i, 'price', v)}
                                            placeholder="500"
                                            type="number"
                                        />
                                        <FInput
                                            label="Duration (min) *"
                                            value={vt.duration}
                                            onChange={(v) => updateVehicle(i, 'duration', v)}
                                            placeholder="60"
                                            type="number"
                                        />
                                    </div>

                                    <FInput
                                        label="Description"
                                        value={vt.description}
                                        onChange={(v) => updateVehicle(i, 'description', v)}
                                        placeholder="Brief description..."
                                    />

                                    {/* Features */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs text-neutral-500">
                                                Features
                                            </label>
                                            <button
                                                onClick={() => updateVehicle(i, 'features', [...(vt.features || []), ''])}
                                                className="text-xs text-neutral-500 hover:text-white transition-colors"
                                            >
                                                + Add
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            {(vt.features || []).map((f, fi) => (
                                                <div key={fi} className="flex gap-2">
                                                    <input
                                                        type="text"
                                                        value={f}
                                                        onChange={(e) => updateVehicleFeature(i, fi, e.target.value)}
                                                        placeholder="e.g. Exterior Wash"
                                                        className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-1.5 focus:outline-none focus:border-neutral-600"
                                                    />
                                                    <button
                                                        onClick={() => updateVehicle(i, 'features', vt.features.filter((_, idx) => idx !== fi))}
                                                        className="text-neutral-700 hover:text-white transition-colors px-2"
                                                    >
                                                        <X className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={addVehicle}
                                className="w-full border border-dashed border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 py-3 text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                Add Vehicle Type
                            </button>
                        </div>
                    )}

                    {/* ── STEP 3: Images & Features ── */}
                    {step === 3 && (
                        <div className="space-y-6">

                            {/* Images */}
                            <div>
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                    Service Images (max 3)
                                </p>
                                <div className="grid grid-cols-3 gap-3">
                                    {imagePreviews.map((preview, i) => (
                                        <div
                                            key={i}
                                            className="relative aspect-square bg-neutral-900 overflow-hidden"
                                        >
                                            <img
                                                src={preview}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                onClick={() => removeImage(i)}
                                                className="absolute top-1 right-1 w-5 h-5 bg-black/80 flex items-center justify-center text-white hover:bg-black transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                            {i === 0 && (
                                                <span className="absolute bottom-1 left-1 text-xs bg-white text-black px-1">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}

                                    {imagePreviews.length < 3 && (
                                        <label className="aspect-square border border-dashed border-neutral-800 hover:border-neutral-600 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                            <Upload className="w-5 h-5 text-neutral-600 mb-1" />
                                            <span className="text-xs text-neutral-600">
                                                Add Image
                                            </span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}
                                </div>
                                <p className="text-xs text-neutral-600 mt-2">
                                    First image will be set as primary. JPG, PNG, WEBP up to 5MB.
                                </p>
                            </div>

                            {/* Highlights */}
                            <ArrayInput
                                label="Highlights"
                                items={highlights}
                                onChange={(i, v) => updateArray(setHighlights, i, v)}
                                onAdd={() => addArrayItem(setHighlights)}
                                onRemove={(i) => removeArrayItem(setHighlights, i)}
                                placeholder="e.g. Eco-friendly products"
                            />

                            {/* Includes */}
                            <ArrayInput
                                label="What's Included"
                                items={includes}
                                onChange={(i, v) => updateArray(setIncludes, i, v)}
                                onAdd={() => addArrayItem(setIncludes)}
                                onRemove={(i) => removeArrayItem(setIncludes, i)}
                                placeholder="e.g. Exterior wash"
                            />

                            {/* Excludes */}
                            <ArrayInput
                                label="What's Not Included"
                                items={excludes}
                                onChange={(i, v) => updateArray(setExcludes, i, v)}
                                onAdd={() => addArrayItem(setExcludes)}
                                onRemove={(i) => removeArrayItem(setExcludes, i)}
                                placeholder="e.g. Engine cleaning"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-800 flex items-center gap-3 shrink-0">
                    <button
                        onClick={onClose}
                        className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                    >
                        Cancel
                    </button>
                    {step > 1 && (
                        <button
                            onClick={() => setStep(step - 1)}
                            className="border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-4 py-3 transition-colors"
                        >
                            Back
                        </button>
                    )}
                    <button
                        onClick={() => {
                            if (step < 3) setStep(step + 1);
                            else handleSubmit();
                        }}
                        disabled={
                            loading ||
                            (step === 1 && !canProceed1) ||
                            (step === 2 && !canProceed2)
                        }
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Creating...
                            </>
                        ) : step < 3 ? 'Next' : 'Create Service'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Reusable Components ──

function FInput({ label, value, onChange, placeholder, type = 'text' }) {
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

function FTextarea({ label, value, onChange, placeholder, rows = 3, max }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs text-neutral-500 uppercase tracking-widest">
                    {label}
                </label>
                {max && (
                    <span className="text-xs text-neutral-700">
                        {value.length}/{max}
                    </span>
                )}
            </div>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                maxLength={max}
                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 resize-none transition-colors"
            />
        </div>
    );
}

function ArrayInput({ label, items, onChange, onAdd, onRemove, placeholder }) {
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <label className="text-xs text-neutral-500 uppercase tracking-widest">
                    {label}
                </label>
                <button
                    onClick={onAdd}
                    className="text-xs text-neutral-500 hover:text-white transition-colors"
                >
                    + Add
                </button>
            </div>
            <div className="space-y-2">
                {items.map((item, i) => (
                    <div key={i} className="flex gap-2">
                        <input
                            type="text"
                            value={item}
                            onChange={(e) => onChange(i, e.target.value)}
                            placeholder={placeholder}
                            className="flex-1 bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                        />
                        {items.length > 1 && (
                            <button
                                onClick={() => onRemove(i)}
                                className="text-neutral-700 hover:text-white transition-colors px-2"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}