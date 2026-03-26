import { createClient } from "@/utils/supabase/server";
import { addStamp } from "@/app/c/[slug]/actions";
import { redirect } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle, Coffee } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ClaimPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>, 
  searchParams: Promise<{ token: string }> 
}) {
  const { id: cafeId } = await params;
  const { token } = await searchParams;
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  // 1. Authenticate User
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const callback = `/claim/${cafeId}?token=${token}`;
    return redirect(`/login?next=${encodeURIComponent(callback)}`);
  }

  // 2. Fetch Cafe Details (Need slug for redirect)
  const { data: cafe, error: cafeError } = await supabase
    .from("cafes")
    .select("id, name, slug, security_mode")
    .eq("id", cafeId)
    .single();

  if (cafeError || !cafe) {
    return (
      <ErrorScreen message="Cafe not found or system error." />
    );
  }

  // 3. Find or Create Card
  let { data: card } = await supabase
    .from("loyalty_cards")
    .select("id")
    .eq("cafe_id", cafeId)
    .eq("user_id", user.id)
    .single();

  if (!card) {
    // Auto-join
    const { data: newCard, error: joinError } = await supabase
      .from("loyalty_cards")
      .insert({ cafe_id: cafeId, user_id: user.id })
      .select("id")
      .single();

    if (joinError || !newCard) {
      return <ErrorScreen message="Could not join loyalty program." />;
    }
    card = newCard;
  }

  // 4. Attempt to Add Stamp
  // Pass 'dynamic' as pin, and the actual token
  const result = await addStamp(cafeId, card.id, "dynamic", `/c/${cafe.slug}`, token);

  if (result.success) {
    return redirect(`/c/${cafe.slug}?celebrate=true`);
  } else {
    return <ErrorScreen message={result.message || "Failed to add stamp."} cafeSlug={cafe.slug} />;
  }
}

function ErrorScreen({ message, cafeSlug }: { message: string, cafeSlug?: string }) {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center text-white">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6 border border-red-500/20">
        <AlertCircle size={32} className="text-red-500" />
      </div>
      <h1 className="text-xl font-bold mb-2">Stamp Failed</h1>
      <p className="text-zinc-500 mb-8 max-w-xs">{message}</p>
      
      {cafeSlug && (
        <Link 
          href={`/c/${cafeSlug}`}
          className="px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-zinc-200 transition-colors"
        >
          Go to Card
        </Link>
      )}
    </div>
  );
}
