'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';
import { Segmented, cardClass, inputClass, primaryButtonClass } from '@/components/ui';
import { IconTile } from '@/lib/icons';

type Mode = 'signin' | 'signup' | 'reset';

const PREVIEW = [
    { icon: 'ring', name: 'プロポーズした日', value: '732', unit: '日', sub: '2年' },
    { icon: 'scissors', name: '髪を切る', value: '38', unit: '日前', sub: '前回 8月17日' },
    { icon: 'gift', name: '結婚祝い · 田中さん', value: '¥30,000', unit: '', sub: 'お返し前' },
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
        <div className="min-h-dvh bg-canvas flex items-center justify-center px-5 py-12">
            <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                <div>
                    <p className="text-[13px] font-medium text-ink-3 tracking-wide">LifeTracker</p>
                    <h1 className="mt-3 text-[30px] sm:text-[34px] leading-[1.35] font-bold text-ink">
                        あの日から何日。
                        <br />
                        前回はいつ。
                        <br />
                        誰に何をもらったか。
                    </h1>
                    <p className="mt-4 text-[14px] text-ink-2 leading-relaxed">
                        記念日、くり返すこと、いただきものを
                        <br className="hidden sm:block" />
                        ひとつの場所に。
                    </p>
                    <div className={`${cardClass} mt-8 divide-y divide-line hidden lg:block`} aria-hidden="true">
                        {PREVIEW.map((p) => (
                            <div key={p.name} className="flex items-center gap-3.5 px-4 py-3.5">
                                <IconTile name={p.icon} size={40} />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-medium text-ink truncate">{p.name}</p>
                                    <p className="text-[12px] text-ink-3 mt-0.5">{p.sub}</p>
                                </div>
                                <p className="text-ink tabular-nums">
                                    <span className="text-[20px] font-semibold tracking-tight">{p.value}</span>
                                    {p.unit && <span className="text-[12px] text-ink-2 ml-0.5">{p.unit}</span>}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`${cardClass} p-6 sm:p-7`}>
                    {mode === 'reset' ? (
                        <div className="mb-6">
                            <h2 className="text-[18px] font-bold text-ink">パスワードの再設定</h2>
                            <p className="text-[13px] text-ink-2 mt-1">登録したメールアドレスに再設定用のリンクを送ります。</p>
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
                            <label htmlFor="email" className="block text-[12px] font-medium text-ink-2 mb-2 px-1">
                                メールアドレス
                            </label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className={`${inputClass} bg-canvas`}
                                placeholder="you@example.com"
                            />
                        </div>

                        {mode !== 'reset' && (
                            <div>
                                <div className="flex items-baseline justify-between mb-2 px-1">
                                    <label htmlFor="password" className="block text-[12px] font-medium text-ink-2">
                                        パスワード
                                    </label>
                                    {mode === 'signin' && (
                                        <button type="button" onClick={() => switchMode('reset')} className="text-[12px] text-ink-3 hover:text-ink">
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
                                        className={`${inputClass} bg-canvas pr-12`}
                                        placeholder={mode === 'signup' ? '6文字以上' : ''}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        aria-label={showPass ? 'パスワードを隠す' : 'パスワードを表示'}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-3 hover:text-ink"
                                    >
                                        {showPass ? <EyeOff size={17} strokeWidth={1.6} /> : <Eye size={17} strokeWidth={1.6} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-alert text-[13px] bg-alert-soft rounded-xl px-3.5 py-2.5" role="alert">
                                {error}
                            </p>
                        )}
                        {message && (
                            <p className="text-accent text-[13px] bg-accent-soft rounded-xl px-3.5 py-2.5" role="status">
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
                        <button onClick={() => switchMode('signin')} className="mt-5 w-full text-center text-[13px] text-ink-2 hover:text-ink">
                            ログインに戻る
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
