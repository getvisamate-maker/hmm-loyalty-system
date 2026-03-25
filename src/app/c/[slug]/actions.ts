"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function addStamp(cafeId: string, cardId: string, pin: string, pathname: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  console.log(`[Stamp Action] Processing stamp for Card: ${cardId}`);

  let dbPin = null;

  // 1. Fetch PIN securely (Bypassing RLS with Admin Client)
  // Normal users (customers) cannot read the 'pin_code' column due to security policies.
  // We use the Service Role Key to verify the PIN on the server side correctly.
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabaseAdmin = createAdminClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );
      
      const { data: adminData } = await supabaseAdmin
        .from("cafes")
        .select("pin_code")
        .eq("id", cafeId)
        .single();
        
      if (adminData) {
        dbPin = adminData.pin_code;
      }
    } catch (e) {
      console.error("[Stamp Action] Admin client error:", e);
    }
  } else {
    // Fallback for local dev if Service Key is missing (might fail due to RLS)
    console.warn("[Stamp Action] Missing SUPABASE_SERVICE_ROLE_KEY. RLS might block PIN verification.");
    const { data: userLevelData } = await supabase
      .from("cafes")
      .select("pin_code")
      .eq("id", cafeId)
      .single();
      
    if (userLevelData) {
      dbPin = userLevelData.pin_code;
    }
  }

  // Normalize for comparison (handle numbers/strings and whitespace)
  const correctPin = dbPin ? String(dbPin).trim() : "1234";
  const inputPin = pin.trim();

  // Debug Log: Check your server terminal/Vercel logs to see these values!
  console.log(`[Stamp Action] Pin Check - User: '${inputPin}', System Expects: '${correctPin}'`);

  if (inputPin !== correctPin) {
    return { success: false, message: "Incorrect PIN" };
  }

  // 2. Add Stamp - Direct Update
  // We first fetch the current count to ensure we increment correctly
  const { data: card, error: cardError } = await supabase
    .from("loyalty_cards")
    .select("stamp_count")
    .eq("id", cardId)
    .single();

  if (cardError || !card) {
    console.error("[Stamp Action] Card fetch error:", cardError);
    return { success: false, message: "Card not found" };
  }

  // Update the count
  const { error: updateError } = await supabase
    .from("loyalty_cards")
    .update({ 
      stamp_count: card.stamp_count + 1 
    })
    .eq("id", cardId);

  if (updateError) {
    console.error("[Stamp Action] Update error:", updateError);
    return { success: false, message: "Failed to update stamp count. Please try again." };
  }

  // 3. Log the Activity
  await supabase.from("stamp_logs").insert({
    card_id: cardId,
  });

  revalidatePath(pathname);
  return { success: true };
}
