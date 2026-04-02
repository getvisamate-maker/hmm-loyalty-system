export type PlanLevel = 'standard' | 'growth' | 'pro';

export const PLANS: Record<string, PlanLevel> = {
  STANDARD: 'standard',
  GROWTH: 'growth',
  PRO: 'pro',
};

export const FEATURES = {
  ANALYTICS: 'analytics',
  PROMOTIONS: 'promotions',
  STAFF_MANAGEMENT: 'staff_management',
  CUSTOM_BRANDING: 'custom_branding',
  EXPORT_DATA: 'export_data',
  WIN_BACK: 'win_back',
  REVIEW_BOOSTER: 'review_booster',
};

const PLAN_FEATURES: Record<PlanLevel, string[]> = {
  standard: [FEATURES.ANALYTICS],
  growth: [FEATURES.ANALYTICS, FEATURES.PROMOTIONS, FEATURES.CUSTOM_BRANDING, FEATURES.WIN_BACK, FEATURES.REVIEW_BOOSTER],
  pro: [FEATURES.ANALYTICS, FEATURES.PROMOTIONS, FEATURES.STAFF_MANAGEMENT, FEATURES.CUSTOM_BRANDING, FEATURES.EXPORT_DATA, FEATURES.WIN_BACK, FEATURES.REVIEW_BOOSTER],
};

export function isFeatureEnabled(plan: PlanLevel, feature: string): boolean {
  if (!plan) return false;
  const allowedFeatures = PLAN_FEATURES[plan] || PLAN_FEATURES.standard;
  return allowedFeatures.includes(feature);
}

export function getPlanLabel(plan: PlanLevel): string {
  switch (plan) {
    case PLANS.STANDARD: return 'Starter';
    case PLANS.GROWTH: return 'Growth';
    case PLANS.PRO: return 'Pro (Coming Soon)';
    default: return 'Starter';
  }
}
