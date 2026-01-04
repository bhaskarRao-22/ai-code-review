import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAccessToken, clearAccessToken } from '../lib/token';
import { meApi, logoutApi } from '../features/auth/auth.api';
import { getMyBillingApi } from '../features/billing/billing.api';

export default function AppLayout() {
    const [checking, setChecking] = useState(true);
    const [isAuthed, setIsAuthed] = useState(false);
    const [userName, setUserName] = useState('');
    const [credits, setCredits] = useState<number | null>(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    useEffect(() => {
        const token = getAccessToken();
        if (!token) {
            setChecking(false);
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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">

            {/* ================= Mobile Header ================= */}
            <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                        <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                <div className="text-center">
                    <h1 className="text-sm font-semibold">AI Code Review</h1>
                    <p className="text-[11px] text-slate-400 truncate max-w-[120px]">
                        Hi, {userName}
                    </p>
                </div>

                {credits !== null && (
                    <span className="text-xs px-2 py-1 rounded-full bg-sky-500/15 border border-sky-500/40">
                        {credits}
                    </span>
                )}
            </header>

            {/* ================= Sidebar ================= */}
            <aside
                className={`
                    fixed inset-y-0 left-0 z-50 w-72
                    bg-slate-950 border-r border-slate-800
                    transform transition-transform duration-300
                    lg:static lg:translate-x-0 lg:w-64
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                `}
            >
                <div className="h-full p-4 flex flex-col">

                    {/* Mobile close */}
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                        <h2 className="font-semibold">AI Code Review</h2>
                        {credits !== null && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-sky-500/50 bg-sky-500/10 px-2 py-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] text-sky-100"> Credits: <span className="font-semibold">{credits}</span> </span>
                            </div>
                        )}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-lg hover:bg-slate-800"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Desktop title */}
                    <div className="hidden lg:block mb-6">
                        <h2 className="font-semibold text-lg">AI Code Review</h2>
                        {credits !== null && (
                            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-sky-500/50 bg-sky-500/10 px-2 py-0.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] text-sky-100"> Credits: <span className="font-semibold">{credits}</span> </span>
                            </div>
                        )}
                    </div>

                    {/* Nav */}
                    <nav className="space-y-2 flex-1">
                        <NavLink
                            to="/app/review"
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-lg text-sm ${isActive
                                    ? 'bg-sky-500 text-white'
                                    : 'hover:bg-slate-800 text-slate-300'
                                }`
                            }
                        >
                            New Review
                        </NavLink>

                        <NavLink
                            to="/app/history"
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `block px-3 py-2 rounded-lg text-sm ${isActive
                                    ? 'bg-sky-500 text-white'
                                    : 'hover:bg-slate-800 text-slate-300'
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

                    {/* User */}
                    <div className="border-t border-slate-800 pt-4 text-xs">
                        <div className="flex items-center justify-between">
                            <span className="text-slate-300 truncate">{userName}</span>
                            <button
                                onClick={handleLogout}
                                className="text-red-400 hover:text-red-500"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* ================= Overlay ================= */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ================= Main ================= */}
            <main className="flex-1 p-4 lg:p-6">
                <Outlet />
            </main>
        </div>
    );
}
