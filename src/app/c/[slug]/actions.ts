"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function addStamp(cafeId: string, cardId: string, pin: string, pathname: string) {
  // Use a Service Role client to bypass RLS for fetching PINs and Updating Stamps
  let db = null;
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    db = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } else {
    const cookieStore = await cookies();
    db = createClient(cookieStore);
    console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY missing. operations may fail due to RLS.");
  }

  // 1. Verify Cafe and Get Configuration
  // Fetch non-sensitive config first
  const { data: cafe, error: cafeError } = await db
    .from("cafes")
    .select("stamps_required, security_mode") // Removed pin_code
    .eq("id", cafeId)
    .single();

  if (cafeError || !cafe) {
    console.error("Cafe fetch error:", cafeError);
    return { success: false, message: "System error: Could not verify cafe." };
  }
  
  // Enforce PIN based on security_mode
  if (cafe.security_mode === 'pin_code' || cafe.security_mode === 'pin') {
    // Fetch PIN from secrets table securely
    const { data: secret, error: secretError } = await db
      .from("cafe_secrets")
      .select("pin_code")
      .eq("cafe_id", cafeId)
      .single();

    if (secretError || !secret) {
      console.error("Secret missing for cafe", cafeId);
      return { success: false, message: "Security configuration error." };
    }

    const correctPin = secret.pin_code ? String(secret.pin_code).trim() : "1234";
    if (pin.trim() !== correctPin) {
      return { success: false, message: "Incorrect PIN" };
    }
  }
  // For 'visual' or 'geo' (placeholder), we skip the strict PIN check if not enforced.
  // HOWEVER, the UI still sends a PIN. If we want to strictly ignore it, we do nothing here.
  
  // 2. Fetch Current Card State
  const { data: card, error: cardReadError } = await db
    .from("loyalty_cards")
    .select("stamp_count")
    .eq("id", cardId)
    .single();

  if (cardReadError || !card) {
     return { success: false, message: "Loyalty card not found." };
  }

  const isFull = card.stamp_count >= cafe.stamps_required;

  if (isFull) {
    // === REDEMPTION FLOW ===
    // Reset stamps to 0
    const { error: updateError } = await db
      .from("loyalty_cards")
      .update({ stamp_count: 0 })
      .eq("id", cardId);

    if (updateError) {
      console.error("Redemption update error:", updateError);
      return { success: false, message: "Could not process redemption." };
    }

    // Attempt to increment cafe total_rewards_redeemed counter (fail silently if column missing)
    try {
       // Direct SQL emulation via RPC would be ideal, but for now we just log it.
       // In a full prod app you might use: await db.rpc('increment_rewards', { cafe_id: cafeId });
    } catch(e) {}

    const { error: logError } = await db
      .from("stamp_logs")
      .insert({ card_id: cardId, notes: "Reward Redeemed" });
    
    if (logError) {
      console.error("Redemption logging error:", logError);
    }
    
    revalidatePath(pathname);
    return { success: true, message: "Reward Redeemed! Card has been reset." };
  } else {
    // === ADD STAMP FLOW ===
    const { error: updateError } = await db
      .from("loyalty_cards")
      .update({ stamp_count: card.stamp_count + 1 })
      .eq("id", cardId);

    if (updateError) {
      console.error("Update error:", updateError);
      return { success: false, message: "Could not add stamp." };
    }

    const { error: logError } = await db
      .from("stamp_logs")
      .insert({ card_id: cardId, notes: "Stamp Added" });

    if (logError) {
       console.error("Stamp logging error:", logError);
    }

    revalidatePath(pathname);
    return { success: true, message: "Stamp added!" };
  }
}
