// components/auth/RegisterForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, User, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { useAuth } from "@/components/hooks/useAuth";
import { registerSchema, RegisterFormData } from "@/lib/validations/auth";
import { AuthLayout } from "./AuthLayout";
import { PasswordInput } from "./PasswordInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

// Password strength indicator
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = () => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = getStrength();
  const strengthText = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  const strengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-emerald-500",
  ];

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-2 space-y-2"
    >
      <div className="flex gap-1 h-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`flex-1 rounded-full transition-all duration-300 ${i < strength ? strengthColor[strength - 1] : "bg-gray-600"
              }`}
          />
        ))}
      </div>
      <p
        className={`text-xs ${strength > 0 ? strengthColor[strength - 1].replace("bg-", "text-") : "text-gray-400"}`}
      >
        {strength > 0 ? strengthText[strength - 1] : "Enter password"}
      </p>
    </motion.div>
  );
};

export function RegisterForm() {
  const router = useRouter();
  const { register: registerUser, isLoading } = useAuth();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: true,
    },
  });

  const password = watch("password");
  const loading = isSubmitting || isLoading;

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const { confirmPassword, terms, ...userData } = data;
      console.log("Registration data:", userData);
      const result = await registerUser(userData);
      if (result.success) {
        toast.success("Account created successfully! Please login.");
        router.push("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed. Please try again.");
    }
  };

  return (
    <AuthLayout
      title="Join Our Community"
      subtitle="Start your storytelling journey with us"
      icon={<BookOpen className="h-8 w-8 text-white" />}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="username" className="text-gray-300">
            Full Name
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="username"
              type="text"
              placeholder="John Doe"
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              disabled={loading}
              {...register("username")}
              aria-invalid={!!errors.username}
            />
          </div>
          <AnimatePresence>
            {errors.username && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400"
              >
                {errors.username.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-300">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              disabled={loading}
              {...register("email")}
              aria-invalid={!!errors.email}
            />
          </div>
          <AnimatePresence>
            {errors.email && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400"
              >
                {errors.email.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-300">
            Password
          </Label>
          <PasswordInput
            id="password"
            placeholder="••••••••"
            disabled={loading}
            error={!!errors.password}
            {...register("password")}
          />
          <PasswordStrength password={password} />
          <AnimatePresence>
            {errors.password && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400"
              >
                {errors.password.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Confirm Password Field */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword" className="text-gray-300">
            Confirm Password
          </Label>
          <PasswordInput
            id="confirmPassword"
            placeholder="••••••••"
            disabled={loading}
            error={!!errors.confirmPassword}
            {...register("confirmPassword")}
          />
          <AnimatePresence>
            {errors.confirmPassword && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400"
              >
                {errors.confirmPassword.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Terms and Conditions */}
        <div className="space-y-2">
          <div className="flex items-start space-x-2">
            <Checkbox id="terms" disabled={loading} {...register("terms")} />
            <Label
              htmlFor="terms"
              className="text-sm text-gray-300 leading-relaxed cursor-pointer"
            >
              I agree to the{" "}
              <p
                href="/terms"
                className="text-blue-400 hover:text-blue-300 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
              </p>{" "}
              and{" "}
              <p
                href="/privacy"
                className="text-blue-400 hover:text-blue-300 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
              </p>
            </Label>
          </div>
          <AnimatePresence>
            {errors.terms && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-sm text-red-400"
              >
                {errors.terms.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-semibold h-11"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Creating Account...</span>
            </div>
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-semibold transition hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
}
