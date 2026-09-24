import { NextResponse } from 'next/server';
import { adminDb, sendDigestToUser } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/** Called once a day by Vercel Cron (see vercel.json). Vercel sends `Authorization: Bearer $CRON_SECRET`. */
export async function GET(request: Request) {
    const secret = process.env.CRON_SECRET;
    if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        return NextResponse.json({ error: 'server-not-configured' }, { status: 500 });
    }

    const tokenDocs = await adminDb().collectionGroup('fcmTokens').get();
    const uids = [...new Set(tokenDocs.docs.map((d) => d.ref.parent.parent?.id).filter((id): id is string => !!id))];

    let delivered = 0;
    const failures: string[] = [];
    for (const uid of uids) {
        try {
            delivered += await sendDigestToUser(uid);
        } catch (e) {
            console.error(`Digest failed for ${uid}:`, e);
            failures.push(uid);
        }
    }

    return NextResponse.json({ users: uids.length, delivered, failed: failures.length });
}
