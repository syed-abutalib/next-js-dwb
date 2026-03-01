// app/login/page.tsx (Server Component)
import { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/common/LoginForm";

export const metadata: Metadata = {
  title: "Login | Daily World Blog",
  description:
    "Login to your Daily World Blog account to manage posts, comments, and your profile.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
