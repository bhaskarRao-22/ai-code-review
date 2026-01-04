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
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col lg:flex-row">
            {/* Mobile Header - Always visible on mobile */}
            <div className="lg:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/40 sticky top-0 z-40">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 transition"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M3 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <path d="M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-base font-semibold">AI Code Review</h1>
                        {userName && (
                            <p className="text-[11px] text-slate-400">Hi, {userName}</p>
                        )}
                    </div>
                </div>

                {/* Credits in mobile header */}
                {credits !== null && (
                    <div className="inline-flex items-center gap-1 rounded-full border border-sky-500/50 bg-sky-500/10 px-3 py-1">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs text-sky-100 font-medium">
                            {credits}
                        </span>
                    </div>
                )}
            </div>

            {/* Sidebar - Hidden on mobile by default */}
            <div className={`
                fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
                transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                lg:w-64 w-72 h-full
            `}>
                <aside className="w-full h-full border-r border-slate-800 bg-slate-950/95 lg:bg-slate-900/40 p-4 flex flex-col backdrop-blur-lg lg:backdrop-blur-none">
                    {/* Close button for mobile */}
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                        <h1 className="text-lg font-semibold">AI Code Review</h1>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="p-2 rounded-lg hover:bg-slate-800 text-slate-300"
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </button>
                    </div>

                    {/* Desktop title (hidden on mobile) */}
                    <div className="mb-6 hidden lg:block">
                        <h1 className="text-lg font-semibold">AI Code Review</h1>
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
                            onClick={() => setSidebarOpen(false)}
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
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `block rounded-lg px-3 py-2 text-sm ${isActive
                                    ? 'bg-sky-500 text-white'
                                    : 'text-slate-300 hover:bg-slate-800'
                                }`
                            }
                        >
                            History
                        </NavLink>
                    </nav>

                    {/* User info - Show on both mobile & desktop */}
                    <div className="mt-4 border-t border-slate-800 pt-3 text-xs text-slate-400">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center">
                                    <span className="text-[10px] font-medium">
                                        {userName?.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="truncate max-w-[140px] lg:max-w-none">
                                    <p className="font-medium text-slate-200 truncate">{userName}</p>
                                    <p className="text-[10px] truncate">Logged in</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-[11px] text-red-300 hover:text-red-400 whitespace-nowrap"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </aside>

                {/* Mobile overlay backdrop */}
                {sidebarOpen && (
                    <div
                        className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </div>

            {/* Main content area */}
            <main className="flex-1 p-4 lg:p-6">
                <Outlet />
            </main>
        </div>
    );
}