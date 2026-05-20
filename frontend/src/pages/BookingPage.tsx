import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Phone, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { bookingsApi } from "@/lib/api";

const SERVICES = [
  {
    category: "RESIDENTIAL CLEANING",
    items: [
      { name: "Standard House Clean", desc: "2-3 bedroom house, basic clean", price: 2500 },
      { name: "Deep House Clean", desc: "Thorough top-to-bottom clean", price: 5500 },
      { name: "Move-In Cleaning", desc: "Full property before moving in", price: 7000 },
      { name: "Move-Out Cleaning", desc: "Full property after vacating", price: 7000 },
      { name: "Post-Construction Clean", desc: "Dust, debris, finish clean", price: 12000 },
      { name: "After-Party Clean", desc: "Cleanup after events at home", price: 4500 },
      { name: "Spring/Seasonal Clean", desc: "Full seasonal refresh", price: 6000 },
    ]
  },
  {
    category: "SPECIFIC ROOM/AREA CLEANING",
    items: [
      { name: "Kitchen Deep Clean", desc: "Oven, cabinets, tiles, appliances", price: 2000 },
      { name: "Bathroom Deep Clean", desc: "Per bathroom", price: 1500, perUnit: true },
      { name: "Bedroom Clean", desc: "Per bedroom", price: 1200, perUnit: true },
      { name: "Living Room Clean", desc: "Full living room", price: 1500 },
    ]
  },
  {
    category: "CARPET AND UPHOLSTERY",
    items: [
      { name: "Carpet Cleaning", desc: "Per room", price: 1800, perUnit: true },
      { name: "Sofa/Couch Cleaning (2-seater)", desc: "2-seater couch", price: 2500 },
      { name: "Sofa/Couch Cleaning (3-seater)", desc: "3-seater couch", price: 3500 },
      { name: "Mattress Cleaning (single)", desc: "Single mattress", price: 1500 },
      { name: "Mattress Cleaning (double/king)", desc: "Double/king mattress", price: 2000 },
      { name: "Rug Cleaning", desc: "Standard rug", price: 1200 },
    ]
  },
  {
    category: "OFFICE AND COMMERCIAL",
    items: [
      { name: "Office Clean (small, up to 50sqm)", desc: "Small office space", price: 4000 },
      { name: "Office Clean (medium, 50-150sqm)", desc: "Medium office space", price: 8000 },
      { name: "Office Clean (large, 150sqm+)", desc: "Large office space", price: 15000 },
      { name: "Retail Shop Clean", desc: "Retail space cleaning", price: 5000 },
      { name: "Restaurant/Café Clean", desc: "Food service establishment", price: 9000 },
    ]
  },
  {
    category: "SPECIALIZED SERVICES",
    items: [
      { name: "Window Cleaning (interior)", desc: "Per window", price: 150, perUnit: true },
      { name: "Window Cleaning (interior + exterior)", desc: "Per window", price: 250, perUnit: true },
      { name: "Ceiling and Wall Wash", desc: "Full cleaning", price: 3000 },
      { name: "Tile and Grout Deep Clean", desc: "Complete tile cleaning", price: 2500 },
      { name: "Fridge/Freezer Clean", desc: "Deep appliance clean", price: 1000 },
      { name: "Oven Deep Clean", desc: "Complete oven cleaning", price: 1500 },
      { name: "Pressure Washing", desc: "Per area", price: 3500 },
    ]
  },
  {
    category: "REGULAR SUBSCRIPTION PACKAGES",
    items: [
      { name: "Weekly Maintenance Clean", desc: "Per visit", price: 2000 },
      { name: "Biweekly Maintenance Clean", desc: "Per visit", price: 2500 },
      { name: "Monthly Full Clean", desc: "Per visit", price: 4500 },
    ]
  }
];

const NAIROBI_AREAS = [
  "Westlands", "Karen", "Lavington", "Kilimani", "Runda", "Kileleshwa", 
  "Parklands", "Spring Valley", "Gigiri", "Muthaiga", "South C", "Langata", 
  "Thika Road", "Ruaka", "Kitisuru", "Eastleigh", "South B", "Hurlingham", 
  "Upperhill", "CBD Nairobi"
];

