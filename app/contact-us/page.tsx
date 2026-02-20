import React from "react";
import ContactUs from "@/components/pages/ContactUs"
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Daily World Blog",
  description:
    "Have questions, feedback, or collaboration ideas? Contact Daily World Blog and get in touch with us easily.",
  openGraph: {
    title: "Contact Us | Daily World Blog",
    description:
      "Have questions, feedback, or collaboration ideas? Contact Daily World Blog and get in touch with us easily.",
    url: "https://dailyworldblog.com/contact-us/",
    type: "website",
  },
  alternates: {
    canonical: "https://dailyworldblog.com/contact-us/",
  },
};

export default function page() {
  return <ContactUs />;
}
