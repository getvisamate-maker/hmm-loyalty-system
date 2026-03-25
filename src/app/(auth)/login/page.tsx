import { Suspense } from "react";
import AuthForm from "./auth-form";

export default async function LoginPage(props: {
  searchParams: Promise<{ message?: string; next?: string }>;
}) {
  const searchParams = await props.searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <Suspense fallback={<div className="text-center p-10 text-sm text-zinc-500">Loading...</div>}>
         <AuthForm message={searchParams.message} next={searchParams.next} />
      </Suspense>
    </div>
  );
}