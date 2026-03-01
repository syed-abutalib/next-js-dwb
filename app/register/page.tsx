// app/register/page.tsx (Server Component)
import { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/common/RegisterForm";

export const metadata: Metadata = {
  title: "Register | Daily World Blog",
  description:
    "Create an account on Daily World Blog to publish articles, comment on posts, and join our community.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
