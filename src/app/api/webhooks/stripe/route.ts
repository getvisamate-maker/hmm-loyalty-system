import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/utils/stripe/server";
import { createAdminClient } from "@/utils/supabase/admin";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature || !endpointSecret) {
    console.error("Missing signature or webhook secret");
    return NextResponse.json({ error: "Configuration error" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    console.error(`Webhook Error: ${errorMessage}`);
    return NextResponse.json({ error: `Webhook Error: ${errorMessage}` }, { status: 400 });
  }

  // Initialize Admin DB Client directly
  const supabase = createAdminClient();

  // Handle the event
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const cafeId = session.metadata?.cafeId || session.metadata?.cafe_id;
      const planLevel = session.metadata?.planLevel || session.metadata?.plan_level;
      
      console.log(`[Stripe Webhook] Received checkout.session.completed for cafe ${cafeId} and plan ${planLevel}`);

      if (cafeId && planLevel) {
        // Upgrade the cafe
        const { error } = await supabase
          .from("cafes")
          .update({
            plan_level: planLevel,
            status: "active",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          })
          .eq("id", cafeId);
        
        if (error) {
          console.error("Error updating cafe plan:", error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }
        
        console.log(`Successfully upgraded cafe ${cafeId} to ${planLevel}`);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      console.log(`[Stripe Webhook] Received customer.subscription.deleted for sub ${subscription.id}`);
      
      // Downgrade the cafe
      const { error } = await supabase
        .from("cafes")
        .update({
          plan_level: "standard",
          status: "inactive",
        })
        .eq("stripe_subscription_id", subscription.id);
        
      if (error) {
        console.error("Error downgrading cafe:", error);
      }
      break;
    }
    case "customer.subscription.updated": {
      // Check for changes in subscription status (e.g., unpaid, past_due)
      const subscription = event.data.object as Stripe.Subscription;
      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        const { error } = await supabase
          .from("cafes")
          .update({ status: "inactive" })
          .eq("stripe_subscription_id", subscription.id);
          
        if (error) {
          console.error("Error updating cafe status:", error);
        }
      } else {
        const { error } = await supabase
          .from("cafes")
          .update({ status: "active" })
          .eq("stripe_subscription_id", subscription.id);
          
        if (error) {
          console.error("Error updating cafe status:", error);
        }
      }
      break;
    }
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
