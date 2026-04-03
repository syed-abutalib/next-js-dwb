import { Metadata } from "next";
import PrivacyPolicy from "@/components/pages/PrivacyPolicy"
export const metadata: Metadata = {
  title: "Privacy Policy | Daily World Blog",
  description: "Daily World Blog privacy policy & terms learn how we collect, use, and protect your data, plus rules for content, user behavior, and site usage.",
  alternates: {
    canonical: "/privacy-policy",
  },
  openGraph: {
    title: "Privacy Policy | Daily World Blog",
    description: "Daily World Blog privacy policy & terms learn how we collect, use, and protect your data",
    type: "website",
    url: "https://dailyworldblog.com/privacy-policy",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Privacy Policy - Daily World Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy Policy | Daily World Blog",
    description: "Learn how Daily World Blog collects, uses, and protects your personal information.",
    images: ["/logo.png"],
  },
};

export default function page(){
  return (
    <PrivacyPolicy/>
  )
}
