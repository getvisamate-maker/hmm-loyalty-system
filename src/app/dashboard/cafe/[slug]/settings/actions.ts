"use server";

import { stripe } from "@/utils/stripe/server";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { PLANS } from "@/utils/features";

export async function createCheckoutSession(formData: FormData) {
  const planLevel = formData.get("plan_level") as string;
  const cafeId = formData.get("cafe_id") as string;
  const cafeSlug = formData.get("cafe_slug") as string;
  const currentUrl = formData.get("current_url") as string;

  if (!planLevel || !cafeId) {
    throw new Error("Missing plan level or cafe id");
  }

  // Get user to identify the customer
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  // Get Price ID from environment variables based on selected plan
  let priceId = "";
  if (planLevel === PLANS.STANDARD) {
    priceId = process.env.STRIPE_STANDARD_PLAN_PRICE_ID!;
  } else if (planLevel === PLANS.GROWTH) {
    priceId = process.env.STRIPE_GROWTH_PLAN_PRICE_ID!;
  } else if (planLevel === PLANS.PRO) {
    priceId = process.env.STRIPE_PRO_PLAN_PRICE_ID!;
  }

  if (!priceId) {
    throw new Error(`Price ID for plan ${planLevel} is not configured.`);
  }

  // Create Stripe Checkout Session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    // Pass metadata so our webhook knows WHICH cafe this payment is for
    metadata: {
      cafeId,
      userId: user.id,
      planLevel,
    },
    // Where to send the user after payment
    success_url: `${currentUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${currentUrl}?canceled=true`,
    customer_email: user.email, // Pre-fill their email
  });

  if (!session.url) {
    throw new Error("Failed to create Stripe checkout session");
  }

  // Redirect to Stripe checkout page
  redirect(session.url);
}
