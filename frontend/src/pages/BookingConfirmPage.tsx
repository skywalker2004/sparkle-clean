import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Phone, Home, Sparkles, ArrowLeft } from "lucide-react";
import { useEffect } from "react";

export default function BookingConfirmPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const bookingRef = searchParams.get("ref");
  const fullName = searchParams.get("name");
  const phone = searchParams.get("phone");
  const preferredDate = searchParams.get("date");
  
  useEffect(() => {
    // If no booking reference, redirect to booking page
    if (!bookingRef) {
      navigate("/book");
    }
  }, [bookingRef, navigate]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 mr-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">SparkleClean Kenya</h1>
            <p className="text-sm text-white/70">Premium Home Cleaning Services — Nairobi</p>
          </div>
        </div>

        {/* Confirmation Card */}
        <Card className="bg-slate-800/50 border-white/10 backdrop-blur-sm p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full" />
              <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          {/* Confirmation Title */}
          <h2 className="text-3xl font-bold text-white mb-2">Booking Submitted!</h2>
          <p className="text-white/70 mb-8">Thank you for choosing SparkleClean Kenya</p>

          {/* Booking Details */}
          <div className="bg-slate-700/30 rounded-lg p-6 mb-8 space-y-4">
            {/* Booking Reference */}
            <div>
              <p className="text-white/60 text-sm mb-1">Booking Reference</p>
              <p className="text-2xl font-mono font-bold text-primary">{bookingRef}</p>
              <p className="text-xs text-white/50 mt-1">Save this reference for your records</p>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 pt-4">
              {/* Client Name */}
              <div className="mb-4">
                <p className="text-white/60 text-sm mb-1">Full Name</p>
                <p className="text-white font-semibold">{fullName}</p>
              </div>

              {/* Preferred Date */}
              {preferredDate && (
                <div className="mb-4">
                  <p className="text-white/60 text-sm mb-1">Preferred Date</p>
                  <p className="text-white font-semibold">{formatDate(preferredDate)}</p>
                </div>
              )}

              {/* Phone */}
              {phone && (
                <div>
                  <p className="text-white/60 text-sm mb-1">Contact Number</p>
                  <p className="text-white font-semibold">{phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mb-8">
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-white font-semibold mb-1">We will call you to confirm</p>
                <p className="text-white/70 text-sm">
                  Our team will call you on {phone} to confirm your booking details and answer any questions you may have.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-slate-700/30 rounded-lg p-4 mb-8">
            <p className="text-white/70 text-sm mb-2">For immediate assistance, call us:</p>
            <p className="text-2xl font-bold text-primary">0768 362 805</p>
          </div>

          {/* Additional Info */}
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-start gap-3">
              <Home className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-semibold text-sm">What happens next?</p>
                <p className="text-white/60 text-xs">1. We'll review your booking request<br/>2. Call to confirm the date and time<br/>3. Arrive on your preferred date with all supplies</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
              onClick={() => navigate("/book")}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Book Another Service
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90"
              onClick={() => navigate("/login")}
            >
              Back to Login
            </Button>
          </div>
        </Card>

        {/* Footer Note */}
        <p className="text-center text-white/50 text-xs mt-6">
          Booking reference has been saved. You can use it to track your cleaning appointment.
        </p>
      </div>
    </div>
  );
}
