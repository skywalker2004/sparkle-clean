import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Sparkles, Phone } from "lucide-react";
import { toast } from "sonner";
import { bookingsApi } from "@/lib/api";

const bookingSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^(\+254|0)[0-9]{9}$/, "Enter a valid phone number (e.g., 0768362805)"),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters"),
  serviceType: z.enum(["Standard", "Deep Clean", "Move-In/Out", "Other"]),
  preferredDate: z.string().refine((date) => new Date(date) > new Date(), "Date must be in the future"),
  preferredTime: z.enum(["Morning 8am-12pm", "Afternoon 12pm-5pm", "Evening 5pm-8pm"]),
  notes: z.string().optional().or(z.literal("")),
});

type BookingFormData = z.infer<typeof bookingSchema>;

const nairobaAreas = [
  "Westlands",
  "Kilimani",
  "Upper Hill",
  "Lower Kabete",
  "Muthaiga",
  "Karen",
  "Langata",
  "Lavington",
  "Nairobi West",
  "Nyaya",
  "Garden Estate",
  "Spring Valley",
  "Ridgeways",
  "Gigiri",
  "Runda",
  "Nairobi Central",
  "Eastleigh",
  "Parklands",
  "Highridge",
  "Hurlingham",
];

export default function BookingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showAreaSuggestions, setShowAreaSuggestions] = useState(false);
  const [filteredAreas, setFilteredAreas] = useState<string[]>([]);

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      serviceType: "Standard",
      preferredDate: "",
      preferredTime: "Morning 8am-12pm",
      notes: "",
    },
  });

  const addressValue = watch("address");

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue("address", value);
    
    if (value.length > 0) {
      const filtered = nairobaAreas.filter(area => 
        area.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredAreas(filtered);
      setShowAreaSuggestions(filtered.length > 0);
    } else {
      setShowAreaSuggestions(false);
    }
  };

  const selectArea = (area: string) => {
    setValue("address", area);
    setShowAreaSuggestions(false);
  };

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true);
    try {
      const booking = await bookingsApi.create({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address,
        serviceType: data.serviceType,
        preferredDate: new Date(data.preferredDate).toISOString(),
        preferredTime: data.preferredTime,
        notes: data.notes || undefined,
      });
      
      toast.success("Booking submitted successfully!");
      navigate(`/book/confirm?ref=${booking.bookingRef}&name=${encodeURIComponent(booking.fullName)}&phone=${booking.phone}&date=${booking.preferredDate}`);
    } catch (error: any) {
      toast.error(error?.message || "Failed to submit booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 mr-3">
            <Sparkles className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white">SparkleClean Kenya</h1>
            <p className="text-sm text-white/70">Premium Home Cleaning Services — Nairobi</p>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex items-center justify-center gap-2 text-white/70 mb-8">
          <Phone className="w-4 h-4" />
          <span>Call us: <span className="font-semibold text-primary">0768 362 805</span></span>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-2xl mx-auto">
        <Card className="bg-slate-800/50 border-white/10 backdrop-blur-sm p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Book Your Cleaning Service</h2>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-white/90">Full Name *</Label>
              <Input
                id="fullName"
                placeholder="Your full name"
                {...register("fullName")}
                className="h-11 bg-slate-700/50 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
              />
              {errors.fullName && <p className="text-sm text-red-400">{errors.fullName.message}</p>}
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/90">Phone Number *</Label>
              <Input
                id="phone"
                placeholder="0768 362 805"
                {...register("phone")}
                className="h-11 bg-slate-700/50 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
              />
              {errors.phone && <p className="text-sm text-red-400">{errors.phone.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90">Email Address (Optional)</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                {...register("email")}
                className="h-11 bg-slate-700/50 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
              />
              {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
            </div>

            {/* Address */}
            <div className="space-y-2 relative">
              <Label htmlFor="address" className="text-white/90">Location / Address in Nairobi *</Label>
              <div className="relative">
                <Input
                  id="address"
                  placeholder="e.g., Westlands, Kilimani, Karen..."
                  {...register("address")}
                  onChange={handleAddressChange}
                  onFocus={() => filteredAreas.length > 0 && setShowAreaSuggestions(true)}
                  className="h-11 bg-slate-700/50 border-white/20 text-white placeholder:text-white/40 focus:border-primary"
                />
                
                {/* Area Suggestions */}
                {showAreaSuggestions && filteredAreas.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-700 border border-white/20 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                    {filteredAreas.map((area) => (
                      <button
                        key={area}
                        type="button"
                        onClick={() => selectArea(area)}
                        className="w-full text-left px-4 py-2 text-white hover:bg-slate-600/50 transition-colors"
                      >
                        {area}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              {errors.address && <p className="text-sm text-red-400">{errors.address.message}</p>}
            </div>

            {/* Service Type */}
            <div className="space-y-2">
              <Label htmlFor="serviceType" className="text-white/90">Service Type *</Label>
              <select
                {...register("serviceType")}
                className="w-full h-11 px-3 bg-slate-700/50 border border-white/20 text-white rounded-md focus:outline-none focus:border-primary transition-colors"
              >
                <option value="Standard">Standard Cleaning</option>
                <option value="Deep Clean">Deep Clean</option>
                <option value="Move-In/Out">Move-In/Out Cleaning</option>
                <option value="Other">Other Service</option>
              </select>
              {errors.serviceType && <p className="text-sm text-red-400">{errors.serviceType.message}</p>}
            </div>

            {/* Preferred Date */}
            <div className="space-y-2">
              <Label htmlFor="preferredDate" className="text-white/90">Preferred Date *</Label>
              <Input
                id="preferredDate"
                type="date"
                {...register("preferredDate")}
                className="h-11 bg-slate-700/50 border-white/20 text-white focus:border-primary [color-scheme:dark]"
              />
              {errors.preferredDate && <p className="text-sm text-red-400">{errors.preferredDate.message}</p>}
            </div>

            {/* Preferred Time */}
            <div className="space-y-2">
              <Label htmlFor="preferredTime" className="text-white/90">Preferred Time *</Label>
              <select
                {...register("preferredTime")}
                className="w-full h-11 px-3 bg-slate-700/50 border border-white/20 text-white rounded-md focus:outline-none focus:border-primary transition-colors"
              >
                <option value="Morning 8am-12pm">Morning (8am - 12pm)</option>
                <option value="Afternoon 12pm-5pm">Afternoon (12pm - 5pm)</option>
                <option value="Evening 5pm-8pm">Evening (5pm - 8pm)</option>
              </select>
              {errors.preferredTime && <p className="text-sm text-red-400">{errors.preferredTime.message}</p>}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-white/90">Additional Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions or requests..."
                {...register("notes")}
                className="bg-slate-700/50 border-white/20 text-white placeholder:text-white/40 focus:border-primary min-h-20"
              />
              {errors.notes && <p className="text-sm text-red-400">{errors.notes.message}</p>}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 font-semibold text-base"
            >
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {loading ? "Submitting Booking..." : "Submit Booking"}
            </Button>

            <p className="text-xs text-white/60 text-center">
              We'll call you on the provided number to confirm your booking details.
            </p>
          </form>
        </Card>
      </div>
    </div>
  );
}
