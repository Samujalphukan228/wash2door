'use client';

import { useEffect, useCallback } from 'react';
import { useUserSocket } from '@/context/UserSocketContext';

// ============================================
// useBookingRealtime
// Use this in your bookings list page to auto-refetch
// when booking status changes in real-time
//
// Usage:
//   useBookingRealtime({ onStatusChange: refetch })
// ============================================
export function useBookingRealtime({ onStatusChange } = {}) {
    const { onBookingEvent } = useUserSocket();

    useEffect(() => {
        const unsubscribe = onBookingEvent((event) => {
            if (event.type === 'statusUpdated' || event.type === 'cancelled') {
                // Trigger a refetch of bookings list
                onStatusChange?.(event);
            }
        });

        return unsubscribe;
    }, [onBookingEvent, onStatusChange]);
}

// ============================================
// useSlotRealtime
// Use this in your booking/availability page
// to update slots in real-time without refetching
//
// Usage:
//   useSlotRealtime({
//     selectedDate: '2025-01-01',
//     slots,
//     setSlots
//   })
// ============================================
export function useSlotRealtime({ selectedDate, slots, setSlots }) {
    const { onSlotEvent } = useUserSocket();

    const handleSlotEvent = useCallback((event) => {
        const { type, data } = event;

        // Only update if the event is for the currently viewed date
        if (data.date !== selectedDate) return;

        setSlots(prevSlots => {
            if (!prevSlots) return prevSlots;

            return prevSlots.map(slot => {
                if (slot.slot === data.timeSlot) {
                    return {
                        ...slot,
                        available: type === 'available',
                        reason: type === 'booked' ? 'Booked' : null,
                    };
                }
                return slot;
            });
        });
    }, [selectedDate, setSlots]);

    useEffect(() => {
        const unsubscribe = onSlotEvent(handleSlotEvent);
        return unsubscribe;
    }, [onSlotEvent, handleSlotEvent]);
}