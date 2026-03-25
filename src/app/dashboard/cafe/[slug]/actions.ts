"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createPromotion(cafeId: string, title: string, body: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  // Verify ownership
  const { data: cafe, error: cafeError } = await supabase
    .from("cafes")
    .select("id")
    .eq("id", cafeId)
    .eq("owner_id", user.id)
    .single();

  if (cafeError || !cafe) throw new Error("Unauthorized to manage this cafe");

  // Insert promotion
  const { error } = await supabase
    .from("promotions")
    .insert([
      { cafe_id: cafeId, title, body }
    ]);

  if (error) {
    console.error("Error creating promotion:", error);
    throw new Error("Failed to send promotion");
  }

  return { success: true };
}

export async function updateCafeSettings(cafeId: string, data: any, slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  // Extract sensitive fields
  const { pin_code, ...publicData } = data;

  // Update public info
  const { error } = await supabase
    .from("cafes")
    .update(publicData)
    .eq("id", cafeId)
    .eq("owner_id", user.id);

  if (error) {
    console.error("Error updating settings:", error);
    throw new Error("Failed to update settings");
  }

  // Update secrets if provided
  if (pin_code !== undefined) {
    // Check if secret exists first
    const { data: existingSecret } = await supabase
      .from("cafe_secrets")
      .select("cafe_id")
      .eq("cafe_id", cafeId)
      .single();

    if (existingSecret) {
      const { error: secretError } = await supabase
        .from("cafe_secrets")
        .update({ pin_code })
        .eq("cafe_id", cafeId);

      if (secretError) {
        console.error("Error updating secret:", secretError);
        // Don't fail the whole request, but log it
      }
    } else {
      // Create new secret entry
      const { error: secretError } = await supabase
        .from("cafe_secrets")
        .insert({ cafe_id: cafeId, pin_code });
      
      if (secretError) {
        console.error("Error creating secret:", secretError);
      }
    }
  }

  revalidatePath(`/dashboard/cafe/${slug}`);
  return { success: true };
}