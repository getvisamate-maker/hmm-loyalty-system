"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import crypto from "crypto";

export async function addStamp(cafeId: string, cardId: string, pin: string, pathname: string, token?: string) {
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
    .select("*") 
    .eq("id", cafeId)
    .single();

  if (cafeError || !cafe) {
    console.error("Cafe fetch error:", cafeError);
    return { success: false, message: "System error: Could not verify cafe." };
  }
  
  // Enforce Security Mode
  if (cafe.security_mode === 'dynamic_qr') {
    if (!token) {
      return { success: false, message: "Invalid specific code. Please scan the fresh code at the counter." };
    }

    // Fetch Secret Key for Dynamic QR
    const { data: secretData } = await db
      .from("cafe_secrets")
      .select("secret_key")
      .eq("cafe_id", cafeId)
      .single();

    if (!secretData?.secret_key) {
      return { success: false, message: "Security configuration error. Contact staff." };
    }

    // Verify Token: format "timestamp_hex:signature_hex"
    const [tsHex, sig] = token.split(':');
    if (!tsHex || !sig) {
       return { success: false, message: "Invalid code format." };
    }

    const ts = parseInt(tsHex, 16);
    const now = Date.now();
    const diff = Math.abs(now - ts);

    // 30 seconds validity window (allow clock drift)
    if (diff > 30000) {
      return { success: false, message: "This code has expired. Please scan again." };
    }

    // Reconstruct Signature
    const expectedSig = crypto
      .createHmac('sha256', secretData.secret_key)
      .update(`${cafeId}:${tsHex}`) // Bind to cafeId to prevent cross-cafe replay
      .digest('hex');

    if (sig !== expectedSig) {
      return { success: false, message: "Invalid code signature." };
    }
  } else if (cafe.security_mode === 'pin_code' || cafe.security_mode === 'pin') {
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
  
  // 2. Fetch Current Card and Last Activity
  const { data: card, error: cardReadError } = await db
    .from("loyalty_cards")
    .select("*")
    .eq("id", cardId)
    .single();

  if (cardReadError || !card) {
     return { success: false, message: "Loyalty card not found." };
  }

  // Enforce Time Lock (Cooldown) if enabled
  if (cafe.security_mode === 'time_lock') {
     const lastStamped = (card as any).last_stamped_at ? new Date((card as any).last_stamped_at).getTime() : 0;
     const now = Date.now();
     // Treat time_lock_hours as MINUTES (as per new UI)
     // Conversion: minutes * 60 * 1000 = ms
     const cooldownMinutes = cafe.time_lock_hours || 5; 
     const cooldownMs = cooldownMinutes * 60 * 1000;
     
     if (now - lastStamped < cooldownMs) {
        const remainingMinutes = Math.ceil((cooldownMs - (now - lastStamped)) / 60000);
        return { success: false, message: `Cooldown active. Wait ${remainingMinutes} min.` };
     }
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
    return { success: true, message: "Reward Redeemed! Enjoy your free coffee.", redeemed: true }; // Added redeemed flag
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
    
    // Attempt to update last_stamped_at if column exists (silent fail if not)
    await db.from("loyalty_cards").update({ last_stamped_at: new Date().toISOString() }).eq("id", cardId);

    revalidatePath(pathname);
    return { success: true, message: "Stamp added!" };
  }
}
