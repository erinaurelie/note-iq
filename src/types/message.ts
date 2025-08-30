// type router output
import { appRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";
import { JSX } from "react";

type RouterOutput = inferRouterOutputs<typeof appRouter>;

type Messages = RouterOutput["getFileMessages"]["messages"];

type OmitText = Omit<Messages[number], "text">;

type ExtendedText = OmitText & {
  text: string | JSX.Element;
}

export type ExtendedMessage = OmitText & ExtendedText;
