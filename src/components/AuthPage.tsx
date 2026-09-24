'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { Logo, inputClass, primaryButtonClass } from '@/components/ui';

type Mode = 'signin' | 'signup' | 'reset';

const PREVIEW = [
    { emoji: '💪', tile: 'bg-rose-500/12', name: 'ジム', value: '2', unit: '日', tone: 'text-ok' },
    { emoji: '💇', tile: 'bg-violet-500/12', name: '散髪', value: '5', unit: '週', tone: 'text-over' },
    { emoji: '📞', tile: 'bg-amber-500/14', name: '実家に電話', value: '3', unit: '時間', tone: 'text-fresh' },
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
                    <div className="flex items-center gap-2.5">
                        <Logo size={36} />
                        <span className="text-ink font-bold tracking-tight text-lg">LifeTracker</span>
                    </div>
                    <h1 className="mt-8 text-[32px] sm:text-4xl leading-[1.2] font-bold tracking-tight text-ink">
                        あれ、最後に
                        <br />
                        いつやったっけ？
                    </h1>
                    <p className="mt-3 text-ink-2 leading-relaxed">
                        ジム、散髪、実家への電話。
                        <br className="sm:hidden" />
                        やったらワンタップで記録して、ご無沙汰なことに気づけます。
                    </p>
                    <div className="mt-8 space-y-2 hidden lg:block" aria-hidden="true">
                        {PREVIEW.map((p, i) => (
                            <div
                                key={p.name}
                                className="flex items-center gap-3.5 bg-surface border border-line rounded-2xl p-3"
                                style={{ marginLeft: i * 20 }}
                            >
                                <div className={`w-11 h-11 rounded-xl ${p.tile} flex items-center justify-center text-xl`}>
                                    {p.emoji}
                                </div>
                                <p className="flex-1 font-semibold text-ink text-[15px]">{p.name}</p>
                                <p className={`font-bold tabular-nums ${p.tone}`}>
                                    <span className="text-2xl">{p.value}</span>
                                    <span className="text-xs ml-0.5">{p.unit}前</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Form */}
                <div className="bg-surface border border-line rounded-[28px] p-6 sm:p-7 shadow-[0_24px_60px_-30px_rgba(0,0,0,0.3)]">
                    {mode === 'reset' ? (
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-ink">パスワードの再設定</h2>
                            <p className="text-sm text-ink-2 mt-1">登録したメールアドレスに再設定用のリンクを送ります。</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 p-1 bg-surface-2 rounded-xl mb-6">
                            {(
                                [
                                    ['signin', 'ログイン'],
                                    ['signup', '新規登録'],
                                ] as [Mode, string][]
                            ).map(([key, label]) => (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() => switchMode(key)}
                                    aria-pressed={mode === key}
                                    className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                                        mode === key ? 'bg-surface text-ink shadow-sm' : 'text-ink-2 hover:text-ink'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-[13px] font-semibold text-ink-2 mb-1.5">
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
                                    <label htmlFor="password" className="block text-[13px] font-semibold text-ink-2">
                                        パスワード
                                    </label>
                                    {mode === 'signin' && (
                                        <button
                                            type="button"
                                            onClick={() => switchMode('reset')}
                                            className="text-xs text-ink-3 hover:text-ink transition-colors"
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
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink transition-colors"
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
                            className="mt-5 w-full text-center text-sm text-ink-2 hover:text-ink transition-colors"
                        >
                            ← ログインに戻る
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
