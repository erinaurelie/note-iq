"use client"

import { useSearchParams, useRouter } from "next/navigation";
import { trpc } from "../_trpc/client";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";

// sole use is to sync user to the db if they are not already in there
const Page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  const { data, isLoading, error } = trpc.authCallback.useQuery(undefined, {
    retry: true,
    retryDelay: 500
  });

  useEffect(() => {
    if (data?.success) {
      router.push(origin ? `/${origin}` : '/dashboard');
    }
    if (error?.data?.code === 'UNAUTHORIZED') {
      router.push('/sign-in');
    }
  }, [data, error, origin, router]);

  return (
    <div className="w-full mt-24 flex justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 
          className="h-8 w-8 animate-spin text-zinc-800"
        />
        <h3 className="font-semibold text-xl">
          Setting up your account...
        </h3>
        <p>You will be redirected automatically.</p>
      </div>
    </div>
  );
}

export default Page

/*
  tRPC (typescript Remote Procedure Call)

  in regualr next js when the backend returns soomething to the frontend and we await it it has a any type which is bad but with tRPC we get automatic typesafe whatever the backend returns will be the type of the data.

  https://trpc.io/docs/client/react/server-components 
*/