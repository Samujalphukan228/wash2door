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
                        <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">
                            Account
                        </p>
                        <h1 className="text-xl sm:text-2xl font-light text-white/90">
                            Settings
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 text-white/25">
                        <Settings className="w-4 h-4" />
                        <span className="text-[11px] tracking-widest uppercase">
                            Admin Settings
                        </span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/[0.06]">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`
                                px-6 py-3 text-[11px] tracking-widest uppercase
                                transition-all duration-150 font-medium
                                ${activeTab === tab.id
                                    ? 'text-white/80 border-b-2 border-white'
                                    : 'text-white/30 hover:text-white/60'
                                }
                            `}
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