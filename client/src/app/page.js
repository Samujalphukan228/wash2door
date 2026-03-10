'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
    const router = useRouter();
    const { isAuthenticated, loading } = useAuth();

    useEffect(() => {
        if (!loading) {
            if (isAuthenticated) {
                router.push('/admin/dashboard');
            } else {
                router.push('/admin/login');
            }
        }
    }, [isAuthenticated, loading, router]);

    return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
                <div className="w-8 h-8 border border-black border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-neutral-400 tracking-widest uppercase">
                    Loading
                </p>
            </div>
        </div>
    );
}