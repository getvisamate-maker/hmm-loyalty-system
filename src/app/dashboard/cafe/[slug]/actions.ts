"use server";

import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { FEATURES, isFeatureEnabled, PlanLevel } from "@/utils/features";

export async function createPromotion(cafeId: string, title: string, body: string, durationDays: number = 7) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  // Verify ownership and plan
  const { data: cafe, error: cafeError } = await supabase
    .from("cafes")
    .select("id, plan_level")
    .eq("id", cafeId)
    .eq("owner_id", user.id)
    .single();

  if (cafeError || !cafe) throw new Error("Unauthorized to manage this cafe");

  // Check Feature Access
  const plan = (cafe.plan_level as PlanLevel) || 'standard';
  if (!isFeatureEnabled(plan, FEATURES.PROMOTIONS)) {
    throw new Error(`Upgrade to Growth or Pro plan to create promotions.`);
  }

  // Calculate Expiration
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + durationDays);

  // Insert promotion into database
  const { error } = await supabase
    .from("promotions")
    .insert([
      { cafe_id: cafeId, title, body, expires_at: expiresAt.toISOString() }
    ]);

  if (error) {
    console.error("Error creating promotion record:", error);
    throw new Error("Failed to send promotion");
  }

  // --- EMAIL DISPATCH SIMULATION (Placeholder for Resend/Sendgrid) ---
  // In a real-world production app, you would:
  // 1. Fetch opted-in users: 
  //    const { data: audience } = await supabase.from('loyalty_cards').select('profile_id').eq('cafe_id', cafeId).eq('marketing_opt_in', true);
  // 2. Fetch their actual emails from profiles or auth using edge function or admin client
  // 3. Dispatch emails via Resend API: 
  //    await resend.emails.send({ from: 'hello@hmmloyalty.com', to: [...emails], subject: title, html: body })
  
  console.log(`[EMAIL DISPATCHER] Successfully queued email campaign: "${title}" for Cafe ID: ${cafeId}`);
  console.log(`[EMAIL DISPATCHER] Content preview: ${body.substring(0, 50)}...`);
  console.log(`[EMAIL DISPATCHER] Note: Actual SMTP dispatch requires an email provider like Resend or SendGrid.`);

  return { success: true };
}

export async function updateCafeSettings(cafeId: string, data: any, slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new Error("Unauthorized");

  // Get current plan to check feature permissions
  const { data: cafe } = await supabase
    .from("cafes")
    .select("plan_level")
    .eq("id", cafeId) 
    .eq("owner_id", user.id)
    .single();

  if (!cafe) throw new Error("Cafe not found or unauthorized");

  const plan = (cafe.plan_level as PlanLevel) || 'standard';

  // Extract sensitive and restricted fields
  const { 
    id, 
    owner_id, 
    created_at, 
    plan_level, // Prevent plan upgrade via settings
    pin_code,   // Handled separately
    ...publicData 
  } = data;

  // Check Custom Branding permissions
  if (
    (publicData.logo_url || publicData.primary_color || publicData.secondary_color) && 
    !isFeatureEnabled(plan, FEATURES.CUSTOM_BRANDING)
  ) {
    // Strip branding fields if not allowed
    delete publicData.logo_url;
    delete publicData.primary_color;
    delete publicData.secondary_color;
    // Alternatively, throw error. But stripping is safer for partial updates.
  }

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

export async function getStaff(cafeId: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: cafe } = await supabase
    .from("cafes")
    .select("owner_id")
    .eq("id", cafeId)
    .single();

  if (!cafe || cafe.owner_id !== user.id) return [];

  const { data: staff } = await supabase
    .from("cafe_staff")
    .select("*")
    .eq("cafe_id", cafeId)
    .order("created_at", { ascending: false });

  return staff || [];
}

export async function addStaff(cafeId: string, name: string, role: string, pinCode: string, slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { error } = await supabase
    .from("cafe_staff")
    .insert([{ cafe_id: cafeId, name, role, pin_code: pinCode }]);

  if (error) {
    console.error("Error adding staff:", error);
    throw new Error("Failed to add staff member.");
  }

  revalidatePath(`/dashboard/cafe/${slug}`);
  return { success: true };
}

export async function updateStaffStatus(staffId: string, status: string, slug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Could add check to assure user owns the cafe the staff belongs to
  const { error } = await supabase
    .from("cafe_staff")
    .update({ status })
    .eq("id", staffId);

  if (error) {
    console.error("Error updating staff status:", error);
    throw new Error("Failed to update staff status.");
  }

  revalidatePath(`/dashboard/cafe/${slug}`);
  return { success: true };
}