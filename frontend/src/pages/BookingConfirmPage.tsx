import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, Phone } from "lucide-react";

interface BookingData {
  name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  totalPrice: number;
}

export default function BookingConfirmPage() {
  const navigate = useNavigate();
  const [bookingRef, setBookingRef] = useState("");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);

  useEffect(() => {
    const ref = localStorage.getItem("lastBookingRef");
    const data = localStorage.getItem("lastBookingData");

    if (!ref) {
      navigate("/book");
      return;
    }

    setBookingRef(ref);
    if (data) {
      setBookingData(JSON.parse(data));
    }

    // Clear after displaying
    localStorage.removeItem("lastBookingRef");
    localStorage.removeItem("lastBookingData");
  }, [navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-KE", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (!bookingRef || !bookingData) {
    return <div className="min-h-screen bg-slate-900" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="max-w-2xl mx-auto w-full relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">SparkleClean Kenya</h1>
          <p className="text-lg text-white/70">Professional Cleaning Services across Nairobi</p>
        </div>

        {/* Confirmation Card */}
        <Card className="border-white/10 bg-white/5 backdrop-blur p-8">
          {/* Success Icon */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full w-24 h-24" />
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-2xl">
                <CheckCircle2 className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>

          {/* Confirmation Title */}
          <h2 className="text-4xl font-bold text-white text-center mb-2">Booking Confirmed!</h2>
          <p className="text-white/70 text-center mb-8">Thank you for choosing SparkleClean Kenya</p>

          {/* Booking Reference */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 text-center mb-8">
            <p className="text-white/70 text-sm mb-2">Your Booking Reference</p>
            <p className="text-4xl font-bold font-mono text-primary mb-1">{bookingRef}</p>
            <p className="text-xs text-white/50">Save this reference for your records</p>
          </div>

          {/* Booking Details */}
          <div className="bg-slate-700/30 rounded-lg p-6 mb-8 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/60 text-sm">Client Name</p>
                <p className="text-white font-semibold">{bookingData.name}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Contact</p>
                <p className="text-white font-semibold">{bookingData.phone}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Service Booked</p>
                <p className="text-white font-semibold">{bookingData.service}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Total Price</p>
                <p className="text-primary font-bold text-lg">KSh {bookingData.totalPrice.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Preferred Date</p>
                <p className="text-white font-semibold">{formatDate(bookingData.date)}</p>
              </div>
              <div>
                <p className="text-white/60 text-sm">Preferred Time</p>
                <p className="text-white font-semibold">{bookingData.time}</p>
              </div>
            </div>
          </div>

          {/* Confirmation Message */}
          <div className="bg-slate-700/30 border border-primary/20 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-3 mb-3">
              <Phone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-white font-semibold">Next Steps</p>
              </div>
            </div>
            <p className="text-white/80">
              Thank you, <strong>{bookingData.name}</strong>! We have received your booking. Our team will call you on <strong>{bookingData.phone}</strong> within <strong>2 hours</strong> to confirm your appointment and provide any additional details.
            </p>
          </div>

          {/* Contact Information */}
          <div className="bg-primary/10 border border-primary/30 rounded-lg p-6 mb-8 text-center">
            <p className="text-white/70 text-sm mb-2">Questions? Contact us:</p>
            <p className="text-3xl font-bold text-primary">0768 362 805</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 h-11"
              onClick={() => navigate("/book")}
            >
              🧹 Book Another Service
            </Button>
            <Button
              className="h-11 font-semibold"
              onClick={() => navigate("/login")}
            >
              Back to Home
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
