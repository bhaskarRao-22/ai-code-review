import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAccessToken, clearAccessToken } from '../lib/token';
import { meApi, logoutApi } from '../features/auth/auth.api';
import { getMyBillingApi } from '../features/billing/billing.api';

export default function AppLayout() {
    const [checking, setChecking] = useState(true);
    const [isAuthed, setIsAuthed] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const [credits, setCredits] = useState<number | null>(null);

    useEffect(() => {
        const token = getAccessToken();
        if (!token) {
            setChecking(false);
            setIsAuthed(false);
            return;
        }

        (async () => {
            try {
                const res = await meApi();
                setUserName(res.user.name);
                setIsAuthed(true);
                const billing = await getMyBillingApi();
                setCredits(billing.credits.balance);
            } catch {
                clearAccessToken();
                setIsAuthed(false);
            } finally {
                setChecking(false);
            }
        })();
    }, []);

    const handleLogout = async () => {
        try {
            await logoutApi();
        } catch {
            // ignore
        } finally {
            clearAccessToken();
            window.location.href = '/login';
        }
    };

    if (checking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100">
                <p className="text-sm text-slate-400">Checking session...</p>
            </div>
        );
    }

    if (!isAuthed) {
        return <Navigate to="/login" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex">
            {/* Sidebar */}
            <aside className="w-64 border-r border-slate-800 bg-slate-900/40 p-4 flex flex-col max-h-screen overflow-y-auto">
                <div className="mb-6">
                    <h1 className="text-lg font-semibold">AI Code Review</h1>
                    {/* <p className="text-xs text-slate-400">Powered by Gemini (default)</p> */}

                    {credits !== null && (
                        <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-sky-500/50 bg-sky-500/10 px-2 py-0.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-[11px] text-sky-100">
                                Credits: <span className="font-semibold">{credits}</span>
                            </span>
                        </div>
                    )}
                </div>

                <nav className="space-y-2 flex-1">
                    <NavLink
                        to="/app/review"
                        className={({ isActive }) =>
                            `block rounded-lg px-3 py-2 text-sm ${isActive
                                ? 'bg-sky-500 text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`
                        }
                    >
                        New Review
                    </NavLink>
                    <NavLink
                        to="/app/history"
                        className={({ isActive }) =>
                            `block rounded-lg px-3 py-2 text-sm ${isActive
                                ? 'bg-sky-500 text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`
                        }
                    >
                        History
                    </NavLink>

                    {/* <NavLink
                        to="/app/upgrade"
                        className={({ isActive }) =>
                            `block rounded-lg px-3 py-2 text-sm ${isActive
                                ? 'bg-sky-500 text-white'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`
                        }
                    >
                        Upgrade Plan
                    </NavLink> */}

                </nav>

                <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-400 flex items-center justify-between">
                    <span>
                        Logged in as <span className="font-medium">{userName}</span>
                    </span>
                    <button
                        onClick={handleLogout}
                        className="text-[11px] text-red-300 hover:text-red-400"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main area – normal scroll allowed */}
            <main className="flex-1 p-6">
                <Outlet />
            </main>
        </div>
    );
}
