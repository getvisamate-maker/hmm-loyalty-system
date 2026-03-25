"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function addStamp(cafeId: string, cardId: string, pin: string, pathname: string) {
  // Use a Service Role client to bypass RLS for fetching PINs and Updating Stamps
  // This ensures the operation succeeds even if the user doesn't have direct DB update permissions
  let db = null;
  
  if (process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL) {
    db = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );
  } else {
    // Fallback to user context likely to fail for updates, but useful for dev if keys missing
    const cookieStore = await cookies();
    db = createClient(cookieStore);
    console.warn("⚠️ SUPABASE_SERVICE_ROLE_KEY missing. Stamp updates may fail due to RLS.");
  }

  // 1. Verify PIN
  const { data: cafe, error: cafeError } = await db
    .from("cafes")
    .select("pin_code")
    .eq("id", cafeId)
    .single();

  if (cafeError || !cafe) {
    console.error("Cafe fetch error:", cafeError);
    return { success: false, message: "System error: Could not verify cafe." };
  }
  
  const correctPin = cafe.pin_code ? String(cafe.pin_code).trim() : "1234";
  
  if (pin.trim() !== correctPin) {
    return { success: false, message: "Incorrect PIN" };
  }

  // 2. Add Stamp (Privileged Update)
  // First fetch current count
  const { data: card, error: cardReadError } = await db
    .from("loyalty_cards")
    .select("stamp_count")
    .eq("id", cardId)
    .single();

  if (cardReadError || !card) {
     return { success: false, message: "Loyalty card not found." };
  }

  // Perform update
  const { error: updateError } = await db
    .from("loyalty_cards")
    .update({ stamp_count: card.stamp_count + 1 })
    .eq("id", cardId);

  if (updateError) {
    console.error("Update error:", updateError);
    return { success: false, message: "Could not add stamp. Please try again." };
  }

  // 3. Log activity
  await db.from("stamp_logs").insert({ card_id: cardId });

  revalidatePath(pathname);
  return { success: true };
}
