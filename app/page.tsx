import {Metadata} from "next";
import { Suspense } from "react";
import HomeClient from "@/components/pages/Home";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
  },
};
export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}
