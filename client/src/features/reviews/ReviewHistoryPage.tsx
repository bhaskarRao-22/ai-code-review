import { useEffect, useState } from 'react';
import {
    listReviewsApi,
    type ReviewRequestItem,
    getReviewByIdApi,
    type ReviewDetailResponse
} from './reviews.api';
import CodeBlock from '../../components/CodeBlock';
import { useNavigate } from 'react-router-dom';

export default function ReviewHistoryPage() {
    const navigate = useNavigate();
    const [items, setItems] = useState<ReviewRequestItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // filters
    const [search, setSearch] = useState('');
    const [providerFilter, setProviderFilter] = useState<'all' | 'gemini' | 'groq' | 'openai'>('all');
    const [languageFilter, setLanguageFilter] =
        useState<'all' | 'javascript' | 'typescript' | 'jsx' | 'tsx'>('all');

    // detail modal state
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);
    const [detailData, setDetailData] = useState<ReviewDetailResponse | null>(null);

    async function loadReviews(opts?: { keepLoading?: boolean }) {
        if (!opts?.keepLoading) {
            setLoading(true);
        }
        setError(null);

        try {
            const res = await listReviewsApi({
                limit: 20,
                page: 1,
                search: search.trim() || undefined,
                provider: providerFilter,
                language: languageFilter
            });

            setItems(res.items);
        } catch (err: any) {
            setError(err.message || 'Failed to load history');
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        // initial load
        loadReviews({ keepLoading: false });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const res = await listReviewsApi({ limit: 20, page: 1 });
    //             setItems(res.items);
    //         } catch (err: any) {
    //             setError(err.message || 'Failed to load history');
    //         } finally {
    //             setLoading(false);
    //         }
    //     })();
    // }, []);

    async function handleViewDetails(id: string) {
        setDetailOpen(true);
        setDetailLoading(true);
        setDetailError(null);
        setDetailData(null);

        try {
            const res = await getReviewByIdApi(id);
            setDetailData(res);
        } catch (err: any) {
            setDetailError(err.message || 'Failed to load review details');
        } finally {
            setDetailLoading(false);
        }
    }

    function closeDetail() {
        setDetailOpen(false);
        setDetailData(null);
        setDetailError(null);
    }

    function handleClearFilters() {
        setSearch('');
        setProviderFilter('all');
        setLanguageFilter('all');
        // loadReviews();

        (async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await listReviewsApi({
                    limit: 20,
                    page: 1
                    // search / provider / language mat bhejo => sab data aayega
                });
                setItems(res.items);
            } catch (err: any) {
                setError(err.message || 'Failed to load history');
            } finally {
                setLoading(false);
            }
        })();
    }

    function handleReRun(data: ReviewDetailResponse) {
        if (!data) return;

        const payload = {
            code: data.reviewRequest.code,
            language: data.reviewRequest.language,
            provider: data.reviewRequest.provider,
            title: data.reviewRequest.title || "Re-Run Review"
        };

        // save payload temporarily in sessionStorage
        sessionStorage.setItem("rerun-review", JSON.stringify(payload));

        // close modal
        closeDetail();

        // navigate to review page
        navigate("/app/review");
    }


    // if (loading) {
    //     return <p className="text-xs text-slate-400">Loading history...</p>;
    // }

    // if (error) {
    //     return <p className="text-xs text-red-400">{error}</p>;
    // }

    // if (items.length === 0) {
    //     return (
    //         <p className="text-xs text-slate-400">
    //             No reviews yet. Run your first code review!
    //         </p>
    //     );
    // }

    return (
        <div className="h-full flex flex-col">
            <div className="mb-3">
                <h2 className="text-base lg:text-lg font-semibold">Review History</h2>
                <p className="text-xs text-slate-400">
                    Search your past code reviews, or filter by AI provider and language.
                </p>

                {/* Mobile: Stack filters vertically */}
                <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-2">
                    {/* Search box */}
                    <div className="w-full sm:flex-1 min-w-0">
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title or code snippet..."
                            className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-sky-500"
                        />
                    </div>

                    <div className="flex gap-2">
                        {/* Provider filter */}
                        <select
                            value={providerFilter}
                            onChange={(e) => setProviderFilter(e.target.value as any)}
                            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-sky-500"
                        >
                            <option value="all">All providers</option>
                            <option value="gemini">Gemini</option>
                            <option value="groq">Groq</option>
                            <option value="openai">OpenAI</option>
                        </select>


                        {/* Language filter */}
                        <select
                            value={languageFilter}
                            onChange={(e) => setLanguageFilter(e.target.value as any)}
                            className="flex-1 rounded-lg border border-slate-800 bg-slate-950 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-sky-500"
                        >
                            <option value="all">All languages</option>
                            <option value="javascript">JavaScript</option>
                            <option value="typescript">TypeScript</option>
                            <option value="jsx">React (JSX)</option>
                            <option value="tsx">React (TSX)</option>
                        </select>
                    </div>
                    {/* Apply & Clear buttons */}
                    <button
                        onClick={() => loadReviews()}
                        className="flex-1 rounded-lg bg-sky-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-sky-600"
                    >
                        Apply
                    </button>
                    <button
                        onClick={handleClearFilters}
                        className="flex-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
                    >
                        Clear
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-auto rounded-xl border border-slate-800">
                {loading ? (
                    <p className="text-xs text-slate-400 px-3 py-3">Loading history...</p>
                ) : error ? (
                    <p className="text-xs text-red-400 px-3 py-3">{error}</p>
                ) : items.length === 0 ? (
                    <p className="text-xs text-slate-400 px-3 py-3">
                        No reviews found for this filter.
                    </p>
                ) : (
                    <div className="min-w-[600px] lg:min-w-0">
                        <table className="w-full text-xs">
                            <thead className="bg-slate-900/80 sticky top-0 z-10">
                                <tr>
                                    <th className="px-3 py-2 text-left font-medium text-slate-300">
                                        Title
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-300 hidden sm:table-cell">
                                        Language
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-300 hidden md:table-cell">
                                        Provider
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-300">
                                        Status
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-300 hidden lg:table-cell">
                                        Created
                                    </th>
                                    <th className="px-3 py-2 text-left font-medium text-slate-3000">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800 bg-slate-950/60">
                                {items.map((item) => (
                                    <tr key={item._id}>
                                        <td className="px-3 py-2 text-slate-100 max-w-[120px] truncate">
                                            {item.title || 'Untitled review'}
                                        </td>
                                        <td className="px-3 py-2 text-slate-300 hidden sm:table-cell">
                                            {item.language}
                                        </td>
                                        <td className="px-3 py-2 text-slate-300 uppercase text-[11px] hidden md:table-cell">
                                            {item.provider}
                                        </td>
                                        <td className="px-3 py-2">
                                            <span
                                                className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${item.status === 'completed'
                                                    ? 'bg-emerald-900/50 text-emerald-200 border border-emerald-700/70'
                                                    : item.status === 'failed'
                                                        ? 'bg-red-900/40 text-red-200 border border-red-700/70'
                                                        : 'bg-slate-800/70 text-slate-200 border border-slate-700/70'
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-3 py-2 text-slate-400 hidden lg:table-cell">
                                            {new Date(item.createdAt).toLocaleString()}
                                        </td>
                                        <td className="px-3 py-2">
                                            <button
                                                onClick={() => handleViewDetails(item._id)}
                                                className="rounded-md border border-slate-700 bg-slate-800/80 px-2 py-1 text-[11px] text-slate-100 hover:bg-slate-700"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Detail modal */}
            {detailOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="w-full max-w-5xl h-[90vh] rounded-xl lg:rounded-2xl border border-slate-800 bg-slate-950 p-3 lg:p-4 flex flex-col">
                        <div className="flex items-center justify-between mb-3">
                            <div className="max-w-[70%]">
                                <h3 className="text-sm font-semibold text-slate-100 truncate">
                                    Review details
                                </h3>
                                {detailData && (
                                    <p className="text-[11px] text-slate-400 truncate">
                                        {detailData.reviewRequest.language.toUpperCase()} •{' '}
                                        {detailData.reviewRequest.provider.toUpperCase()} •{' '}
                                        {new Date(
                                            detailData.reviewRequest.createdAt
                                        ).toLocaleString()}
                                    </p>
                                )}
                            </div>
                            <div>
                                {detailData && (
                                    <button
                                        onClick={() => handleReRun(detailData)}
                                        className="rounded-md border border-sky-600 bg-sky-700/70 px-2 py-1 text-[11px] text-white hover:bg-sky-600 whitespace-nowrap"
                                    >
                                        Re-Run
                                    </button>
                                )}
                                <button
                                    onClick={closeDetail}
                                    className="rounded-md border border-slate-700 bg-red-800/80 px-2 py-1 text-[11px] text-slate-200 hover:bg-red-700"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1">
                            {detailLoading && (
                                <p className="text-xs text-slate-400">
                                    Loading review details...
                                </p>
                            )}

                            {detailError && (
                                <p className="text-xs text-red-400">{detailError}</p>
                            )}

                            {detailData && !detailLoading && !detailError && (
                                <>
                                    {/* Summary */}
                                    {detailData.reviewResult?.summary && (
                                        <div>
                                            <h4 className="text-xs font-semibold text-slate-100 mb-1">
                                                Summary
                                            </h4>
                                            <p className="text-xs text-slate-300">
                                                {detailData.reviewResult.summary}
                                            </p>
                                        </div>
                                    )}

                                    {/* Original code */}
                                    <CodeBlock
                                        code={detailData.reviewRequest.code}
                                        language={
                                            (detailData.reviewRequest.language as any) || 'javascript'
                                        }
                                        title="Original code"
                                    />

                                    {/* Refactored code */}
                                    {detailData.reviewResult?.refactoredCode && (
                                        <CodeBlock
                                            code={detailData.reviewResult.refactoredCode}
                                            language={
                                                (detailData.reviewRequest.language as any) ||
                                                'javascript'
                                            }
                                            title="Refactored code"
                                        />
                                    )}

                                    {/* Syntax issues */}
                                    {detailData.reviewResult?.issues?.syntax &&
                                        detailData.reviewResult.issues.syntax.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-100 mb-1">
                                                    Syntax & errors
                                                </h4>
                                                <ul className="space-y-1 text-[11px] text-red-300">
                                                    {detailData.reviewResult.issues.syntax.map(
                                                        (item, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="rounded border border-red-800/70 bg-red-950/30 px-2 py-1"
                                                            >
                                                                <p>{item.message}</p>
                                                                {item.lineHint && (
                                                                    <p className="mt-0.5 text-[10px] text-red-200/80">
                                                                        Hint: <code>{item.lineHint}</code>
                                                                    </p>
                                                                )}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}

                                    {/* Quality issues */}
                                    {detailData.reviewResult?.issues?.quality &&
                                        detailData.reviewResult.issues.quality.length > 0 && (
                                            <div>
                                                <h4 className="text-xs font-semibold text-slate-100 mb-1">
                                                    Code quality
                                                </h4>
                                                <ul className="space-y-1 text-[11px] text-amber-200">
                                                    {detailData.reviewResult.issues.quality.map(
                                                        (item, idx) => (
                                                            <li
                                                                key={idx}
                                                                className="rounded border border-amber-500/40 bg-amber-900/20 px-2 py-1"
                                                            >
                                                                <p>{item.message}</p>
                                                                {item.lineHint && (
                                                                    <p className="mt-0.5 text-[10px] text-amber-100/90">
                                                                        Hint: <code>{item.lineHint}</code>
                                                                    </p>
                                                                )}
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
