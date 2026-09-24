'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { Eyebrow, SectionTitle, Sheet, Switch, cardClass, secondaryButtonClass } from '@/components/ui';
import {
    PushSupport,
    disablePush,
    enablePush,
    getPushSupport,
    isPushEnabledOnDevice,
    sendTestNotification,
} from '@/lib/notifications';

const ERRORS: Record<string, string> = {
    'permission-denied': '通知が許可されませんでした。端末の設定から LifeTracker の通知を許可してください。',
    'missing-vapid-key': '通知の設定が完了していません（NEXT_PUBLIC_FIREBASE_VAPID_KEY が未設定）。',
    'no-devices': '通知を受け取る端末が登録されていません。一度オフにしてからオンにし直してください。',
    'server-not-configured': 'サーバー側の通知設定が完了していません（FIREBASE_SERVICE_ACCOUNT が未設定）。',
};

function messageFor(e: unknown): string {
    const key = e instanceof Error ? e.message : '';
    return ERRORS[key] ?? `エラーが発生しました（${key || '不明'}）`;
}

export default function NotificationSheet({ user, onClose }: { user: User; onClose: () => void }) {
    const [support, setSupport] = useState<PushSupport | null>(null);
    const [enabled, setEnabled] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const denied = typeof Notification !== 'undefined' && Notification.permission === 'denied';

    useEffect(() => {
        getPushSupport().then((s) => {
            setSupport(s);
            setEnabled(s === 'supported' && isPushEnabledOnDevice());
        });
    }, []);

    const toggle = async () => {
        setBusy(true);
        setError('');
        setInfo('');
        try {
            if (enabled) {
                await disablePush(user.uid);
                setEnabled(false);
            } else {
                await enablePush(user.uid);
                setEnabled(true);
                setInfo('通知をオンにしました。');
            }
        } catch (e) {
            setError(messageFor(e));
        } finally {
            setBusy(false);
        }
    };

    const test = async () => {
        setBusy(true);
        setError('');
        setInfo('');
        try {
            await sendTestNotification(user);
            setInfo('テスト通知を送信しました。');
        } catch (e) {
            setError(messageFor(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Sheet title={<SectionTitle emoji="🔔" title="Notifications" subtitle="通知" />} onClose={onClose}>
            <div className="space-y-3">
                <div className={`${cardClass} border-l-ink px-4 py-4`}>
                    <Eyebrow>Daily Digest</Eyebrow>
                    <p className="mt-1 text-[17px] font-bold text-ink">⏰ 毎朝 8:00 ごろ</p>
                    <p className="mt-1 text-[13px] text-ink-2">1週間以上やっていない項目をまとめて1通お知らせします。該当がない日は届きません。</p>
                </div>

                {support === 'needs-install' && (
                    <div className={`${cardClass} border-l-warn px-4 py-4`}>
                        <Eyebrow>Setup</Eyebrow>
                        <p className="mt-1 text-[17px] font-bold text-ink">📲 ホーム画面に追加が必要です</p>
                        <ol className="mt-3 space-y-2 text-[14px] text-ink">
                            <li className="flex gap-2.5">
                                <span className="font-black text-ink-3">1</span>Safari の共有ボタン（□↑）をタップ
                            </li>
                            <li className="flex gap-2.5">
                                <span className="font-black text-ink-3">2</span>「ホーム画面に追加」を選ぶ
                            </li>
                            <li className="flex gap-2.5">
                                <span className="font-black text-ink-3">3</span>ホーム画面の LifeTracker から開き、ここで通知をオン
                            </li>
                        </ol>
                        <p className="mt-3 text-xs text-ink-3">iOS 16.4 以降が必要です。</p>
                    </div>
                )}

                {support === 'unsupported' && (
                    <div className={`${cardClass} border-l-ink-3 px-4 py-4`}>
                        <p className="text-[15px] font-bold text-ink">このブラウザは通知に対応していません</p>
                        <p className="mt-1 text-[13px] text-ink-2">スマホの Safari（ホーム画面に追加）や Chrome でお試しください。</p>
                    </div>
                )}

                {support === 'supported' && (
                    <>
                        <div className={`${cardClass} ${enabled ? 'border-l-fresh' : 'border-l-ink-3'} flex items-center gap-3 px-4 py-4`}>
                            <div className="flex-1 min-w-0">
                                <Eyebrow>This Device</Eyebrow>
                                <p className="mt-1 text-[17px] font-bold text-ink">{enabled ? '✅ 通知オン' : '🔕 通知オフ'}</p>
                                <p className="mt-0.5 text-[13px] text-ink-2">通知は端末ごとの設定です</p>
                            </div>
                            <Switch checked={enabled} onChange={toggle} disabled={busy || (denied && !enabled)} label="この端末で通知を受け取る" />
                        </div>

                        {denied && !enabled && (
                            <p className="text-[13px] font-bold text-over px-1">
                                通知がブロックされています。端末の設定から LifeTracker の通知を許可してください。
                            </p>
                        )}

                        {enabled && (
                            <button onClick={test} disabled={busy} className={`${secondaryButtonClass} w-full`}>
                                🧪 テスト通知を送る
                            </button>
                        )}
                    </>
                )}

                {error && <p className="text-[13px] font-bold text-over px-1" role="alert">{error}</p>}
                {info && <p className="text-[13px] font-bold text-fresh px-1" role="status">{info}</p>}
            </div>
        </Sheet>
    );
}
