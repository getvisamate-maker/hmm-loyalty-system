import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_for_build';
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('⚠️ STRIPE_SECRET_KEY is missing. Stripe integrations will not work until this is set in .env.local or Vercel.');
}

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2026-03-25.dahlia', // Best practice to lock API version
  appInfo: {
    name: 'HMM Loyalty',
    version: '0.1.0',
  },
});
