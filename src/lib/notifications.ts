'use client';

import type { User } from 'firebase/auth';
import { deleteDoc, doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { deleteToken, getMessaging, getToken, isSupported } from 'firebase/messaging';
import { getFirebaseApp, getFirebaseDB } from '@/lib/firebase';

/** supported: can enable now / needs-install: iOS Safari tab, must add to home screen first / unsupported: no Web Push */
export type PushSupport = 'supported' | 'needs-install' | 'unsupported';

const TOKEN_KEY = 'lifetracker.pushToken';

function isIOS(): boolean {
    return (
        /iphone|ipad|ipod/i.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
}

export function isStandalone(): boolean {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
}

export async function getPushSupport(): Promise<PushSupport> {
    if (typeof window === 'undefined') return 'unsupported';
    if (isIOS() && !isStandalone()) return 'needs-install';
    const ok = 'serviceWorker' in navigator && 'Notification' in window && (await isSupported().catch(() => false));
    return ok ? 'supported' : 'unsupported';
}

export function registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('/sw.js').catch((e) => console.error('Service worker registration failed:', e));
}

function readStoredToken(): string | null {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

function writeStoredToken(token: string | null) {
    try {
        if (token) localStorage.setItem(TOKEN_KEY, token);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {
        // Storage unavailable (private mode); the server-side token still works.
    }
}

/** Whether this device currently has notifications turned on. */
export function isPushEnabledOnDevice(): boolean {
    return typeof Notification !== 'undefined' && Notification.permission === 'granted' && !!readStoredToken();
}

/** Must be called from a user gesture (tap) — iOS rejects permission prompts otherwise. */
export async function enablePush(uid: string): Promise<void> {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') throw new Error('permission-denied');

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) throw new Error('missing-vapid-key');

    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;
    const token = await getToken(getMessaging(getFirebaseApp()), { vapidKey, serviceWorkerRegistration: registration });

    await setDoc(doc(getFirebaseDB(), 'users', uid, 'fcmTokens', token), {
        token,
        userAgent: navigator.userAgent,
        createdAt: serverTimestamp(),
    });
    writeStoredToken(token);
}

export async function disablePush(uid: string): Promise<void> {
    const token = readStoredToken();
    if (token) await deleteDoc(doc(getFirebaseDB(), 'users', uid, 'fcmTokens', token));
    await deleteToken(getMessaging(getFirebaseApp())).catch(() => undefined);
    writeStoredToken(null);
}

export async function sendTestNotification(user: User): Promise<void> {
    const res = await fetch('/api/notifications/test', {
        method: 'POST',
        headers: { Authorization: `Bearer ${await user.getIdToken()}` },
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'send-failed');
}
