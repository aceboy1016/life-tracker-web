'use client';

import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { GroupHeader, Switch, cardClass, secondaryButtonClass } from '@/components/ui';
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

export default function SettingsTab({ user, onLogOut }: { user: User; onLogOut: () => void }) {
    const [support, setSupport] = useState<PushSupport | null>(null);
    const [enabled, setEnabled] = useState(false);
    const [denied, setDenied] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');

    useEffect(() => {
        getPushSupport().then((s) => {
            setSupport(s);
            setEnabled(s === 'supported' && isPushEnabledOnDevice());
            setDenied(typeof Notification !== 'undefined' && Notification.permission === 'denied');
        });
    }, []);

    const run = async (fn: () => Promise<void>) => {
        setBusy(true);
        setError('');
        setInfo('');
        try {
            await fn();
        } catch (e) {
            setError(messageFor(e));
        } finally {
            setBusy(false);
        }
    };

    const toggle = () =>
        run(async () => {
            if (enabled) {
                await disablePush(user.uid);
                setEnabled(false);
            } else {
                await enablePush(user.uid);
                setEnabled(true);
                setInfo('通知をオンにしました');
            }
        });

    return (
        <div className="space-y-8">
            <section>
                <GroupHeader title="通知" />
                <div className={`${cardClass} divide-y divide-line`}>
                    <div className="px-4 py-3.5">
                        <p className="text-[15px] font-medium text-ink">毎朝 8:00 ごろ</p>
                        <p className="text-[12px] text-ink-3 mt-1 leading-relaxed">
                            誕生日（当日と、人ごとに設定した日）と、「人生の節目」の記念日（例：プロポーズから2年、付き合って3,000日）をお知らせします。何もない日は届きません。
                        </p>
                    </div>

                    {support === 'supported' && (
                        <div className="flex items-center gap-3 px-4 py-3.5">
                            <div className="flex-1">
                                <p className="text-[15px] text-ink">この端末で受け取る</p>
                                {denied && !enabled && (
                                    <p className="text-[12px] text-alert mt-1">端末の設定で通知がブロックされています</p>
                                )}
                            </div>
                            <Switch checked={enabled} onChange={toggle} disabled={busy || (denied && !enabled)} label="この端末で通知を受け取る" />
                        </div>
                    )}

                    {support === 'needs-install' && (
                        <div className="px-4 py-3.5">
                            <p className="text-[15px] font-medium text-ink">ホーム画面に追加すると使えます</p>
                            <ol className="mt-2.5 space-y-1.5 text-[13px] text-ink-2">
                                <li>1. Safari の共有ボタンをタップ</li>
                                <li>2.「ホーム画面に追加」を選ぶ</li>
                                <li>3. ホーム画面の LifeTracker を開いて、ここで通知をオン</li>
                            </ol>
                            <p className="mt-2.5 text-[12px] text-ink-3">iOS 16.4 以降</p>
                        </div>
                    )}

                    {support === 'unsupported' && (
                        <div className="px-4 py-3.5">
                            <p className="text-[14px] text-ink-2">このブラウザは通知に対応していません</p>
                        </div>
                    )}
                </div>

                {enabled && (
                    <button onClick={() => run(async () => { await sendTestNotification(user); setInfo('テスト通知を送信しました'); })} disabled={busy} className={`${secondaryButtonClass} w-full mt-2.5`}>
                        テスト通知を送る
                    </button>
                )}
                {error && <p className="text-[12px] text-alert mt-2.5 px-1" role="alert">{error}</p>}
                {info && <p className="text-[12px] text-accent mt-2.5 px-1" role="status">{info}</p>}
            </section>

            <section>
                <GroupHeader title="アカウント" />
                <div className={`${cardClass} divide-y divide-line`}>
                    <div className="px-4 py-3.5">
                        <p className="text-[12px] text-ink-3">ログイン中</p>
                        <p className="text-[15px] text-ink mt-0.5 truncate">{user.email}</p>
                    </div>
                    <button onClick={onLogOut} className="w-full text-left px-4 py-3.5 text-[15px] text-alert hover:bg-surface-2/60">
                        ログアウト
                    </button>
                </div>
            </section>
        </div>
    );
}
