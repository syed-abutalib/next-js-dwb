import AboutComponent from "@/components/pages/AboutComponent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us | Daily World Blog",
  description:
    "Daily World Blog: Latest news, trending stories, and insightful articles across lifestyle, culture, and global updates. Learn more about us",
  openGraph: {
    title: "About Us | Daily World Blog",
    description:
      "Daily World Blog: Latest news, trending stories, and insightful articles across lifestyle, culture, and global updates.",
    url: "https://dailyworldblog.com/about-us/",
    type: "website",
  },
  alternates: {
    canonical: "https://dailyworldblog.com/about-us/",
  },
};

export default function page() {
  return <AboutComponent />;
}
