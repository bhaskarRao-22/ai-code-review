import { apiRequest } from '../../lib/api';

export interface SimpleReviewResult {
    syntax: { message: string; lineHint: string }[];
    quality: { message: string; lineHint: string }[];
    refactoredCode: string;
    overallSummary: string;
    raw?: string;
}

export interface CreateReviewResponse {
    success: boolean;
    language: string;
    provider: string;
    reviewRequestId: string;
    reviewResultId: string;
    result: SimpleReviewResult;
}

export interface ReviewRequestItem {
    _id: string;
    title: string;
    language: string;
    provider: string;
    status: string;
    createdAt: string;
}

export async function createSimpleReviewApi(payload: {
    title?: string;
    language: string;
    provider: string;
    code: string;
}): Promise<CreateReviewResponse> {
    return apiRequest<CreateReviewResponse>('/reviews/simple', {
        method: 'POST',
        body: payload,
        auth: true
    });
}

export async function listReviewsApi(params?: {
    limit?: number;
    page?: number;
    search?: string;
    provider?: string;
    language?: string;

}): Promise<{
    success: boolean;
    total: number;
    page: number;
    pageSize: number;
    items: ReviewRequestItem[];
}> {
    const search = new URLSearchParams();
    if (params?.limit) search.set('limit', String(params.limit));
    if (params?.page) search.set('page', String(params.page));
    if (params?.search) search.set('q', params.search);
    if (params?.provider && params.provider !== 'all') {
        search.set('provider', params.provider);
    }
    if (params?.language && params.language !== 'all') {
        search.set('language', params.language);
    }

    const query = search.toString();
    const path = query ? `/reviews?${query}` : '/reviews';

    return apiRequest(path, {
        method: 'GET',
        auth: true
    });
}

export interface ReviewDetailResponse {
    success: boolean;
    reviewRequest: {
        _id: string;
        title?: string;
        code: string;
        language: string;
        provider: string;
        status: string;
        createdAt: string;
        updatedAt: string;
    };
    reviewResult: {
        _id: string;
        summary: string;
        refactoredCode: string;
        issues: {
            syntax: { message: string; lineHint?: string; severity?: string }[];
            quality: { message: string; lineHint?: string; severity?: string }[];
            security?: { message: string; lineHint?: string; severity?: string }[];
            performance?: { message: string; lineHint?: string; severity?: string }[];
        };
        createdAt: string;
        updatedAt: string;
    } | null;
}

export async function getReviewByIdApi(id: string): Promise<ReviewDetailResponse> {
    return apiRequest<ReviewDetailResponse>(`/reviews/${id}`, {
        method: 'GET',
        auth: true
    });
}

