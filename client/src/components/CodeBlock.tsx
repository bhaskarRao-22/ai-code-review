import { useState } from 'react';
import { Highlight, themes } from 'prism-react-renderer';
import { useToast } from './ToastProvider';

const { nightOwl } = themes;

type PrismLanguage = 'javascript' | 'typescript' | 'jsx' | 'tsx';

interface CodeBlockProps {
    code: string;
    language?: PrismLanguage;
    title?: string;
    className?: string;
}

export default function CodeBlock({
    code,
    language = 'javascript',
    title,
    className
}: CodeBlockProps) {
    const { showToast } = useToast();
    const [copied, setCopied] = useState(false);

    const trimmedCode = code?.trim?.() || '';

    /** ---------- (Improvement #1) Safe fallback for language ---------- **/
    const safeLanguage: PrismLanguage =
        ['javascript', 'typescript', 'jsx', 'tsx'].includes(language)
            ? language
            : 'javascript';

    /** ---------- (Improvement #2) Clipboard support check ---------- **/
    async function handleCopy() {
        try {
            if (!navigator?.clipboard) {
                throw new Error('Clipboard not supported');
            }

            await navigator.clipboard.writeText(trimmedCode);
            setCopied(true);
            showToast({ type: 'success', message: 'Code copied to clipboard!' });

            setTimeout(() => setCopied(false), 1500);
        } catch {
            showToast({ type: 'error', message: 'Failed to copy code.' });
        }
    }

    return (
        <div
            className={`relative rounded-lg border border-slate-800 bg-slate-950 overflow-hidden ${className || ''}`}
        >
            {/* Header (title + copy button) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-3 py-2 border-b border-slate-800/70 bg-slate-900/80 gap-2">
                <div className="flex items-center gap-2">
                    {title && (
                        <span className="text-[11px] font-medium text-slate-200 truncate">
                            {title}
                        </span>
                    )}
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300 uppercase shrink-0">
                        {safeLanguage}
                    </span>
                </div>

                <button
                    type="button"
                    onClick={handleCopy}
                    className="inline-flex items-center justify-center gap-1 rounded-md bg-slate-800/90 px-2 py-1 text-[11px] font-medium text-slate-100 border border-slate-700 hover:bg-slate-700 transition w-full sm:w-auto">
                    <svg width="13" height="13" viewBox="0 0 24 24">
                        <path
                            d="M9 9H19V19H9V9Z"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M5 5H15V7M5 5V15H7"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
            </div>

            {/* Highlighted code */}
            <Highlight code={trimmedCode} language={safeLanguage} theme={nightOwl}>
                {({ className: generatedClassName, style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                        className={`whitespace-pre-wrap text-xs p-3 overflow-auto ${generatedClassName}`}
                        style={{
                            ...style,
                            background: 'transparent',
                            margin: 0
                        }}
                    >
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line, key: i })}>
                                {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token, key })} />
                                ))}
                            </div>
                        ))}
                    </pre>
                )}
            </Highlight>
        </div>
    );
}
