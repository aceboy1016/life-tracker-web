import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { buildDigest, type DigestBirthday, type DigestEvent } from '@/lib/digest';
import { tracksAnniversaries } from '@/types';

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

export async function loadUserData(uid: string): Promise<{ events: DigestEvent[]; birthdays: DigestBirthday[] }> {
    const userRef = adminDb().collection('users').doc(uid);
    const [eventSnap, birthdaySnap] = await Promise.all([userRef.collection('events').get(), userRef.collection('birthdays').get()]);
    return {
        events: eventSnap.docs.map((d) => {
            const data = d.data();
            return {
                name: String(data.name ?? ''),
                isMilestone: tracksAnniversaries(data.group) || (data.group === undefined && data.kind === 'milestone'),
                lastExecutedDate: data.lastExecutedDate instanceof Timestamp ? data.lastExecutedDate.toDate() : null,
            };
        }),
        birthdays: birthdaySnap.docs.map((d) => {
            const data = d.data();
            return {
                name: String(data.name ?? ''),
                month: Number(data.month) || 1,
                day: Number(data.day) || 1,
                year: typeof data.year === 'number' ? data.year : null,
                remindDaysBefore: typeof data.remindDaysBefore === 'number' ? data.remindDaysBefore : 7,
            };
        }),
    };
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

/** Daily digest for one user; skipped when there is nothing to tell. */
export async function sendDigestToUser(uid: string, now = Date.now()): Promise<number> {
    const digest = buildDigest(await loadUserData(uid), now, 'Asia/Tokyo');
    if (!digest) return 0;
    return sendToUser(uid, { ...digest, tag: 'daily-digest' });
}
