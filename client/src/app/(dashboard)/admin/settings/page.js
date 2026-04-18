'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/admin/layout/DashboardLayout';
import ProfileSection from '@/components/admin/settings/ProfileSection';
import SecuritySection from '@/components/admin/settings/SecuritySection';
import BusinessSection from '@/components/admin/settings/BusinessSection';

const TABS = [
    { id: 'profile',  label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'business', label: 'Business' },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-4">

                {/* Header */}
                <div>
                    <p className="text-[10px] text-white/30 uppercase tracking-wide">Account</p>
                    <h1 className="text-base sm:text-lg font-semibold text-white">Settings</h1>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/[0.06]">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-4 py-2.5 text-[11px] font-medium transition-all whitespace-nowrap ${
                                activeTab === tab.id
                                    ? 'text-white border-b-2 border-white'
                                    : 'text-white/30 hover:text-white/50'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                {activeTab === 'profile'  && <ProfileSection />}
                {activeTab === 'security' && <SecuritySection />}
                {activeTab === 'business' && <BusinessSection />}
            </div>
        </DashboardLayout>
    );
}