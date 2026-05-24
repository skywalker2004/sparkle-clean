import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Eye, EyeOff, Phone } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import type { LoginCredentials } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminForm, setShowAdminForm] = useState(false);

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    try {
      await login(data);
      toast.success("Welcome back, Roggy! 👋");
      navigate("/dashboard");
    } catch (error: any) {
      toast.error(error?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <img
        src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80&auto=format&fit=crop"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70" />
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />

      {/* Phone number top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex justify-center py-3">
        <a
          href="tel:0768362805"
          className="flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full border border-white/20"
        >
          <Phone className="w-3.5 h-3.5" />
          <span>0768 362 805</span>
        </a>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-2xl shadow-modal p-8 border border-white/20 backdrop-blur-xl">

          {/* Logo + Brand */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-elevated"
            >
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            <h1 className="text-2xl font-display font-bold text-white">SparkleClean Kenya</h1>
            <p className="text-white/70 text-sm mt-1">Premium Home Cleaning Services — Nairobi</p>

            {/* Trust signal */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-yellow-400 text-xs">★★★★★</span>
              <span className="text-white/60 text-xs">Trusted by 200+ Nairobi homes</span>
            </div>
          </div>

          {/* PRIMARY ACTION — Book a Cleaning */}
          <AnimatePresence mode="wait">
            {!showAdminForm ? (
              <motion.div
                key="client"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <Button
                  type="button"
                  className="w-full h-12 font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
                  onClick={() => navigate("/book")}
                >
                  🧹 Book a Cleaning Service
                </Button>

                <p className="text-center text-white/50 text-xs">
                  No registration needed · Instant booking · We call to confirm
                </p>

                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 h-px bg-white/15" />
                  <span className="text-white/40 text-xs">or</span>
                  <div className="flex-1 h-px bg-white/15" />
                </div>

                {/* Discreet admin login link */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowAdminForm(true)}
                    className="text-white/40 hover:text-white/70 text-xs transition-colors underline underline-offset-2"
                  >
                    Admin Login
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="admin"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white/90">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@sparkleclean.co.ke"
                      {...register("email")}
                      className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                    />
                    {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-white/90">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        {...register("password")}
                        className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-11 font-semibold"
                    disabled={loading}
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {loading ? "Signing in…" : "Sign In"}
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setShowAdminForm(false)}
                      className="text-white/40 hover:text-white/70 text-xs transition-colors underline underline-offset-2"
                    >
                      ← Back
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </motion.div>
    </div>
  );
}
