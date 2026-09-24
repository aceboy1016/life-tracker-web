import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { buildDigest, type DigestEvent } from '@/lib/digest';

function adminApp(): App {
    if (getApps().length) return getApps()[0];
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!raw) throw new Error('FIREBASE_SERVICE_ACCOUNT is not set');
    return initializeApp({ credential: cert(JSON.parse(raw)) });
}

export const adminAuth = () => getAuth(adminApp());
export const adminDb = () => getFirestore(adminApp());

const STALE_TOKEN_ERRORS = new Set([
    'messaging/registration-token-not-registered',
    'messaging/invalid-registration-token',
]);

export async function loadUserEvents(uid: string): Promise<DigestEvent[]> {
    const snap = await adminDb().collection('users').doc(uid).collection('events').get();
    return snap.docs.map((d) => {
        const data = d.data();
        return {
            name: String(data.name ?? ''),
            lastExecutedDate: data.lastExecutedDate instanceof Timestamp ? data.lastExecutedDate.toDate() : null,
        };
    });
}

/** Sends a notification to every registered device of a user and prunes dead tokens. Returns delivered count. */
export async function sendToUser(uid: string, message: { title: string; body: string; tag?: string }): Promise<number> {
    const tokensRef = adminDb().collection('users').doc(uid).collection('fcmTokens');
    const tokenDocs = (await tokensRef.get()).docs;
    if (tokenDocs.length === 0) return 0;

    const res = await getMessaging(adminApp()).sendEachForMulticast({
        tokens: tokenDocs.map((d) => d.id),
        webpush: {
            headers: { TTL: String(12 * 3600), Urgency: 'normal' },
            data: { title: message.title, body: message.body, tag: message.tag ?? 'lifetracker', url: '/' },
        },
    });

    await Promise.all(
        res.responses.map((r, i) =>
            r.error && STALE_TOKEN_ERRORS.has(r.error.code) ? tokenDocs[i].ref.delete() : null
        )
    );
    return res.successCount;
}

/** Daily digest for one user; skipped when nothing is overdue. */
export async function sendDigestToUser(uid: string, now = Date.now()): Promise<number> {
    const digest = buildDigest(await loadUserEvents(uid), now);
    if (!digest) return 0;
    return sendToUser(uid, { ...digest, tag: 'daily-digest' });
}
