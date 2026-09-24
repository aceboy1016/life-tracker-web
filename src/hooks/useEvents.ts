'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { getFirebaseDB } from '@/lib/firebase';
import { LifeEvent, EventCategory, EventGroup, EVENT_GROUPS } from '@/types';
import { iconForCategory } from '@/lib/icons';
import { useAuth } from '@/contexts/AuthContext';

export interface EventInput {
    name: string;
    group: EventGroup;
    icon: string;
    category?: EventCategory;
    notes: string;
    lastExecutedDate?: Date | null;
}

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

        const db = getFirebaseDB();
        const q = query(
            collection(db, 'users', user.uid, 'events'),
            orderBy('name', 'asc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedEvents: LifeEvent[] = snapshot.docs.map((doc) => {
                const data = doc.data();
                const category = (data.category as EventCategory) ?? 'general';
                return {
                    id: doc.id,
                    name: data.name ?? '',
                    group: EVENT_GROUPS.some((g) => g.key === data.group)
                        ? (data.group as EventGroup)
                        : data.kind === 'milestone'
                          ? 'milestone'
                          : 'other',
                    icon: typeof data.icon === 'string' ? data.icon : iconForCategory(category),
                    lastExecutedDate: data.lastExecutedDate instanceof Timestamp
                        ? data.lastExecutedDate.toDate()
                        : null,
                    category,
                    notes: data.notes ?? '',
                    userId: data.userId ?? user.uid,
                    createdAt: data.createdAt instanceof Timestamp
                        ? data.createdAt.toDate()
                        : undefined,
                };
            });
            setEvents(fetchedEvents);
            setLoading(false);
        }, (error) => {
            console.error('Failed to load events:', error);
            setLoading(false);
        });

        return unsubscribe;
    }, [user]);

    const createEvent = useCallback(
        async (data: EventInput) => {
            if (!user) return;
            const db = getFirebaseDB();
            await addDoc(collection(db, 'users', user.uid, 'events'), {
                name: data.name,
                group: data.group,
                icon: data.icon,
                category: data.category ?? 'general',
                notes: data.notes,
                lastExecutedDate: data.lastExecutedDate ?? null,
                userId: user.uid,
                createdAt: serverTimestamp(),
            });
        },
        [user]
    );

    const markAsExecuted = useCallback(
        async (eventId: string, date: Date = new Date()) => {
            if (!user) return;
            const db = getFirebaseDB();
            const ref = doc(db, 'users', user.uid, 'events', eventId);
            await updateDoc(ref, { lastExecutedDate: date });
        },
        [user]
    );

    const updateEvent = useCallback(
        async (
            eventId: string,
            data: Partial<EventInput>
        ) => {
            if (!user) return;
            const db = getFirebaseDB();
            const ref = doc(db, 'users', user.uid, 'events', eventId);
            await updateDoc(ref, { ...data });
        },
        [user]
    );

    const deleteEvent = useCallback(
        async (eventId: string) => {
            if (!user) return;
            const db = getFirebaseDB();
            await deleteDoc(doc(db, 'users', user.uid, 'events', eventId));
        },
        [user]
    );

    return { events, loading, createEvent, markAsExecuted, updateEvent, deleteEvent };
}