const bookingSchema = z.object({
  fullName: z.string().min(2, "Name required"),
  phone: z.string().regex(/^(\+254|0)[0-9]{9}$/, "Valid phone required (0768 or +254768)"),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(3, "Address required"),
  propertyType: z.enum(["Apartment", "House", "Office", "Shop", "Other"]),
  propertySize: z.enum(["Studio/1BR", "2-3 Bedroom", "4-5 Bedroom", "Large 6BR+", "Commercial Small", "Commercial Large"]),
  preferredDate: z.string().min(1, "Date required"),
  preferredTime: z.enum(["Morning 8am-12pm", "Afternoon 12pm-5pm", "Evening 5pm-8pm"]),
  frequency: z.enum(["One-time", "Weekly", "Biweekly", "Monthly"]),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

export default function BookingPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<{ name: string; price: number; perUnit?: boolean } | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      frequency: "One-time",
      preferredTime: "Morning 8am-12pm",
    }
  });

  const totalPrice = selectedService ? selectedService.price * quantity : 0;

  const onSubmit = async (data: BookingForm) => {
    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }

    setLoading(true);
    try {
      const bookingData = {
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || undefined,
        address: data.address,
        serviceType: selectedService.name,
        servicePrice: selectedService.price,
        quantity,
        totalPrice,
        preferredDate: data.preferredDate,
        preferredTime: data.preferredTime,
        frequency: data.frequency,
        propertyType: data.propertyType,
        propertySize: data.propertySize,
        notes: data.notes || undefined,
      };

      const result = await bookingsApi.create(bookingData);
      
      // Store booking ref for confirmation page
      localStorage.setItem("lastBookingRef", result.bookingRef);
      localStorage.setItem("lastBookingData", JSON.stringify({
        name: data.fullName,
        phone: data.phone,
        service: selectedService.name,
        date: data.preferredDate,
        time: data.preferredTime,
        totalPrice
      }));

      toast.success("Booking submitted! Redirecting...");
      setTimeout(() => navigate("/book/confirm"), 500);
    } catch (error: any) {
      toast.error(error.message || "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Contact Bar */}
      <div className="bg-primary/10 border-b border-primary/20 py-3 text-center">
        <div className="flex items-center justify-center gap-2 text-primary">
          <Phone className="w-4 h-4" />
          <span className="font-semibold">📞 Call us: 0768 362 805</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">SparkleClean Kenya</h1>
          <p className="text-lg text-white/70">Professional Cleaning Services across Nairobi</p>
        </div>

        {!showForm ? (
          <>
            {/* Services Grid */}
            <div className="space-y-8">
              {SERVICES.map((category) => (
                <div key={category.category}>
                  <h2 className="text-xl font-bold text-white mb-4 text-primary">{category.category}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {category.items.map((service) => (
                      <Card
                        key={service.name}
                        onClick={() => {
                          setSelectedService(service);
                          setQuantity(1);
                          setShowForm(true);
                        }}
                        className={`p-4 cursor-pointer transition-all ${
                          selectedService?.name === service.name
                            ? "border-primary bg-primary/5 ring-2 ring-primary"
                            : "border-white/10 hover:border-primary/50 hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{service.name}</h3>
                            <p className="text-sm text-white/60">{service.desc}</p>
                          </div>
                          {selectedService?.name === service.name && (
                            <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                        <div className="text-lg font-bold text-primary">KSh {service.price.toLocaleString()}</div>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            {selectedService && (
              <div className="mt-12 bg-primary/10 border border-primary/30 rounded-lg p-6 text-center">
                <p className="text-white/70 mb-2">Selected Service</p>
                <h3 className="text-2xl font-bold text-white mb-4">{selectedService.name}</h3>
                {selectedService.perUnit && (
                  <div className="mb-4">
                    <p className="text-white/60 mb-2">Quantity</p>
                    <div className="flex items-center justify-center gap-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        −
                      </Button>
                      <span className="text-xl font-bold text-white w-8 text-center">{quantity}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.min(20, quantity + 1))}
                        className="border-white/20 text-white hover:bg-white/10"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                )}
                <div className="text-4xl font-bold text-primary mt-6">
                  Total: KSh {totalPrice.toLocaleString()}
                </div>
                <Button
                  onClick={() => setShowForm(true)}
                  className="mt-6 w-full h-12 font-semibold"
                >
                  Continue to Booking Form
                </Button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Booking Form */}
            <div className="max-w-2xl mx-auto">
              <Card className="border-white/10 bg-white/5 backdrop-blur p-8">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white">Complete Your Booking</h2>
                  <p className="text-white/60 mt-1">
                    Service: {selectedService?.name} • Total: KSh {totalPrice.toLocaleString()}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowForm(false)}
                    className="text-white/60 hover:text-white mt-2"
                  >
                    ← Change Service
                  </Button>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <Label className="text-white/90">Full Name *</Label>
                      <Input
                        placeholder="John Doe"
                        {...register("fullName")}
                        className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                      {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90">Phone Number *</Label>
                      <Input
                        placeholder="+254768362805"
                        {...register("phone")}
                        className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                      {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90">Email (optional)</Label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        {...register("email")}
                        className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      />
                      {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90">Property Type *</Label>
                      <select
                        {...register("propertyType")}
                        className="mt-1 w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40"
                      >
                        <option value="">Select type</option>
                        <option value="Apartment">Apartment</option>
                        <option value="House">House</option>
                        <option value="Office">Office</option>
                        <option value="Shop">Shop</option>
                        <option value="Other">Other</option>
                      </select>
                      {errors.propertyType && <p className="text-red-400 text-sm mt-1">{errors.propertyType.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90">Property Size *</Label>
                      <select
                        {...register("propertySize")}
                        className="mt-1 w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40"
                      >
                        <option value="">Select size</option>
                        <option value="Studio/1BR">Studio/1BR</option>
                        <option value="2-3 Bedroom">2-3 Bedroom</option>
                        <option value="4-5 Bedroom">4-5 Bedroom</option>
                        <option value="Large 6BR+">Large 6BR+</option>
                        <option value="Commercial Small">Commercial Small</option>
                        <option value="Commercial Large">Commercial Large</option>
                      </select>
                      {errors.propertySize && <p className="text-red-400 text-sm mt-1">{errors.propertySize.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90">Location / Address *</Label>
                      <input
                        list="nairobi-areas"
                        placeholder="e.g., Westlands"
                        {...register("address")}
                        className="mt-1 w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white placeholder:text-white/40"
                      />
                      <datalist id="nairobi-areas">
                        {NAIROBI_AREAS.map(area => <option key={area} value={area} />)}
                      </datalist>
                      {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90">Preferred Date *</Label>
                      <Input
                        type="date"
                        {...register("preferredDate")}
                        className="mt-1 bg-white/10 border-white/20 text-white"
                      />
                      {errors.preferredDate && <p className="text-red-400 text-sm mt-1">{errors.preferredDate.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90">Preferred Time *</Label>
                      <select
                        {...register("preferredTime")}
                        className="mt-1 w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      >
                        <option value="Morning 8am-12pm">Morning 8am-12pm</option>
                        <option value="Afternoon 12pm-5pm">Afternoon 12pm-5pm</option>
                        <option value="Evening 5pm-8pm">Evening 5pm-8pm</option>
                      </select>
                      {errors.preferredTime && <p className="text-red-400 text-sm mt-1">{errors.preferredTime.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90">Frequency *</Label>
                      <select
                        {...register("frequency")}
                        className="mt-1 w-full px-3 py-2 bg-white/10 border border-white/20 rounded text-white"
                      >
                        <option value="One-time">One-time</option>
                        <option value="Weekly">Weekly</option>
                        <option value="Biweekly">Biweekly</option>
                        <option value="Monthly">Monthly</option>
                      </select>
                      {errors.frequency && <p className="text-red-400 text-sm mt-1">{errors.frequency.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/90">Additional Notes (optional)</Label>
                    <Textarea
                      placeholder="Any special requests or notes..."
                      {...register("notes")}
                      className="mt-1 bg-white/10 border-white/20 text-white placeholder:text-white/40"
                      rows={3}
                    />
                  </div>

                  {/* Price Summary */}
                  <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 mt-6">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                      <div className="text-white/70">{selectedService?.name}</div>
                      <div className="text-right text-white">KSh {selectedService!.price.toLocaleString()}</div>
                      {quantity > 1 && (
                        <>
                          <div className="text-white/70">Quantity</div>
                          <div className="text-right text-white">× {quantity}</div>
                        </>
                      )}
                    </div>
                    <div className="border-t border-primary/30 pt-3 flex justify-between">
                      <div className="font-semibold text-white">TOTAL</div>
                      <div className="text-2xl font-bold text-primary">KSh {totalPrice.toLocaleString()}</div>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 font-semibold text-base mt-6"
                  >
                    {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {loading ? "Booking..." : `Book Now — KSh ${totalPrice.toLocaleString()}`}
                  </Button>
                </form>
              </Card>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
