'use client';

import { useState } from 'react';
import { X, Loader2, Upload } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';

const CATEGORIES = ['basic', 'standard', 'premium'];

export default function EditServiceModal({ service, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('basic');

    const [name, setName] = useState(service.name || '');
    const [description, setDescription] = useState(service.description || '');
    const [shortDescription, setShortDescription] = useState(service.shortDescription || '');
    const [category, setCategory] = useState(service.category || 'basic');
    const [displayOrder, setDisplayOrder] = useState(service.displayOrder || 0);
    const [isActive, setIsActive] = useState(service.isActive);

    const [highlights, setHighlights] = useState(
        service.highlights?.length ? service.highlights : ['']
    );
    const [includes, setIncludes] = useState(
        service.includes?.length ? service.includes : ['']
    );
    const [excludes, setExcludes] = useState(
        service.excludes?.length ? service.excludes : ['']
    );

    const [existingImages, setExistingImages] = useState(service.images || []);
    const [newImages, setNewImages] = useState([]);
    const [newImagePreviews, setNewImagePreviews] = useState([]);
    const [imagesToRemove, setImagesToRemove] = useState([]);

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

    const handleNewImages = (e) => {
        const files = Array.from(e.target.files);
        const remaining = 3 - (existingImages.length - imagesToRemove.length);
        if (files.length > remaining) {
            toast.error(`Can only add ${remaining} more image(s)`);
            return;
        }
        setNewImages(prev => [...prev, ...files]);
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setNewImagePreviews(prev => [...prev, ev.target.result]);
            };
            reader.readAsDataURL(file);
        });
    };

    const markImageForRemoval = (publicId) => {
        setImagesToRemove(prev => [...prev, publicId]);
        setExistingImages(prev =>
            prev.filter(img => img.publicId !== publicId)
        );
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('shortDescription', shortDescription);
            formData.append('category', category);
            formData.append('displayOrder', displayOrder);
            formData.append('isActive', isActive);
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

            if (imagesToRemove.length > 0) {
                formData.append('removeImages', JSON.stringify(imagesToRemove));
            }

            newImages.forEach(img => {
                formData.append('images', img);
            });

            await axiosInstance.put(
                `/services/${service._id}`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            onSuccess();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to update service'
            );
        } finally {
            setLoading(false);
        }
    };

    const tabs = ['basic', 'images', 'features'];

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-2xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-1">
                            Edit Service
                        </p>
                        <h2 className="text-white text-lg font-light truncate max-w-xs">
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

                {/* Tabs */}
                <div className="flex border-b border-neutral-800 shrink-0">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-6 py-3 text-xs tracking-widest uppercase transition-colors capitalize ${
                                activeTab === tab
                                    ? 'text-white border-b border-white'
                                    : 'text-neutral-500 hover:text-white'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">

                    {/* Basic Tab */}
                    {activeTab === 'basic' && (
                        <div className="space-y-5">
                            <EInput label="Service Name" value={name} onChange={setName} placeholder="Service name" />

                            {/* Active Toggle */}
                            <div className="flex items-center justify-between p-3 border border-neutral-800">
                                <div>
                                    <p className="text-sm text-white">Active Status</p>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        {isActive ? 'Visible to customers' : 'Hidden from customers'}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setIsActive(!isActive)}
                                    className={`w-10 h-5 rounded-full transition-colors relative ${
                                        isActive ? 'bg-white' : 'bg-neutral-700'
                                    }`}
                                >
                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-black transition-transform ${
                                        isActive ? 'translate-x-5' : 'translate-x-0.5'
                                    }`} />
                                </button>
                            </div>

                            <div>
                                <label className="block text-xs text-neutral-500 uppercase tracking-widest mb-2">
                                    Category
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

                            <ETextarea
                                label="Short Description"
                                value={shortDescription}
                                onChange={setShortDescription}
                                placeholder="Brief summary..."
                                rows={2}
                            />
                            <ETextarea
                                label="Full Description"
                                value={description}
                                onChange={setDescription}
                                placeholder="Full description..."
                                rows={4}
                            />
                            <EInput
                                label="Display Order"
                                value={displayOrder}
                                onChange={(v) => setDisplayOrder(Number(v))}
                                type="number"
                                placeholder="0"
                            />
                        </div>
                    )}

                    {/* Images Tab */}
                    {activeTab === 'images' && (
                        <div className="space-y-4">
                            <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                Service Images (max 3)
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {existingImages.map((img, i) => (
                                    <div
                                        key={img.publicId || i}
                                        className="relative aspect-square bg-neutral-900 overflow-hidden"
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => markImageForRemoval(img.publicId)}
                                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 flex items-center justify-center text-white hover:bg-black"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        {img.isPrimary && (
                                            <span className="absolute bottom-1 left-1 text-xs bg-white text-black px-1">
                                                Primary
                                            </span>
                                        )}
                                    </div>
                                ))}

                                {newImagePreviews.map((preview, i) => (
                                    <div
                                        key={`new-${i}`}
                                        className="relative aspect-square bg-neutral-900 overflow-hidden"
                                    >
                                        <img
                                            src={preview}
                                            alt=""
                                            className="w-full h-full object-cover"
                                        />
                                        <button
                                            onClick={() => {
                                                setNewImages(prev => prev.filter((_, idx) => idx !== i));
                                                setNewImagePreviews(prev => prev.filter((_, idx) => idx !== i));
                                            }}
                                            className="absolute top-1 right-1 w-5 h-5 bg-black/80 flex items-center justify-center text-white hover:bg-black"
                                        >
                                            <X className="w-3 h-3" />
                                        </button>
                                        <span className="absolute bottom-1 left-1 text-xs bg-neutral-800 text-neutral-400 px-1">
                                            New
                                        </span>
                                    </div>
                                ))}

                                {(existingImages.length + newImages.length) < 3 && (
                                    <label className="aspect-square border border-dashed border-neutral-800 hover:border-neutral-600 flex flex-col items-center justify-center cursor-pointer transition-colors">
                                        <Upload className="w-5 h-5 text-neutral-600 mb-1" />
                                        <span className="text-xs text-neutral-600">Add</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            onChange={handleNewImages}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Features Tab */}
                    {activeTab === 'features' && (
                        <div className="space-y-6">
                            <EArrayInput
                                label="Highlights"
                                items={highlights}
                                onChange={(i, v) => updateArray(setHighlights, i, v)}
                                onAdd={() => addArrayItem(setHighlights)}
                                onRemove={(i) => removeArrayItem(setHighlights, i)}
                                placeholder="e.g. Eco-friendly products"
                            />
                            <EArrayInput
                                label="What's Included"
                                items={includes}
                                onChange={(i, v) => updateArray(setIncludes, i, v)}
                                onAdd={() => addArrayItem(setIncludes)}
                                onRemove={(i) => removeArrayItem(setIncludes, i)}
                                placeholder="e.g. Exterior wash"
                            />
                            <EArrayInput
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
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !name.trim() || !description.trim()}
                        className="flex-1 bg-white hover:bg-neutral-200 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-black text-xs tracking-widest uppercase py-3 transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            'Save Changes'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

function EInput({ label, value, onChange, placeholder, type = 'text' }) {
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
                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600"
            />
        </div>
    );
}

function ETextarea({ label, value, onChange, placeholder, rows = 3 }) {
    return (
        <div>
            <label className="block text-xs text-neutral-500 mb-1.5 uppercase tracking-widest">
                {label}
            </label>
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                rows={rows}
                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2.5 focus:outline-none focus:border-neutral-600 resize-none"
            />
        </div>
    );
}

function EArrayInput({ label, items, onChange, onAdd, onRemove, placeholder }) {
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