'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import ProfileSection from '@/components/admin/settings/ProfileSection';
import SecuritySection from '@/components/admin/settings/SecuritySection';
import BusinessSection from '@/components/admin/settings/BusinessSection';
import { Settings } from 'lucide-react';

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    const tabs = [
        { id: 'profile', label: 'Profile' },
        { id: 'security', label: 'Security' },
        { id: 'business', label: 'Business' }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* Page Header */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs text-neutral-500 tracking-[0.2em] uppercase mb-1">
                            Account
                        </p>
                        <h1 className="text-xl sm:text-2xl font-light text-white">
                            Settings
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-500">
                        <Settings className="w-4 h-4" />
                        <span className="text-xs tracking-widest uppercase">
                            Admin Settings
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-neutral-800">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-3 text-xs tracking-widest uppercase transition-colors ${
                                activeTab === tab.id
                                    ? 'text-white border-b border-white'
                                    : 'text-neutral-500 hover:text-white'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="max-w-2xl">
                    {activeTab === 'profile' && <ProfileSection />}
                    {activeTab === 'security' && <SecuritySection />}
                    {activeTab === 'business' && <BusinessSection />}
                </div>
            </div>
        </DashboardLayout>
    );
}