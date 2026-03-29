"use server";

import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";

export async function getPosConfig(cafeSlug: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // Auth User
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  // Verify Ownership or Staff Access (For now assume Owner)
  // 1. Get Cafe ID from Slug
  const { data: cafe } = await supabase
    .from("cafes")
    .select("id, name, owner_id, plan_level")
    .eq("slug", cafeSlug)
    .single();

  if (!cafe || cafe.owner_id !== user.id) {
    throw new Error("Unauthorized access to POS");
  }

  // 2. Check Plan Level = 'Pro'
  if (cafe.plan_level !== 'pro') {
    throw new Error("Upgrade to Pro plan to access POS system.");
  }

  // 3. Get Secret Key (Use Admin Client)
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing Env Config");
  }

  const adminDb = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );

  const { data: secret } = await adminDb
    .from("cafe_secrets")
    .select("*")
    .eq("cafe_id", cafe.id)
    .single();

  let secretKey = secret?.secret_key;

  if (!secretKey) {
    // Generate one if missing securely
    const newSecret = crypto.randomUUID();
    const { error: insertError } = await adminDb
      .from("cafe_secrets")
      .upsert({ cafe_id: cafe.id, secret_key: newSecret });
      
    if (insertError) {
      console.error("Insert Error POS Secret:", insertError);
      throw new Error(`POS config error: ${insertError.message}`);
    }
    
    secretKey = newSecret;
  }

  return { 
    secretKey: secretKey,
    cafeId: cafe.id, 
    cafeName: cafe.name 
  };
}