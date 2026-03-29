"use server";

import { createClient } from "@/utils/supabase/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function createCafe(prevState: any, formData: FormData) {
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string; // Ideally sanitize this
  const stampsRequired = parseInt(formData.get("stamps_required") as string) || 10;
  const referralCode = formData.get("referral_code") as string;
  
  if (!name || !slug) {
    return { error: "Name and Slug are required." };
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be logged in." };
  }

  // PARTNER / ADMIN CHECK
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_partner, role")
    .eq("id", user.id)
    .single();

  const userEmail = user.email ? user.email.toLowerCase().trim() : "";
  const adminList = (process.env.ADMIN_EMAILS || "").split(',').map(e => e.toLowerCase().trim());
  const isAdmin = userEmail && adminList.includes(userEmail);
  const isApprovedPartner = profile?.is_partner === true || profile?.role === 'cafe_owner' || profile?.role === 'super_admin' || isAdmin;

  if (!isApprovedPartner) {
    return { error: "You do not have permission to create a cafe." };
  }

  const adminDb = createAdminClient();

  // PLAN USAGE LIMITS
  const { data: userCafes } = await adminDb
    .from("cafes")
    .select("plan_level")
    .eq("owner_id", user.id);
  
  if (userCafes && userCafes.length >= 1 && !isAdmin) {
    // If they have cafes, check if they have at least one pro/growth plan to allow multi-location
    const hasPaidPlan = userCafes.some(c => c.plan_level === 'pro' || c.plan_level === 'growth');
    if (!hasPaidPlan) {
      return { error: "Free partners are limited to 1 cafe location. Upgrade your first cafe to a paid plan to manage multiple locations." };
    }
  }

  let affiliateId = null;

  if (referralCode) {
    // Validate Referral Code securely
    const { data: codeData, error: codeError } = await adminDb
      .from("referral_codes")
      .select("referrer_id, id, usage_count")
      .eq("code", referralCode.trim().toUpperCase())
      .single();

    if (codeData) {
      affiliateId = codeData.referrer_id;
      // Increment usage
      await adminDb
        .from("referral_codes")
        .update({ usage_count: (codeData.usage_count || 0) + 1 })
        .eq("id", codeData.id);
    } else {
        // Optional: Fail or proceed without affiliate? 
        // Let's proceed but maybe warn? Or ignore invalid code.
        // Usually better to ignore silently or show error.
        // For simplicity, ignore invalid code.
    }
  }

  const cafePayload: any = { 
    name, 
    slug, 
    owner_id: user.id, 
    stamps_required: stampsRequired
  };

  if (affiliateId) {
    cafePayload.affiliate_id = affiliateId;
  }

  const { data, error } = await adminDb
    .from("cafes")
    .insert([cafePayload])
    .select()
    .single();

  if (error) {
    console.error("Error creating cafe:", error);
    if (error.code === "23505") { // Unique violation for slug
        return { error: "This slug is already taken. Please choose another one." };
    }
    return { error: error.message };
  }

  return redirect(`/dashboard/cafe/${data.slug}`);
}
