import { useSearchParams } from "next/navigation";
import { useRouter } from "next/router"
import { trpc } from "../_trpc/client";

// sole use is to sync user to the db if they are not already in there
const Page = () => {
  const router = useRouter();

  const searchParams = useSearchParams();
  const origin = searchParams.get('origin');

  const { data, isLoading } = trpc.test.useQuery();

}

export default Page

/*
  tRPC (typescript Remote Procedure Call)

  in regualr next js when the backend returns soomething to the frontend and we await it it has a any type which is bad but with tRPC we get automatic typesafe whatever the backend returns will be the type of the data.

  https://trpc.io/docs/client/react/server-components 
*/