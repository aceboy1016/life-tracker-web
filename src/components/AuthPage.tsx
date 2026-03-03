'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Activity } from 'lucide-react';

type Mode = 'signin' | 'signup' | 'reset';

export default function AuthPage() {
    const { signIn, signUp, resetPassword } = useAuth();
    const [mode, setMode] = useState<Mode>('signin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');

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
                setMessage('パスワードリセットメールを送信しました');
            }
        } catch (e: unknown) {
            const err = e as { code?: string };
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('メールアドレスまたはパスワードが正しくありません');
            } else if (err.code === 'auth/email-already-in-use') {
                setError('このメールアドレスは既に使用されています');
            } else if (err.code === 'auth/weak-password') {
                setError('パスワードは6文字以上にしてください');
            } else {
                setError('エラーが発生しました。もう一度お試しください');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            {/* Background glow */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
            </div>

            <div className="relative w-full max-w-sm">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
                        <Activity size={28} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">LifeTracker</h1>
                    <p className="text-white/40 text-sm mt-1">何をいつしたか、ずっと覚えてる</p>
                </div>

                {/* Card */}
                <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
                    <h2 className="text-lg font-semibold text-white mb-5">
                        {mode === 'signin' ? 'ログイン' : mode === 'signup' ? 'アカウント作成' : 'パスワードリセット'}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-white/50 mb-1.5">メールアドレス</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 focus:outline-none focus:border-indigo-400/60 transition-all"
                                placeholder="you@example.com"
                            />
                        </div>

                        {mode !== 'reset' && (
                            <div>
                                <label className="block text-sm font-medium text-white/50 mb-1.5">パスワード</label>
                                <div className="relative">
                                    <input
                                        type={showPass ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/25 focus:outline-none focus:border-indigo-400/60 transition-all"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPass(!showPass)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                                    >
                                        {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        )}

                        {error && (
                            <p className="text-rose-400 text-sm bg-rose-500/10 border border-rose-500/20 rounded-xl px-3 py-2">{error}</p>
                        )}
                        {message && (
                            <p className="text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2">{message}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-indigo-500/25 mt-2"
                        >
                            {loading ? '処理中...' : mode === 'signin' ? 'ログイン' : mode === 'signup' ? 'アカウント作成' : '送信'}
                        </button>
                    </form>

                    {/* Mode switches */}
                    <div className="mt-5 space-y-2 text-center text-sm">
                        {mode === 'signin' && (
                            <>
                                <button onClick={() => { setMode('reset'); setError(''); setMessage(''); }} className="text-white/40 hover:text-white/70 transition-colors block w-full">
                                    パスワードを忘れた方はこちら
                                </button>
                                <button onClick={() => { setMode('signup'); setError(''); setMessage(''); }} className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                                    アカウントを作成する →
                                </button>
                            </>
                        )}
                        {mode === 'signup' && (
                            <button onClick={() => { setMode('signin'); setError(''); setMessage(''); }} className="text-white/40 hover:text-white/70 transition-colors">
                                ← ログインに戻る
                            </button>
                        )}
                        {mode === 'reset' && (
                            <button onClick={() => { setMode('signin'); setError(''); setMessage(''); }} className="text-white/40 hover:text-white/70 transition-colors">
                                ← ログインに戻る
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
