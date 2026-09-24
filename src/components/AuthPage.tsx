'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { Eyebrow, Segmented, cardClass, inputClass, primaryButtonClass } from '@/components/ui';

type Mode = 'signin' | 'signup' | 'reset';

const PREVIEW = [
    { en: 'HEALTH', emoji: '💪', name: 'ジム', date: '9/22 07:30', value: '2', unit: '日前', bar: 'border-l-ok', tone: 'text-ok' },
    { en: 'OTHER', emoji: '💇', name: '散髪', date: '8/17 14:00', value: '38', unit: '日前', bar: 'border-l-over', tone: 'text-over' },
];

function errorMessage(e: unknown): string {
    const err = e as { code?: string; message?: string };
    switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
            return 'メールアドレスまたはパスワードが正しくありません';
        case 'auth/email-already-in-use':
            return 'このメールアドレスは登録済みです。ログインしてください';
        case 'auth/weak-password':
            return 'パスワードは6文字以上にしてください';
        case 'auth/invalid-email':
            return 'メールアドレスの形式が正しくありません';
        case 'auth/too-many-requests':
            return '試行回数が多すぎます。しばらく待ってから再度お試しください';
        case 'auth/invalid-api-key':
            return '設定エラー: Firebase APIキーが正しくありません';
        case 'auth/network-request-failed':
            return 'ネットワークエラー。接続を確認してください';
        default:
            return `エラー: ${err.code ?? err.message ?? '不明なエラー'}`;
    }
}

export default function AuthPage() {
    const { signIn, signUp, resetPassword } = useAuth();
    const [mode, setMode] = useState<Mode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

    const switchMode = (next: Mode) => {
        setMode(next);
        setError('');
        setMessage('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);
        try {
            if (mode === 'signin') {
                await signIn(email, password);
            } else if (mode === 'signup') {
                await signUp(email, password);
            } else {
                await resetPassword(email);
                setMessage('パスワード再設定メールを送信しました');
            }
        } catch (e: unknown) {
            setError(errorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-dvh bg-canvas flex items-center justify-center px-4 py-10">
            <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
                {/* Intro */}
                <div>
                    <h1 className="text-[34px] sm:text-[40px] leading-tight font-black tracking-tight text-ink">⏱️ LifeTracker</h1>
                    <p className="mt-2 text-[15px] font-medium text-ink-2">最後にやった日を記録し、経過日数を一覧で確認できるアプリ</p>
                    <div className="mt-8 space-y-2.5 hidden lg:block" aria-hidden="true">
                        {PREVIEW.map((p) => (
                            <div key={p.name} className={`${cardClass} ${p.bar} flex items-center gap-3 px-4 py-3.5`}>
                                <div className="flex-1">
                                    <Eyebrow>{p.en}</Eyebrow>
                                    <p className="mt-1 text-[17px] font-bold text-ink">
                                        <span className="mr-1.5">{p.emoji}</span>
                                        {p.name}
                                    </p>
                                    <p className="mt-1 text-[13px] text-ink-2">{p.date}</p>
                                </div>
                                <p className={`font-black tabular-nums tracking-tight ${p.tone}`}>
                                    <span className="text-[26px]">{p.value}</span>
                                    <span className="text-xs ml-0.5">{p.unit}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className={`${cardClass} border-l-ink p-6 sm:p-7`}>
                    {mode === 'reset' ? (
                        <div className="mb-6">
                            <h2 className="text-xl font-black text-ink">🔑 パスワードの再設定</h2>
                            <p className="text-sm font-medium text-ink-2 mt-1">登録したメールアドレスに再設定用のリンクを送ります。</p>
                        </div>
                    ) : (
                        <div className="mb-6">
                            <Segmented
                                value={mode}
                                onChange={switchMode}
                                options={[
                                    ['signin', 'ログイン'],
                                    ['signup', '新規登録'],
                                ]}
                            />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-[13px] font-bold text-ink mb-1.5">
                                メールアドレス
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={inputClass}
                                placeholder="you@example.com"
                            />
                        </div>

                        {mode !== 'reset' && (
                            <div>
                                <div className="flex items-baseline justify-between mb-1.5">
                                    <label htmlFor="password" className="block text-[13px] font-bold text-ink">
                                        パスワード
                                    </label>
                                    {mode === 'signin' && (
                                        <button
                                            type="button"
                                            onClick={() => switchMode('reset')}
                                            className="text-xs font-bold text-ink-3 hover:text-ink"
                                        >
                                            お忘れですか？
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPass ? 'text' : 'password'}
                                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={mode === 'signup' ? 6 : undefined}
                                        className={`${inputClass} pr-12`}
                                        placeholder={mode === 'signup' ? '6文字以上' : ''}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        aria-label={showPass ? 'パスワードを隠す' : 'パスワードを表示'}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-over text-sm bg-over/10 rounded-xl px-3.5 py-2.5" role="alert">
                                {error}
                            </p>
                        )}
                        {message && (
                            <p className="text-fresh text-sm bg-fresh/10 rounded-xl px-3.5 py-2.5" role="status">
                                {message}
                            </p>
                        )}

                        <button type="submit" disabled={loading} className={`${primaryButtonClass} w-full !mt-6`}>
                            {loading
                                ? '処理中…'
                                : mode === 'signin'
                                  ? 'ログイン'
                                  : mode === 'signup'
                                    ? 'アカウントを作成'
                                    : '再設定メールを送る'}
                        </button>
                    </form>

                    {mode === 'reset' && (
                        <button
                            onClick={() => switchMode('signin')}
                            className="mt-5 w-full text-center text-sm font-bold text-ink-2 hover:text-ink"
                        >
                            ← ログインに戻る
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
