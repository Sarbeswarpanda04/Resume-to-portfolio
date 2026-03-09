import api from './api';

export type PlanId = 'free' | 'premium';

export interface BillingStatus {
  plan: PlanId;
  isPremium: boolean;
  premiumPrice: number;
  currency: 'INR';
  portfolioCount: number;
  portfolioLimit: number | null;
  canCreatePortfolio: boolean;
}

export interface ValidateCouponResponse {
  valid: boolean;
  code: string;
  discount: number;
  finalAmount: number;
  currency: 'INR';
  discountType?: string;
  discountValue?: number;
}

export type CheckoutResponse =
  | { status: 'already_premium' }
  | { status: 'success'; plan: 'premium'; finalAmount: number; currency: 'INR' }
  | {
      status: 'payment_required';
      provider: 'razorpay';
      keyId: string;
      orderId: string;
      amount: number;
      currency: 'INR';
      purchaseId: string;
    };

export const getBillingStatus = async (): Promise<BillingStatus> => {
  const { data } = await api.get('/api/billing/status');
  return data;
};

export const validateCoupon = async (code: string): Promise<ValidateCouponResponse> => {
  const { data } = await api.post('/api/billing/validate-coupon', {
    code,
    planId: 'premium',
  });
  return data;
};

export const checkoutPremium = async (couponCode?: string): Promise<CheckoutResponse> => {
  const { data } = await api.post('/api/billing/checkout', {
    planId: 'premium',
    couponCode: couponCode || null,
  });
  return data;
};

export const verifyRazorpayPayment = async (payload: {
  couponCode?: string;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}) => {
  const { data } = await api.post('/api/billing/verify-payment', {
    planId: 'premium',
    couponCode: payload.couponCode || null,
    ...payload,
  });
  return data as { status: 'success'; plan: 'premium' };
};
