"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Mail, 
  Lock, 
  LogIn, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  Loader2
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  const router = useRouter();
  const { t, direction } = useLanguage();
  const { login, isAuthenticated, user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      // Redirect based on user role
      const redirectPath = user?.role === 'teacher' ? '/dashboard/teacher' : '/dashboard';
      router.push(redirectPath);
    }
  }, [isAuthenticated, isLoading, router, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    setIsLoading(true);
    
    try {
      const redirectUrl = await login(email, password);
      router.push(redirectUrl);
    } catch (err: any) {
      console.error("Login error details:", err);
      const errorMessage = err?.message || t("auth.invalidCredentials") || "Invalid email or password. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-slate-700 via-slate-600 to-slate-700">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient Orbs */}
        <motion.div
          className="absolute top-0 -left-1/4 w-96 h-96 bg-purple-400/25 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-0 -right-1/4 w-96 h-96 bg-indigo-400/25 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808015_1px,transparent_1px),linear-gradient(to_bottom,#80808015_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {/* Animated Lines */}
        <motion.div
          className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400/25 to-transparent"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-400/25 to-transparent"
          animate={{
            opacity: [0.3, 0.5, 0.3],
            scaleX: [0.8, 1, 0.8],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-[480px]"
      >
        {/* Brand Header */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="flex flex-col items-center justify-center mb-8"
        >
          <motion.div
            className="flex items-center justify-center w-32 h-32 rounded-2xl bg-white/20 backdrop-blur-sm mb-6 shadow-2xl shadow-purple-500/20 relative overflow-hidden group mx-auto"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
            <Image
              src="/logo.png"
              alt="ElmCorner Logo"
              width={96}
              height={96}
              className="relative z-10 object-contain p-3"
            />
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-indigo-400/20"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>
          <div className="w-full flex justify-center">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">
              {t("auth.welcomeBack")}
            </h1>
          </div>
          <div className="w-full flex justify-center">
            <p className="text-slate-300 text-sm text-center">
              {t("auth.signInToContinue")}
            </p>
          </div>
        </motion.div>

        {/* Login Card */}
        <Card className="backdrop-blur-xl bg-white/95 dark:bg-slate-900/95 border border-white/20 dark:border-slate-700/50 shadow-2xl shadow-black/20">
          <CardHeader className="space-y-1 pb-6 text-center">
            <CardTitle className="text-2xl font-bold text-center mx-auto">
              {t("auth.signIn")}
            </CardTitle>
            <CardDescription className="text-center mx-auto">
              {t("auth.enterCredentials") || "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="email" 
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <Mail className="h-4 w-4" />
                  {t("auth.emailAddress")}
                </label>
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-y-0 flex items-center pointer-events-none",
                    direction === "rtl" ? "right-0 pr-4" : "left-0 pl-4"
                  )}>
                    <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={cn(
                      "h-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200",
                      direction === "rtl" ? "pr-12" : "pl-12"
                    )}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label 
                  htmlFor="password" 
                  className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2"
                >
                  <Lock className="h-4 w-4" />
                  {t("auth.password")}
                </label>
                <div className="relative group">
                  <div className={cn(
                    "absolute inset-y-0 flex items-center pointer-events-none",
                    direction === "rtl" ? "right-0 pr-4" : "left-0 pl-4"
                  )}>
                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-purple-600 transition-colors" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={t("auth.passwordPlaceholder")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className={cn(
                      "h-12 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 focus:border-purple-500 focus:ring-purple-500/20 transition-all duration-200",
                      direction === "rtl" ? "pr-12 pl-12" : "pl-12 pr-12"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={cn(
                      "absolute inset-y-0 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors",
                      direction === "rtl" ? "left-0 pl-4" : "right-0 pr-4"
                    )}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -10, height: 0 }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm",
                      direction === "rtl" ? "text-right" : "text-left"
                    )}
                  >
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className={cn("flex items-center", direction === "rtl" ? "space-x-reverse space-x-2.5" : "space-x-2.5")}>
                  <input
                    type="checkbox"
                    id="remember"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-purple-600 border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-purple-500/20 focus:ring-offset-0 bg-white dark:bg-slate-800 cursor-pointer transition-colors"
                  />
                  <label 
                    htmlFor="remember" 
                    className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer font-medium"
                  >
                    {t("auth.rememberMe")}
                  </label>
                </div>
                <a
                  href="#"
                  className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-semibold transition-colors"
                >
                  {t("auth.forgotPassword")}
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      {t("auth.signingIn")}
                    </>
                  ) : (
                    <>
                      <LogIn className={cn("h-5 w-5 transition-transform", direction === "rtl" ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5")} />
                      {t("auth.signIn")}
                    </>
                  )}
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-700 to-indigo-700"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </Button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs text-center text-slate-500 dark:text-slate-400">
                {t("auth.secureLogin") || "Secure login powered by enterprise-grade authentication"}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
