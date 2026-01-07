import { useState } from 'react';
import type { FormEvent } from "react";
import { useToast } from '../../components/ToastProvider';
import { useNavigate, Link } from 'react-router-dom';
import { loginApi } from './auth.api';
import { setAccessToken } from '../../lib/token';

export default function LoginPage() {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [email, setEmail] = useState(''); // bhaskar@example.com
    const [password, setPassword] = useState(''); // password123 
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const res = await loginApi({ email, password });
            setAccessToken(res.accessToken);
            navigate('/app/review');
            showToast({ type: 'success', message: 'Logged in successfully.' });
        } catch (err: any) {
            setError(err.message || 'Failed to login');
            showToast({ type: 'error', message: err.message || 'Failed to login' });
            console.log("err ", err)
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                        Email
                    </label>
                    <input
                        type="email"
                        disabled={loading}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-200 mb-1">
                        Password
                    </label>
                    <input
                        type="password"
                        disabled={loading}
                        className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none focus:border-sky-500 disabled:opacity-60 disabled:cursor-not-allowed"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {error && (
                    <p className="text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center rounded-lg bg-sky-500 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? (
                        <>
                            <svg
                                className="mr-2 h-4 w-4 animate-spin text-white"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                            >
                                <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                />
                                <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                />
                            </svg>
                            Signing in...
                        </>
                    ) : (
                        'Sign in'
                    )}
                </button>

            </form>

            <p className="mt-4 text-center text-xs text-slate-400">
                Don&apos;t have an account?{' '}
                {loading ? (
                    <span className="cursor-not-allowed text-slate-500">
                        Register
                    </span>
                ) : (
                    <Link to="/register" className="text-sky-400 hover:underline">
                        Register
                    </Link>
                )}
            </p>
        </>
    );
}
