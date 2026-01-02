import { runSimpleReview } from "../services/aiReviewService.js";
import { ReviewRequest } from '../models/ReviewRequest.model.js';
import { ReviewResult } from '../models/ReviewResult.model.js';
import { consumeCreditsForSimpleReview } from '../services/billingService.js';

export async function createSimpleReview(req, res, next) {
    let reviewRequest = null;

    try {
        const { code, language, provider, title, projectId } = req.body;

        if (!code || typeof code !== 'string' || code.trim().length === 0) {
            return res.status(400).json({ message: 'Code is required' });
        }

        // future: validate language from whitelist
        const lang = language || 'javascript';

        // provider whitelist
        const allowedProviders = ['gemini', 'groq', 'openai'];
        const selectedProvider = allowedProviders.includes(provider)
            ? provider
            : 'gemini'; // default

        // TODO: jab auth aa jayega
        const userId = req.user?._id || null;

        // 🔹 4a) credit check
        try {
            await consumeCreditsForSimpleReview(userId, {
                language: lang,
                provider: selectedProvider,
                kind: 'simple_review'
            });
        } catch (creditErr) {
            if (creditErr.code === 'INSUFFICIENT_CREDITS') {
                return res.status(402).json({
                    success: false,
                    code: 'INSUFFICIENT_CREDITS',
                    message: 'You do not have enough credits to run this review.'
                });
            }
            throw creditErr;
        }


        // 1) Pehle ReviewRequest create karo (status: processing)
        reviewRequest = await ReviewRequest.create({
            userId,
            projectId: projectId || null,
            title: title || '',
            code,
            language: lang,
            frameworks: [], // future: body se bhej sakte
            provider: selectedProvider,
            status: 'processing',
            goals: {
                syntaxCheck: true,
                quality: true
            }
        });

        // 2) AI review chalao
        const aiResult = await runSimpleReview({
            code,
            language: lang,
            provider: selectedProvider
        });

        // 3) ReviewResult save karo
        const reviewResult = await ReviewResult.create({
            reviewRequestId: reviewRequest._id,
            summary: aiResult.overallSummary || '',
            issues: {
                syntax: (aiResult.syntax || []).map((item) => ({
                    message: item.message,
                    lineHint: item.lineHint || '',
                    severity: 'warning'
                })),
                quality: (aiResult.quality || []).map((item) => ({
                    message: item.message,
                    lineHint: item.lineHint || '',
                    severity: 'info'
                })),
                security: [],
                performance: []
            },
            refactoredCode: aiResult.refactoredCode || '',
            tests: {
                framework: '',
                code: ''
            },
            documentation: {
                docstring: '',
                apiDocs: ''
            },
            explanationForBeginners: '',
            raw: aiResult.raw || ''
        });

        // 4) ReviewRequest ko update karo (status + resultId)
        reviewRequest.status = 'completed';
        reviewRequest.resultId = reviewResult._id;
        await reviewRequest.save();

        return res.status(201).json({
            success: true,
            language: lang,
            provider: selectedProvider,
            reviewRequestId: reviewRequest._id,
            reviewResultId: reviewResult._id,
            result: aiResult
        });
    } catch (err) {
        console.error('createSimpleReview error:', err);

        if (reviewRequest) {
            reviewRequest.status = 'failed';
            reviewRequest.errorMessage = err.message;
            await reviewRequest.save().catch(() => { });
        }

        next(err);
    }
}


export async function listReviews(req, res, next) {
    try {
        const userId = req.user?._id;
        const { limit = 20, page = 1, q, search, provider, language } = req.query;
        const text = search || q;

        const pageSize = Math.min(Number(limit) || 20, 100);
        const skip = (Number(page) - 1) * pageSize;

        // basic filter: only this user's reviews
        const filter = {
            userId
        };

        // provider filter
        if (provider && ['gemini', 'groq', 'openai'].includes(provider)) {
            filter.provider = provider;
        }

        // language filter
        if (language) {
            filter.language = language;
        }

        // text search (title + code)
        if (text && typeof text === 'string' && text.trim().length > 0) {
            const regex = new RegExp(q.trim(), 'i');
            filter.$or = [
                { title: regex },
                { code: regex }
            ];
        }

        const [items, total] = await Promise.all([
            ReviewRequest.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(pageSize)
                .lean(),
            ReviewRequest.countDocuments(filter)
        ]);

        return res.json({
            success: true,
            total,
            page: Number(page),
            pageSize,
            items
        });
    } catch (err) {
        next(err);
    }
}

export async function getReviewById(req, res, next) {
    try {
        const { id } = req.params;

        const reviewRequest = await ReviewRequest.findById(id).lean();
        if (!reviewRequest) {
            return res.status(404).json({ message: 'Review request not found' });
        }

        const reviewResult = reviewRequest.resultId
            ? await ReviewResult.findOne({ reviewRequestId: reviewRequest._id }).lean()
            : null;

        return res.json({
            success: true,
            reviewRequest,
            reviewResult
        });
    } catch (err) {
        next(err);
    }
}
