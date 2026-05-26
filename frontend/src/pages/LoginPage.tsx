import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { LoginCredentials } from "@/types";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      email: "admin@sparkleclean.co.ke",
      password: "Nairobi2026!",
    },
  });

  const onSubmit = async (data: LoginCredentials) => {
    setLoading(true);
    try {
      await login(data);
      toast.success("Welcome back! 👋");
      navigate("/dashboard");
    } catch (error: any) {
      const message = error?.message || "Invalid email or password. Please try again.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

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

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass rounded-2xl shadow-modal p-8 border border-white/20 backdrop-blur-xl">
          <div className="text-center mb-8">
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
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@company.co.ke"
                {...register("email")}
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
              />
              {errors.email && (
                <p className="text-sm text-red-400">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/90">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...register("password")}
                className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
              />
              {errors.password && (
                <p className="text-sm text-red-400">{errors.password.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 font-semibold"
              disabled={loading}
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 p-3 rounded-lg bg-white/5 border border-white/10">
            <p className="text-xs text-white/60 text-center font-medium mb-1">Demo Credentials</p>
            <p className="text-xs text-white/50 text-center">admin@sparkleclean.co.ke</p>
            <p className="text-xs text-white/50 text-center">Nairobi2026!</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
