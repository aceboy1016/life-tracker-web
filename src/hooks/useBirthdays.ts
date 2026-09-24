'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getFirebaseDB } from '@/lib/firebase';
import { Birthday, BirthdayInput } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useBirthdays() {
    const { user } = useAuth();
    const [birthdays, setBirthdays] = useState<Birthday[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        return onSnapshot(
            collection(getFirebaseDB(), 'users', user.uid, 'birthdays'),
            (snapshot) => {
                setBirthdays(
                    snapshot.docs.map((d) => {
                        const data = d.data();
                        return {
                            id: d.id,
                            name: data.name ?? '',
                            reading: data.reading ?? '',
                            month: Number(data.month) || 1,
                            day: Number(data.day) || 1,
                            year: typeof data.year === 'number' ? data.year : null,
                            relation: data.relation ?? '',
                            remindDaysBefore: typeof data.remindDaysBefore === 'number' ? data.remindDaysBefore : 7,
                            notes: data.notes ?? '',
                            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
                        };
                    })
                );
                setLoading(false);
            },
            (error) => {
                console.error('Failed to load birthdays:', error);
                setLoading(false);
            }
        );
    }, [user]);

    const createBirthday = useCallback(
        async (data: BirthdayInput) => {
            if (!user) return;
            await addDoc(collection(getFirebaseDB(), 'users', user.uid, 'birthdays'), { ...data, createdAt: serverTimestamp() });
        },
        [user]
    );

    const updateBirthday = useCallback(
        async (id: string, data: Partial<BirthdayInput>) => {
            if (!user) return;
            await updateDoc(doc(getFirebaseDB(), 'users', user.uid, 'birthdays', id), data);
        },
        [user]
    );

    const deleteBirthday = useCallback(
        async (id: string) => {
            if (!user) return;
            await deleteDoc(doc(getFirebaseDB(), 'users', user.uid, 'birthdays', id));
        },
        [user]
    );

    return { birthdays, loading, createBirthday, updateBirthday, deleteBirthday };
}
