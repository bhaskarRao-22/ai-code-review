import { apiRequest } from '../../lib/api';

export interface MyBillingResponse {
    success: boolean;
    credits: {
        balance: number;
        totalGranted: number;
        totalUsed: number;
    };
}

export async function getMyBillingApi(): Promise<MyBillingResponse> {
    return apiRequest<MyBillingResponse>('/api/billing/me', {
        method: 'GET',
        auth: true
    });
}

export async function upgradePlanApi(planName: string): Promise<any> {
    return apiRequest("/api/billing/upgrade", {
        method: "POST",
        auth: true,
        body: { planName }
    });
}
