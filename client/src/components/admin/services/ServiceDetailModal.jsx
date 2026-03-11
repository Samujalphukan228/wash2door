'use client';

import { useState } from 'react';
import {
    X, Pencil, Star, Tag, Clock,
    Check, Minus, Plus, Trash2,
    Loader2
} from 'lucide-react';
import axiosInstance from '@/lib/axios';
import toast from 'react-hot-toast';
import Image from 'next/image';

const categoryColors = {
    basic: 'border-neutral-700 text-neutral-400',
    standard: 'border-neutral-600 text-neutral-300',
    premium: 'border-neutral-400 text-white'
};

export default function ServiceDetailModal({
    service,
    onClose,
    onEdit,
    onRefresh
}) {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedImage, setSelectedImage] = useState(
        service.images?.find(img => img.isPrimary) || service.images?.[0]
    );
    const [loading, setLoading] = useState(false);
    const [showAddVehicle, setShowAddVehicle] = useState(false);

    const [newVehicle, setNewVehicle] = useState({
        type: '', label: '', description: '',
        price: '', duration: '', features: []
    });

    const handleDeleteVehicle = async (vehicleTypeId) => {
        if (!confirm('Delete this vehicle type?')) return;
        try {
            setLoading(true);
            await axiosInstance.delete(
                `/services/${service._id}/vehicles/${vehicleTypeId}`
            );
            toast.success('Vehicle type deleted');
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to delete'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleAddVehicle = async () => {
        if (!newVehicle.type || !newVehicle.price || !newVehicle.duration) {
            toast.error('Type, price and duration are required');
            return;
        }
        try {
            setLoading(true);
            await axiosInstance.post(
                `/services/${service._id}/vehicles`,
                {
                    ...newVehicle,
                    label: newVehicle.label || newVehicle.type,
                    price: Number(newVehicle.price),
                    duration: Number(newVehicle.duration)
                }
            );
            toast.success('Vehicle type added');
            setShowAddVehicle(false);
            setNewVehicle({
                type: '', label: '', description: '',
                price: '', duration: '', features: []
            });
            onRefresh();
            onClose();
        } catch (error) {
            toast.error(
                error.response?.data?.message || 'Failed to add vehicle type'
            );
        } finally {
            setLoading(false);
        }
    };

    const tabs = ['overview', 'vehicles', 'reviews'];

    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <div className="bg-neutral-950 border border-neutral-800 w-full max-w-3xl max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-800 shrink-0">
                    <div className="flex items-center gap-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-white font-medium">
                                    {service.name}
                                </h2>
                                <span className={`text-xs border px-2 py-0.5 capitalize ${
                                    categoryColors[service.category]
                                }`}>
                                    {service.category}
                                </span>
                                <span className={`text-xs px-2 py-0.5 ${
                                    service.isActive
                                        ? 'bg-white text-black'
                                        : 'bg-neutral-800 text-neutral-500'
                                }`}>
                                    {service.isActive ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <p className="text-xs text-neutral-500">
                                {service.totalBookings || 0} bookings ·{' '}
                                {service.averageRating?.toFixed(1) || '0.0'} rating ·{' '}
                                from ₹{service.startingPrice?.toLocaleString('en-IN') || '0'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onEdit}
                            className="flex items-center gap-2 border border-neutral-800 text-neutral-400 hover:text-white text-xs tracking-widest uppercase px-3 py-2 transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center text-neutral-500 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
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

                    {/* Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            {service.images?.length > 0 && (
                                <div className="space-y-3">
                                    <div className="relative h-56 bg-neutral-900 overflow-hidden">
                                        {selectedImage && (
                                            <Image
                                                src={selectedImage.url}
                                                alt={service.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    {service.images.length > 1 && (
                                        <div className="flex gap-2">
                                            {service.images.map((img, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedImage(img)}
                                                    className={`relative w-16 h-12 overflow-hidden border transition-colors ${
                                                        selectedImage?.url === img.url
                                                            ? 'border-white'
                                                            : 'border-neutral-800'
                                                    }`}
                                                >
                                                    <Image
                                                        src={img.url}
                                                        alt=""
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <p className="text-xs text-neutral-500 tracking-widest uppercase mb-2">
                                    Description
                                </p>
                                <p className="text-sm text-neutral-300 leading-relaxed">
                                    {service.description}
                                </p>
                            </div>

                            {service.highlights?.length > 0 && (
                                <div>
                                    <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                        Highlights
                                    </p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {service.highlights.map((h, i) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-1 h-1 bg-white rounded-full shrink-0" />
                                                <p className="text-sm text-neutral-400">{h}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {service.includes?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                            Included
                                        </p>
                                        <div className="space-y-2">
                                            {service.includes.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Check className="w-3.5 h-3.5 text-white shrink-0" />
                                                    <p className="text-sm text-neutral-400">{item}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {service.excludes?.length > 0 && (
                                    <div>
                                        <p className="text-xs text-neutral-500 tracking-widest uppercase mb-3">
                                            Not Included
                                        </p>
                                        <div className="space-y-2">
                                            {service.excludes.map((item, i) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <Minus className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                                                    <p className="text-sm text-neutral-500">{item}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Vehicles Tab */}
                    {activeTab === 'vehicles' && (
                        <div className="space-y-4">
                            {service.vehicleTypes?.map((vt) => (
                                <div
                                    key={vt._id}
                                    className={`border p-4 ${
                                        vt.isActive
                                            ? 'border-neutral-800'
                                            : 'border-neutral-900 opacity-50'
                                    }`}
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-white font-medium text-sm">
                                                    {vt.label}
                                                </p>
                                                <span className="text-xs border border-neutral-800 text-neutral-500 px-2 py-0.5 capitalize">
                                                    {vt.type}
                                                </span>
                                            </div>
                                            {vt.description && (
                                                <p className="text-xs text-neutral-500 mt-1">
                                                    {vt.description}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteVehicle(vt._id)}
                                            disabled={loading}
                                            className="text-neutral-700 hover:text-white transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-6 mb-3">
                                        <div className="flex items-center gap-1.5">
                                            <Tag className="w-3.5 h-3.5 text-neutral-600" />
                                            <span className="text-sm text-white font-medium">
                                                ₹{vt.price?.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5 text-neutral-600" />
                                            <span className="text-sm text-neutral-400">
                                                {vt.duration} min
                                            </span>
                                        </div>
                                    </div>

                                    {vt.features?.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {vt.features.map((f, i) => (
                                                <span
                                                    key={i}
                                                    className="text-xs border border-neutral-800 text-neutral-500 px-2 py-0.5"
                                                >
                                                    {f}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {!showAddVehicle ? (
                                <button
                                    onClick={() => setShowAddVehicle(true)}
                                    className="w-full border border-dashed border-neutral-800 text-neutral-500 hover:text-white hover:border-neutral-600 py-3 text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Vehicle Type
                                </button>
                            ) : (
                                <div className="border border-neutral-800 p-4 space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs text-neutral-500 tracking-widest uppercase">
                                            New Vehicle Type
                                        </p>
                                        <button
                                            onClick={() => setShowAddVehicle(false)}
                                            className="text-neutral-500 hover:text-white transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs text-neutral-500 mb-1.5">
                                                Type *
                                            </label>
                                            <select
                                                value={newVehicle.type}
                                                onChange={(e) => setNewVehicle(p => ({ ...p, type: e.target.value }))}
                                                className="w-full bg-black border border-neutral-800 text-white text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
                                            >
                                                <option value="">Select</option>
                                                {['sedan', 'suv', 'hatchback', 'truck', 'van', 'bike', 'other'].map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <VInput
                                            label="Label"
                                            value={newVehicle.label}
                                            onChange={(v) => setNewVehicle(p => ({ ...p, label: v }))}
                                            placeholder="e.g. SUV / MUV"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <VInput
                                            label="Price (₹) *"
                                            value={newVehicle.price}
                                            onChange={(v) => setNewVehicle(p => ({ ...p, price: v }))}
                                            type="number"
                                            placeholder="500"
                                        />
                                        <VInput
                                            label="Duration (min) *"
                                            value={newVehicle.duration}
                                            onChange={(v) => setNewVehicle(p => ({ ...p, duration: v }))}
                                            type="number"
                                            placeholder="60"
                                        />
                                    </div>
                                    <VInput
                                        label="Description"
                                        value={newVehicle.description}
                                        onChange={(v) => setNewVehicle(p => ({ ...p, description: v }))}
                                        placeholder="Brief description..."
                                    />
                                    <button
                                        onClick={handleAddVehicle}
                                        disabled={loading}
                                        className="w-full bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black text-xs tracking-widest uppercase py-2.5 transition-colors flex items-center justify-center gap-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                        ) : (
                                            'Add Vehicle Type'
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Reviews Tab */}
                    {activeTab === 'reviews' && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-6 p-4 border border-neutral-800">
                                <div>
                                    <p className="text-3xl font-light text-white">
                                        {service.averageRating?.toFixed(1) || '0.0'}
                                    </p>
                                    <div className="flex items-center gap-1 mt-1">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                className={`w-3.5 h-3.5 ${
                                                    i < Math.round(service.averageRating || 0)
                                                        ? 'text-white fill-white'
                                                        : 'text-neutral-700'
                                                }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                                <div className="border-l border-neutral-800 pl-6">
                                    <p className="text-2xl font-light text-white">
                                        {service.totalReviews || 0}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        Total reviews
                                    </p>
                                </div>
                                <div className="border-l border-neutral-800 pl-6">
                                    <p className="text-2xl font-light text-white">
                                        {service.totalBookings || 0}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-0.5">
                                        Total bookings
                                    </p>
                                </div>
                            </div>
                            <p className="text-xs text-neutral-600 text-center py-4">
                                View all reviews in the Reviews section
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function VInput({ label, value, onChange, placeholder, type = 'text' }) {
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
                className="w-full bg-black border border-neutral-800 text-white placeholder-neutral-600 text-sm px-3 py-2 focus:outline-none focus:border-neutral-600"
            />
        </div>
    );
}