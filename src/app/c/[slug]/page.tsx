import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { LoyaltyCard } from "./loyalty-card";

export default async function CustomerPage(props: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await props.params;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Fetch User (Auth Check)
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    // Redirect to login if not authenticated
    return redirect(`/login?next=/c/${resolvedParams.slug}`);
  }

  // 2. Fetch Cafe Details
  const { data: cafe } = await supabase
    .from("cafes")
    .select("*")
    .eq("slug", resolvedParams.slug)
    .single();

  if (!cafe) {
    return notFound();
  }

  // 3. Fetch or Create Loyalty Card
  let { data: card } = await supabase
    .from("loyalty_cards")
    .select("*")
    .eq("cafe_id", cafe.id)
    .eq("user_id", user.id)
    .single();

  // Auto-join program if accessing the link
  if (!card) {
    const { data: newCard } = await supabase
      .from("loyalty_cards")
      .insert({
        cafe_id: cafe.id,
        user_id: user.id,
        stamp_count: 0
      })
      .select()
      .single();
    
    if (newCard) {
      card = newCard;
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md space-y-8">
        <LoyaltyCard 
          cafeName={cafe.name}
          stampsRequired={cafe.stamps_required}
          currentStamps={card?.stamp_count || 0}
          logoUrl={cafe.logo_url}
        />
        
        <div className="text-center">
            <p className="text-xs text-zinc-400 font-medium">
                Powered by Hmm Loyalty System
            </p>
        </div>
      </div>
    </div>
  );
}