import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-xl">
                <div className="mb-6 text-center">
                    <h1 className="text-2xl font-semibold text-white">
                        AI Code Review Assistant
                    </h1>
                    <p className="mt-1 text-sm text-slate-400">
                        Sign in to review and optimize your code with AI.
                    </p>
                </div>
                <Outlet />
            </div>
        </div>
    );
}
