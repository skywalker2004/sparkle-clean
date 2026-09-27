import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, MailCheck, MessageCircle, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { authApi } from "@/lib/api";

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type ForgotForm = z.infer<typeof forgotSchema>;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema) as any,
    defaultValues: { email: "" },
  });

  const onSubmit = async (data: ForgotForm) => {
    setLoading(true);
    try {
      // Security requirement: the backend returns the SAME generic message for
      // existing and non-existing accounts. The UI must never confirm whether
      // an email exists — only the generic message is shown, every time.
      const res = await authApi.forgotPassword(data.email);
      setSent(true);
      setWhatsappLink(res.whatsappLink ?? null);
      toast.success("Check your inbox for reset instructions");
    } catch (error: any) {
      setSent(true);
      setWhatsappLink(null);
      toast.error(error?.message || "Something went wrong. Please try again.");
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
            <h1 className="text-2xl font-display font-bold text-white">Forgot Password?</h1>
            <p className="text-white/70 text-sm mt-1">We'll send you a secure reset link</p>
          </div>

          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white/90">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@sparkleclean.co.ke"
                  autoComplete="email"
                  {...register("email")}
                  className="h-11 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                />
                {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
              </div>

              <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {loading ? "Sending…" : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="inline-flex items-center gap-1 text-white/40 hover:text-white/70 text-xs transition-colors underline underline-offset-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Back to Login
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/20 mx-auto">
                <MailCheck className="w-7 h-7 text-primary" />
              </div>
              <p className="text-white/85 text-sm leading-6">
                If an account with that email exists, reset instructions have been sent.
                <br />
                Check your inbox (and spam folder) — the link expires in 30 minutes.
              </p>

              {whatsappLink && (
                <>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-px bg-white/15" />
                    <span className="text-white/40 text-xs">or</span>
                    <div className="flex-1 h-px bg-white/15" />
                  </div>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-md border border-green-500/40 bg-green-500/10 text-green-300 text-sm font-semibold hover:bg-green-500/20 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" /> Also send this link to my WhatsApp
                  </a>
                  <p className="text-white/40 text-[11px] leading-5">
                    This opens a pre-filled WhatsApp message you tap to send to yourself — it is a
                    manual convenience, not an automated WhatsApp notification.
                  </p>
                </>
              )}

              <button
                type="button"
                onClick={() => navigate("/login")}
                className="inline-flex items-center gap-1 mx-auto text-white/40 hover:text-white/70 text-xs transition-colors underline underline-offset-2"
              >
                <ArrowLeft className="w-3 h-3" /> Back to Login
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

