import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

// Make sure this matches CRON_SECRET in Vercel if you deploy there
const CRON_SECRET = process.env.CRON_SECRET || "local-cron-secret";

export async function GET(request: Request) {
  // 1. Authenticate CRON request
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    console.warn("Unauthorized CRON attempt", authHeader);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Init Admin Supabase Client (bypasses RLS)
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Server missing Supabase env vars" }, { status: 500 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  console.log("🚀 [CRON] Starting Daily Win-Back Check...");

  let sentCount = 0;

  try {
    // 3. Find all cafes that have Win-Back enabled
    const { data: cafes, error: cafeError } = await supabase
      .from("cafes")
      .select("id, name, slug, win_back_days, win_back_reward_stamps, plan_level")
      .eq("enable_win_back", true)
      .in("plan_level", ["growth", "pro"]); // Only for paying tiers

    if (cafeError) throw cafeError;

    if (!cafes || cafes.length === 0) {
      console.log("[CRON] No cafes have Win-Back enabled right now. Exiting.");
      return NextResponse.json({ success: true, message: "No active win-back cafes", emailsSent: 0 });
    }

    // 4. Process each cafe independently
    for (const cafe of cafes) {
      console.log(`[CRON] Checking churning customers for cafe: ${cafe.name}`);

      // Calculate the cutoff date (e.g., 14 days ago)
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - (cafe.win_back_days || 14));
      const cutoffStr = cutoffDate.toISOString();

      // Find user cards for this cafe
      // To determine "churning", we check if they haven't had a stamp added since the cutoff date.
      // But we also MUST ensure we haven't already sent them a win-back email recently.
      
      const { data: usersAtRisk, error: userError } = await supabase
        .from("loyalty_cards")
        .select(`
          id,
          user_id,
          last_win_back_sent_at,
          profiles:user_id ( full_name, email )
        `)
        .eq("cafe_id", cafe.id);

      if (userError || !usersAtRisk) continue;

      for (const card of usersAtRisk) {
        // Skip if we already sent a win-back email within the last 30 days so we don't annoy them
        if (card.last_win_back_sent_at) {
          const lastSent = new Date(card.last_win_back_sent_at);
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          if (lastSent > thirtyDaysAgo) {
             continue; // We already tried to win them back recently
          }
        }

        // We need to check their latest stamp log date
        const { data: lastLog } = await supabase
          .from("stamp_logs")
          .select("created_at")
          .eq("card_id", card.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

        // If they had a log recently (after cutoff), skip them.
        if (lastLog && new Date(lastLog.created_at) > cutoffDate) {
          continue; 
        }

        // --- BINGO: THIS CUSTOMER IS CHURNING ---
        const userProfile = (card.profiles as any) || {};
        const email = userProfile.email;
        const name = userProfile.full_name || "Coffee Lover";

        if (!email) continue; // Unreachable without email

        // 5. Fire off the email with Resend
        if (process.env.RESEND_API_KEY) {
          const resend = new Resend(process.env.RESEND_API_KEY);
          try {
            await resend.emails.send({
              from: 'Notifications <hello@hmmloyalty.com>', // MUST Be verified in Resend Dashboard
              to: [email],
              subject: `We miss you at ${cafe.name}! Here is a gift ☕`,
              html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                  <h2>Hi ${name}, we miss you!</h2>
                  <p>It's been a while since your last visit to <strong>${cafe.name}</strong>.</p>
                  <p>Come back this week and we'll give you <strong>${cafe.win_back_reward_stamps} bonus stamp(s)</strong> on us!</p>
                  <br/>
                  <p>See you soon,</p>
                  <p>The team at ${cafe.name}</p>
                </div>
              `
            });
            console.log(`✅ [EMAIL SENT] Win-Back to ${email} for Cafe: ${cafe.name}`);
            sentCount++;
          } catch (e) {
            console.error(`❌ [EMAIL ERROR] Failed to send to ${email}`, e);
          }
        } else {
          console.log(`⚠️ [EMAIL MOCK] Missing RESEND_API_KEY. Would have sent to ${email} for Cafe: ${cafe.name}`);
          sentCount++;
        }

        // 6. Update the 'last_win_back_sent_at' tracker so we don't spam them tomorrow!
        await supabase
          .from("loyalty_cards")
          .update({ last_win_back_sent_at: new Date().toISOString() })
          .eq("id", card.id);
      }
    }

    console.log(`✅ [CRON] Daily Win-Back Check Complete. Sent ${sentCount} emails.`);
    return NextResponse.json({ success: true, emailsSent: sentCount });

  } catch (err: any) {
    console.error("[CRON ERROR]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
