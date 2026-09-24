import { NextResponse } from 'next/server';
import { adminAuth, loadUserEvents, sendToUser } from '@/lib/firebaseAdmin';
import { buildDigest } from '@/lib/digest';

export const dynamic = 'force-dynamic';

/** Sends a test notification to the signed-in user's devices. */
export async function POST(request: Request) {
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
        return NextResponse.json({ error: 'server-not-configured' }, { status: 500 });
    }
    const idToken = request.headers.get('authorization')?.replace(/^Bearer /, '');
    if (!idToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

    let uid: string;
    try {
        uid = (await adminAuth().verifyIdToken(idToken)).uid;
    } catch {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    try {
        const digest = buildDigest(await loadUserEvents(uid), Date.now(), 'Asia/Tokyo');
        const delivered = await sendToUser(uid, {
            title: digest ? `テスト：${digest.title}` : 'テスト通知',
            body: digest?.body ?? '通知は正しく設定されています。毎朝8時ごろにお知らせします。',
            tag: 'test',
        });
        if (delivered === 0) return NextResponse.json({ error: 'no-devices' }, { status: 404 });
        return NextResponse.json({ delivered });
    } catch (e) {
        console.error('Test notification failed:', e);
        return NextResponse.json({ error: 'server-not-configured' }, { status: 500 });
    }
}
