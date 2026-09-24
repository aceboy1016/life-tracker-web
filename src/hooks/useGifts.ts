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
import { Gift, GiftInput } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export function useGifts() {
    const { user } = useAuth();
    const [gifts, setGifts] = useState<Gift[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(getFirebaseDB(), 'users', user.uid, 'gifts'), orderBy('date', 'desc'));
        return onSnapshot(
            q,
            (snapshot) => {
                setGifts(
                    snapshot.docs.map((d) => {
                        const data = d.data();
                        return {
                            id: d.id,
                            from: data.from ?? '',
                            occasion: data.occasion ?? 'その他',
                            item: data.item ?? '',
                            amount: typeof data.amount === 'number' ? data.amount : null,
                            date: data.date instanceof Timestamp ? data.date.toDate() : new Date(),
                            returned: data.returned === true,
                            returnNote: data.returnNote ?? '',
                            notes: data.notes ?? '',
                            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : undefined,
                        };
                    })
                );
                setLoading(false);
            },
            (error) => {
                console.error('Failed to load gifts:', error);
                setLoading(false);
            }
        );
    }, [user]);

    const createGift = useCallback(
        async (data: GiftInput) => {
            if (!user) return;
            await addDoc(collection(getFirebaseDB(), 'users', user.uid, 'gifts'), { ...data, createdAt: serverTimestamp() });
        },
        [user]
    );

    const updateGift = useCallback(
        async (id: string, data: Partial<GiftInput>) => {
            if (!user) return;
            await updateDoc(doc(getFirebaseDB(), 'users', user.uid, 'gifts', id), data);
        },
        [user]
    );

    const deleteGift = useCallback(
        async (id: string) => {
            if (!user) return;
            await deleteDoc(doc(getFirebaseDB(), 'users', user.uid, 'gifts', id));
        },
        [user]
    );

    return { gifts, loading, createGift, updateGift, deleteGift };
}
