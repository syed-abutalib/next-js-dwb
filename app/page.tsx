// app/page.tsx (Server Component)
import { Metadata } from "next";
import { Suspense } from "react";
import HomeClient from "@/components/pages/Home";
import { HomeSkeleton } from "@/components/home/HomeSkeleton";
import { SITE_TITLE, SITE_DESCRIPTION, SITE_URL } from "@/components/common/Config";

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    type: "website",
    images: [
      {
        url: "/public/logo.png",
        width: 1200,
        height: 630,
        alt: SITE_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/public/logo.png"],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function HomePage() {
  return (
    <Suspense fallback={<HomeSkeleton />}>
      <HomeClient />
    </Suspense>
  );
}
