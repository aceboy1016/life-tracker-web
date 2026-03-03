'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    where,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { LifeEvent, EventCategory } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useEvents() {
    const { user } = useAuth();
    const [events, setEvents] = useState<LifeEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setEvents([]);
            setLoading(false);
            return;
        }

        const q = query(
            collection(db, 'users', user.uid, 'events'),
            orderBy('name', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEvents: LifeEvent[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    name: data.name ?? '',
                    lastExecutedDate: data.lastExecutedDate instanceof Timestamp
                        ? data.lastExecutedDate.toDate()
                        : null,
                    category: (data.category as EventCategory) ?? 'general',
                    notes: data.notes ?? '',
                    userId: data.userId ?? user.uid,
                    createdAt: data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate()
                        : undefined,
                };
            });
            setEvents(fetchedEvents);
            setLoading(false);
        });

        return unsubscribe;
    }, [user]);

    const createEvent = useCallback(
        async (data: { name: string; category: EventCategory; notes: string; lastExecutedDate?: Date | null }) => {
            if (!user) return;
            await addDoc(collection(db, 'users', user.uid, 'events'), {
                name: data.name,
                category: data.category,
                notes: data.notes,
                lastExecutedDate: data.lastExecutedDate ?? null,
                userId: user.uid,
                createdAt: serverTimestamp(),
            });
        },
        [user]
    );

    const markAsExecuted = useCallback(
        async (eventId: string) => {
            if (!user) return;
            const ref = doc(db, 'users', user.uid, 'events', eventId);
            await updateDoc(ref, { lastExecutedDate: new Date() });
        },
        [user]
    );

    const updateEvent = useCallback(
        async (
            eventId: string,
            data: { name?: string; category?: EventCategory; notes?: string; lastExecutedDate?: Date | null }
        ) => {
            if (!user) return;
            const ref = doc(db, 'users', user.uid, 'events', eventId);
            await updateDoc(ref, { ...data });
        },
        [user]
    );

    const deleteEvent = useCallback(
        async (eventId: string) => {
            if (!user) return;
            await deleteDoc(doc(db, 'users', user.uid, 'events', eventId));
        },
        [user]
    );

    return { events, loading, createEvent, markAsExecuted, updateEvent, deleteEvent };
}
