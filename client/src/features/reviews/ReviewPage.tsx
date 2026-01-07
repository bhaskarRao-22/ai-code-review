// client/src/features/reviews/ReviewPage.tsx
import { useEffect, useState } from 'react';
import { createSimpleReviewApi, type SimpleReviewResult } from './reviews.api';
import { useToast } from '../../components/ToastProvider';
import CodeBlock from '../../components/CodeBlock';
import { motion } from 'framer-motion';

export default function ReviewPage() {
    const { showToast } = useToast();

    const [code, setCode] = useState('');
    const [language, setLanguage] = useState('javascript');
    const [provider, setProvider] = useState('gemini');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<SimpleReviewResult | null>(null);
    // const [copied, setCopied] = useState(false);

    useEffect(() => {
        const stored = sessionStorage.getItem("rerun-review");
        if (!stored) return;

        const payload = JSON.parse(stored);
        sessionStorage.removeItem('rerun-review');

        setCode(payload.code || '');
        setLanguage(payload.language || 'javascript');
        setProvider(payload.provider || 'gemini');

        handleRunReview({
            code: payload.code,
            language: payload.language,
            provider: payload.provider,
            title: payload.title
        });
    }, []);

    async function handleRunReview(
        override?: {
            code?: string;
            language?: string;
            provider?: string;
            title?: string;
        }) {
        setError(null);
        setResult(null);

        const finalCode = (override?.code ?? code) || '';
        const finalLanguage = override?.language ?? language;
        const finalProvider = override?.provider ?? provider;
        const finalTitle = override?.title ?? 'Quick review';

        if (!finalCode.trim()) {
            const msg = 'Please paste some code first.';
            setError(msg);
            showToast({ type: 'error', message: msg });
            return;
        }

        // if (!code.trim()) {
        //     const msg = 'Please paste some code first.';
        //     setError(msg);
        //     showToast({ type: 'error', message: msg });
        //     return;
        // }

        try {
            setLoading(true);
            const res = await createSimpleReviewApi({
                title: finalTitle,
                language: finalLanguage,
                provider: finalProvider,
                code: finalCode
            });
            setResult(res.result);
            showToast({ type: 'success', message: 'Review completed successfully.' });
        } catch (err: any) {
            const msg = err.message || 'Failed to run review';
            setError(msg);
            if (err.code === 'INSUFFICIENT_CREDITS' || err?.status === 402) {
                showToast({
                    type: 'error',
                    message: 'You are out of credits. Please upgrade your plan or contact support.'
                });
            } else {
                showToast({ type: 'error', message: msg });
            }
        } finally {
            setLoading(false);
        }
    }

    const disableInputs = loading;

    return (
        <div className="h-full flex flex-col lg:grid lg:gap-6 lg:grid-cols-2">
            {/* Left: input panel */}
            <section className="flex flex-col h-full rounded-xl lg:rounded-2xl border border-slate-800 bg-slate-900/40 p-3 lg:p-4 mb-4 lg:mb-0">
                <div className="mb-3 flex items-center justify-between">
                    <div>
                        <h2 className="text-base lg:text-lg font-semibold">New Code Review</h2>
                        <p className="text-xs text-slate-400">
                            Paste your code and let AI review it.
                        </p>
                    </div>
                </div>

                {/* Scrollable input area */}
                <div className="flex-1 min-h-0 flex flex-col">
                    <textarea
                        className="flex-1 min-h-0 w-full resize-none rounded-lg lg:rounded-xl border border-slate-800 bg-slate-950 p-3 text-sm text-slate-100 outline-none focus:border-sky-500 disabled:opacity-60"
                        placeholder="Paste your JavaScript/React/Node.js code here..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        disabled={disableInputs}
                    />

                    {error && (
                        <p className="mt-2 text-xs text-red-400 bg-red-950/40 border border-red-800 rounded-lg px-3 py-2">
                            {error}
                        </p>
                    )}
                </div>
                
                {/* Controls */}
                <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center lg:flex-nowrap">

                    {/* Dropdowns */}
                    <div className="flex flex-col gap-2 xs:flex-row lg:flex-row lg:gap-3">
                        <select
                            className="w-full xs:w-auto lg:w-36 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 disabled:opacity-60"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            disabled={disableInputs}
                        >
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="jsx">React (JSX)</option>
                            <option value="tsx">React (TSX)</option>
                        </select>

                        <select
                            className="w-full xs:w-auto lg:w-36 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs text-slate-100 disabled:opacity-60"
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            disabled={disableInputs}
                        >
                            <option value="gemini">Gemini (default)</option>
                            <option value="groq">Groq</option>
                            <option value="openai">OpenAI</option>
                        </select>
                    </div>

                    {/* Button */}
                    <button
                        onClick={() => handleRunReview()}
                        disabled={loading}
                        className="w-full lg:w-auto lg:ml-auto rounded-lg bg-sky-500 px-6 py-2 text-sm font-medium text-white hover:bg-sky-600 disabled:opacity-60 whitespace-nowrap"
                    >
                        {loading ? 'Reviewing...' : 'Run Review'}
                    </button>
                </div>

            </section>

            {/* Right: result panel */}
            <section className="flex flex-col h-full rounded-xl lg:rounded-2xl border border-slate-800 bg-slate-900/40 p-3 lg:p-4">
                <h2 className="text-base lg:text-lg font-semibold mb-2">Review Result</h2>

                <div className="flex-1 min-h-0 overflow-y-auto pr-1">
                    {/* Loader state */}
                    {loading && (
                        <div className="h-full flex flex-col items-center justify-center text-slate-200 py-8">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="ai-scan-wrapper scale-75 lg:scale-100"
                            >
                                <div className="ai-scan-wrapper scale-75 lg:scale-100">
                                    <div className="ai-scan-card">
                                        {/* Grid dots background */}
                                        <div className="ai-grid-dots">
                                            {Array.from({ length: 90 }).map((_, i) => (
                                                <div key={i} className="ai-grid-dot" />
                                            ))}
                                        </div>

                                        {/* Scanning overlay with gradient */}
                                        <div className="ai-scan-overlay">
                                            <div className="ai-scan-line" />
                                        </div>

                                        {/* Center orb */}
                                        <div className="ai-center-orb">
                                            <div className="ai-orb-glow" />
                                        </div>

                                        {/* Scanning circles */}
                                        <div className="ai-scan-circles">
                                            <div className="ai-scan-circle ai-scan-circle-1" />
                                            <div className="ai-scan-circle ai-scan-circle-2" />
                                            <div className="ai-scan-circle ai-scan-circle-3" />
                                        </div>
                                    </div>

                                    <div className="text-center mt-6">
                                        <p className="text-sm font-medium">AI is reviewing your code…</p>
                                        <p className="text-xs text-slate-400 mt-1 max-w-xs">
                                            Running static checks, scanning for bugs, security risks and performance
                                            issues.
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-medium mt-6"
                            >
                                AI is reviewing your code…
                            </motion.p>
                        </div>
                    )}

                    {!loading && !result && (
                        <p className="text-xs text-slate-400">
                            No review yet. Paste your code and click “Run Review”.
                        </p>
                    )}

                    {!loading && result && (
                        <div className="space-y-4 text-sm pb-2">
                            <div>
                                <h3 className="font-semibold text-slate-100 mb-1">Summary</h3>
                                <p className="text-slate-300 text-xs">
                                    {result.overallSummary}
                                </p>
                            </div>

                            {result.syntax?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-slate-100 mb-1">
                                        Syntax & Errors
                                    </h3>
                                    <ul className="space-y-1 text-xs text-red-300">
                                        {result.syntax.map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="rounded border border-red-800/70 bg-red-950/30 px-2 py-1"
                                            >
                                                <p>{item.message}</p>
                                                {item.lineHint && (
                                                    <p className="mt-0.5 text-[11px] text-red-200/80">
                                                        Hint: <code>{item.lineHint}</code>
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {result.quality?.length > 0 && (
                                <div>
                                    <h3 className="font-semibold text-slate-100 mb-1">
                                        Code Quality
                                    </h3>
                                    <ul className="space-y-1 text-xs text-amber-200">
                                        {result.quality.map((item, idx) => (
                                            <li
                                                key={idx}
                                                className="rounded border border-amber-500/40 bg-amber-900/20 px-2 py-1"
                                            >
                                                <p>{item.message}</p>
                                                {item.lineHint && (
                                                    <p className="mt-0.5 text-[11px] text-amber-100/90">
                                                        Hint: <code>{item.lineHint}</code>
                                                    </p>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {result.refactoredCode && (
                                <CodeBlock
                                    code={result.refactoredCode}
                                    // ReviewPage ke language state se map:
                                    language={
                                        language === 'typescript'
                                            ? 'typescript'
                                            : language === 'jsx'
                                                ? 'jsx'
                                                : language === 'tsx'
                                                    ? 'tsx'
                                                    : 'javascript'
                                    }
                                    title="Refactored Code"
                                    className="mt-1"
                                />
                            )}

                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}
