// app/blogs/page.tsx
import { Metadata } from "next";
import { Suspense } from "react";
import { BlogSkeleton } from "@/components/common/BlogSkeleton";
import Blog from "@/components/pages/Blog";

export const metadata: Metadata = {
  title: "All Blogs | Daily World Blog",
  description:
    "Explore all our blog articles featuring fashion and beauty, finance, technology, gaming, health and fitness, home and garden, business, and consulting. Discover tips, trends, and expert insights in one place.",
  openGraph: {
    title: "All Blogs | Daily World Blog",
    description:
      "Explore all our blog articles featuring fashion and beauty, finance, technology, gaming, health and fitness, home and garden, business, and consulting.",
    url: "https://dailyworldblog.com/blogs",
    type: "website",
  },
  alternates: {
    canonical: "https://dailyworldblog.com/blogs",
  },
};

export default function BlogsPage() {
  return (
    <Suspense fallback={<BlogSkeleton />}>
      <Blog />
    </Suspense>
  );
}
