import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Eye, EyeOff, ArrowLeft, LockOpen, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api";

const resetSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
  });

type ResetForm = z.infer<typeof resetSchema>;

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema) as any,
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async (data: ResetForm) => {
    if (!token) {
      setError("Missing reset token. Please request a new reset link.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await authApi.resetPassword(token, data.password);
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      setError(err?.message || "Reset link is invalid or has expired");
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
          <div className="text-center mb-6">
            <h1 className="text-2xl font-display font-bold text-white">Set a New Password</h1>
            <p className="text-white/70 text-sm mt-1">Choose a strong password you'll remember</p>
          </div>

          {success ? (
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 mx-auto">
                <LockOpen className="w-7 h-7 text-primary" />
              </div>
              <p className="text-white/85 text-sm leading-6">
                Your password has been reset successfully.
                <br />
                You can now log in with your new password.
              </p>
              <Button type="button" className="w-full h-11 font-semibold" onClick={() => navigate("/login")}>
                Go to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-red-300 text-sm leading-5">
                    {error}{" "}
                    <Link to="/forgot-password" className="underline underline-offset-2 hover:text-red-200">
                      Request a new reset link
                    </Link>
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password" className="text-white/90">
                  New Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="At least 8 characters"
                    autoComplete="new-password"
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

              <div className="space-y-2">
                <Label htmlFor="confirm" className="text-white/90">
                  Confirm New Password
                </Label>
                <div className="relative">
                  <Input
                    id="confirm"
                    type={showConfirm ? "text" : "password"}
                    placeholder="Re-enter your new password"
                    autoComplete="new-password"
                    {...register("confirm")}
                    className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white/90 transition-colors"
                    aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirm && <p className="text-sm text-red-400">{errors.confirm.message}</p>}
              </div>

              <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Resetting…" : "Set New Password"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-1 mx-auto text-white/40 hover:text-white/70 text-xs transition-colors underline underline-offset-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}


