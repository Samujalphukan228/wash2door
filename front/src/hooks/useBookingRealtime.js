'use client';

import { useEffect, useCallback } from 'react';
import { useUserSocket } from '@/context/UserSocketContext';

export function useBookingRealtime({ onStatusChange } = {}) {
    const { onBookingEvent } = useUserSocket();

    useEffect(() => {
        const unsubscribe = onBookingEvent((event) => {
            if (event.type === 'statusUpdated' || event.type === 'cancelled') {
                onStatusChange?.(event);
            }
        });

        return unsubscribe;
    }, [onBookingEvent, onStatusChange]);
}

export function useSlotRealtime({ selectedDate, slots, setSlots }) {
    const { onSlotEvent } = useUserSocket();

    const handleSlotEvent = useCallback((event) => {
        const { type, data } = event;

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