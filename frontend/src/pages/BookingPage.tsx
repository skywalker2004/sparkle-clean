import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2, Phone, CheckCircle2, Star, Sparkles, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { bookingsApi } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ServiceArtwork = {
  title: string;
  subtitle: string;
  emoji: string;
  colors: [string, string];
};

const createServiceImage = ({ title, subtitle, emoji, colors }: ServiceArtwork) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" role="img" aria-labelledby="title desc">
      <title>${title}</title>
      <desc>${subtitle}</desc>
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stop-color="#ffffff" stop-opacity="0.35" />
          <stop offset="100%" stop-color="#ffffff" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="800" height="600" rx="36" fill="url(#bg)" />
      <rect x="36" y="36" width="728" height="528" rx="28" fill="#000000" fill-opacity="0.12" stroke="#ffffff" stroke-opacity="0.14" />
      <circle cx="620" cy="110" r="150" fill="url(#glow)" />
      <circle cx="180" cy="150" r="90" fill="#ffffff" fill-opacity="0.10" />
      <circle cx="650" cy="420" r="120" fill="#000000" fill-opacity="0.12" />
      <text x="90" y="185" font-size="120" font-family="Segoe UI Emoji, Apple Color Emoji, Noto Color Emoji, sans-serif">${emoji}</text>
      <rect x="90" y="240" width="620" height="190" rx="28" fill="#0f172a" fill-opacity="0.30" stroke="#ffffff" stroke-opacity="0.16" />
      <text x="120" y="305" font-size="42" font-weight="700" fill="#ffffff" font-family="Inter, Arial, sans-serif">${title}</text>
      <text x="120" y="360" font-size="24" fill="#e2e8f0" fill-opacity="0.95" font-family="Inter, Arial, sans-serif">${subtitle}</text>
      <rect x="120" y="392" width="170" height="10" rx="5" fill="#ffffff" fill-opacity="0.4" />
      <rect x="308" y="392" width="92" height="10" rx="5" fill="#ffffff" fill-opacity="0.22" />
      <rect x="410" y="392" width="140" height="10" rx="5" fill="#ffffff" fill-opacity="0.22" />
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
};

const art = (title: string, subtitle: string, emoji: string, colors: [string, string]) =>
  createServiceImage({ title, subtitle, emoji, colors });

const PROPERTY_TYPES = [
  "Apartment",
  "Maisonette",
  "Bungalow",
  "Villa",
  "Office",
  "Townhouse",
  "Studio",
  "Other",
] as const;

const PROPERTY_SIZES = [
  "Studio / Bedsitter",
  "1 Bedroom",
  "2 Bedrooms",
  "3 Bedrooms",
  "4 Bedrooms",
  "5+ Bedrooms",
  "Large Commercial",
] as const;

const PREFERRED_TIMES = [
  "Morning 8am–12pm",
  "Afternoon 12pm–4pm",
  "Evening 4pm–8pm",
] as const;

const BOOKING_FREQUENCIES = [
  "One-time Booking",
  "Weekly",
  "Bi-weekly",
  "Monthly",
] as const;

const SERVICE_DETAILS = [
  {
    category: "RESIDENTIAL CLEANING",
    icon: "🏠",
    color: "from-blue-500 to-blue-600",
    items: [
      {
        name: "Standard House Clean",
        desc: "Perfect for regular homes",
        details: "Comprehensive cleaning of 2-3 bedroom house including dusting, vacuuming, mopping, bathroom cleaning, and kitchen tidying",
        image: art("Standard House Clean", "Dusting, vacuuming, mopping", "🏠", ["#2563eb", "#1d4ed8"]),
        price: 2500,
      },
      {
        name: "Deep House Clean",
        desc: "Thorough top-to-bottom cleaning",
        details: "Intensive deep cleaning including baseboards, light fixtures, inside cabinets, deep carpet shampooing, and tile grout cleaning",
        image: art("Deep House Clean", "Top-to-bottom deep refresh", "🧼", ["#1e40af", "#4f46e5"]),
        price: 5500,
      },
      {
        name: "Move-In Cleaning",
        desc: "Before you settle in",
        details: "Complete property sanitization before moving in, including wall cleaning, cabinet sanitization, and deep appliance cleaning",
        image: art("Move-In Cleaning", "Fresh start sanitization", "📦", ["#0f766e", "#0284c7"]),
        price: 7000,
      },
      {
        name: "Move-Out Cleaning",
        desc: "Leave it spotless",
        details: "Full property restoration cleaning after vacating, ensuring all surfaces are impeccable for the next tenant",
        image: art("Move-Out Cleaning", "End-of-tenancy restore", "🚪", ["#334155", "#2563eb"]),
        price: 7000,
      },
      {
        name: "Post-Construction Clean",
        desc: "Remove all dust and debris",
        details: "Specialized cleaning to remove construction dust, debris, and polish all surfaces for final finishing",
        image: art("Post-Construction Clean", "Dust, debris, polish", "🏗️", ["#7c3aed", "#1d4ed8"]),
        price: 12000,
      },
      {
        name: "After-Party Clean",
        desc: "Party cleanup services",
        details: "Professional post-event cleanup including floor cleaning, trash removal, and full restoration",
        image: art("After-Party Clean", "Reset after the celebration", "🎉", ["#ec4899", "#7c3aed"]),
        price: 4500,
      },
      {
        name: "Spring/Seasonal Clean",
        desc: "Refresh your home seasonally",
        details: "Full seasonal refresh including window cleaning, ceiling fans, and deep carpet cleaning",
        image: art("Spring/Seasonal Clean", "Seasonal refresh and reset", "🌸", ["#0f766e", "#3b82f6"]),
        price: 6000,
      },
    ],
  },
  {
    category: "SPECIFIC ROOM/AREA CLEANING",
    icon: "🧹",
    color: "from-purple-500 to-purple-600",
    items: [
      {
        name: "Kitchen Deep Clean",
        desc: "Professional kitchen cleaning",
        details: "Deep cleaning of oven interior, cabinet degreasing, appliance exterior, and tile grout restoration",
        image: art("Kitchen Deep Clean", "Degrease, sanitize, shine", "🍳", ["#7c3aed", "#a855f7"]),
        price: 2000,
      },
      {
        name: "Bathroom Deep Clean",
        desc: "Per bathroom",
        details: "Tile scrubbing, fixture polishing, grout cleaning, and disinfection of all surfaces",
        image: art("Bathroom Deep Clean", "Scrub, polish, disinfect", "🚿", ["#8b5cf6", "#db2777"]),
        price: 1500,
        perUnit: true,
      },
      {
        name: "Bedroom Clean",
        desc: "Per bedroom",
        details: "Dusting, vacuuming, bed cleaning, and comprehensive surface disinfection",
        image: art("Bedroom Clean", "Restful room reset", "🛏️", ["#a855f7", "#6366f1"]),
        price: 1200,
        perUnit: true,
      },
      {
        name: "Living Room Clean",
        desc: "Full living room refresh",
        details: "Complete living area cleaning including upholstery care, floor treatment, and dust removal",
        image: art("Living Room Clean", "Comfort area refresh", "🛋️", ["#6366f1", "#ec4899"]),
        price: 1500,
      },
    ],
  },
  {
    category: "CARPET AND UPHOLSTERY",
    icon: "🛋️",
    color: "from-pink-500 to-pink-600",
    items: [
      {
        name: "Carpet Cleaning",
        desc: "Per room professional cleaning",
        details: "Deep carpet shampooing with steam extraction and deodorization treatment",
        image: art("Carpet Cleaning", "Steam extraction and deodorize", "🧽", ["#ec4899", "#f97316"]),
        price: 1800,
        perUnit: true,
      },
      {
        name: "Sofa/Couch Cleaning (2-seater)",
        desc: "2-seater couch",
        details: "Professional upholstery cleaning with fabric protection treatment",
        image: art("2-Seater Sofa Cleaning", "Upholstery protection treatment", "🛋️", ["#db2777", "#8b5cf6"]),
        price: 2500,
      },
      {
        name: "Sofa/Couch Cleaning (3-seater)",
        desc: "3-seater couch",
        details: "Deep upholstery restoration including stain treatment and deodorization",
        image: art("3-Seater Sofa Cleaning", "Deep upholstery restore", "🪑", ["#be185d", "#6366f1"]),
        price: 3500,
      },
      {
        name: "Mattress Cleaning (single)",
        desc: "Single mattress",
        details: "Dust mite elimination, stain removal, and complete sanitization",
        image: art("Single Mattress Cleaning", "Allergen and stain removal", "🛏️", ["#f472b6", "#8b5cf6"]),
        price: 1500,
      },
      {
        name: "Mattress Cleaning (double/king)",
        desc: "Double/king mattress",
        details: "Professional deep cleaning with allergen and dust removal",
        image: art("Double/King Mattress Cleaning", "Deep sanitization finish", "🛏️", ["#fb7185", "#7c3aed"]),
        price: 2000,
      },
      {
        name: "Rug Cleaning",
        desc: "Standard rug",
        details: "Specialized rug cleaning with fabric-specific treatment",
        image: art("Rug Cleaning", "Fabric-safe rug treatment", "🧶", ["#c084fc", "#ec4899"]),
        price: 1200,
      },
    ],
  },
  {
    category: "OFFICE AND COMMERCIAL",
    icon: "🏢",
    color: "from-green-500 to-green-600",
    items: [
      {
        name: "Office Clean (small, up to 50sqm)",
        desc: "Small office space",
        details: "Desk cleaning, floor care, bathroom sanitation, and trash removal",
        image: art("Small Office Clean", "Desks, floors, bathrooms", "🖥️", ["#16a34a", "#0f766e"]),
        price: 4000,
      },
      {
        name: "Office Clean (medium, 50-150sqm)",
        desc: "Medium office space",
        details: "Comprehensive office cleaning including conference rooms and common areas",
        image: art("Medium Office Clean", "Conference and common areas", "🗂️", ["#0f766e", "#22c55e"]),
        price: 8000,
      },
      {
        name: "Office Clean (large, 150sqm+)",
        desc: "Large office space",
        details: "Full-scale office sanitization with specialized equipment and multiple cleaners",
        image: art("Large Office Clean", "Multi-team sanitization", "🏬", ["#166534", "#14b8a6"]),
        price: 15000,
      },
      {
        name: "Retail Shop Clean",
        desc: "Retail space cleaning",
        details: "Display cleaning, floor care, and customer area sanitization",
        image: art("Retail Shop Clean", "Displays and floors", "🛍️", ["#059669", "#22c55e"]),
        price: 5000,
      },
      {
        name: "Restaurant/Café Clean",
        desc: "Food service establishment",
        details: "Health-code compliant cleaning including kitchen deep clean and dining area",
        image: art("Restaurant/Café Clean", "Kitchen and dining hygiene", "☕", ["#10b981", "#f59e0b"]),
        price: 9000,
      },
    ],
  },
  {
    category: "SPECIALIZED SERVICES",
    icon: "⭐",
    color: "from-yellow-500 to-yellow-600",
    items: [
      {
        name: "Window Cleaning (interior)",
        desc: "Per window",
        details: "Professional window glass cleaning with streak-free finish",
        image: art("Interior Window Cleaning", "Streak-free glass finish", "🪟", ["#f59e0b", "#eab308"]),
        price: 150,
        perUnit: true,
      },
      {
        name: "Window Cleaning (interior + exterior)",
        desc: "Per window",
        details: "Complete window cleaning including frames and sills",
        image: art("Interior + Exterior Window Cleaning", "Frames, sills, glass", "🧴", ["#d97706", "#f97316"]),
        price: 250,
        perUnit: true,
      },
      {
        name: "Ceiling and Wall Wash",
        desc: "Full cleaning",
        details: "Spider web removal, stain treatment, and wall restoration",
        image: art("Ceiling and Wall Wash", "Webs, stains, restoration", "🧽", ["#eab308", "#f59e0b"]),
        price: 3000,
      },
      {
        name: "Tile and Grout Deep Clean",
        desc: "Complete tile cleaning",
        details: "Professional grout restoration and tile polishing with anti-bacterial treatment",
        image: art("Tile and Grout Deep Clean", "Restore grout and shine", "🧼", ["#fbbf24", "#d97706"]),
        price: 2500,
      },
      {
        name: "Fridge/Freezer Clean",
        desc: "Deep appliance clean",
        details: "Interior and exterior cleaning with sanitization and deodorization",
        image: art("Fridge/Freezer Clean", "Sanitize and deodorize", "🧊", ["#38bdf8", "#0ea5e9"]),
        price: 1000,
      },
      {
        name: "Oven Deep Clean",
        desc: "Complete oven cleaning",
        details: "Interior and exterior oven restoration with chemical-free methods",
        image: art("Oven Deep Clean", "Heat-safe deep clean", "🔥", ["#f97316", "#ef4444"]),
        price: 1500,
      },
      {
        name: "Pressure Washing",
        desc: "Per area",
        details: "High-pressure cleaning for driveways, patios, and exterior surfaces",
        image: art("Pressure Washing", "Driveways and patios", "💦", ["#0ea5e9", "#14b8a6"]),
        price: 3500,
      },
    ],
  },
  {
    category: "REGULAR SUBSCRIPTION PACKAGES",
    icon: "♻️",
    color: "from-teal-500 to-teal-600",
    items: [
      {
        name: "Weekly Maintenance Clean",
        desc: "Per visit",
        details: "Regular weekly maintenance to keep your space consistently clean",
        image: art("Weekly Maintenance Clean", "Keep it consistently tidy", "♻️", ["#14b8a6", "#0ea5e9"]),
        price: 2000,
      },
      {
        name: "Biweekly Maintenance Clean",
        desc: "Per visit",
        details: "Twice monthly maintenance cleaning service",
        image: art("Biweekly Maintenance Clean", "Every two weeks refresh", "🗓️", ["#0f766e", "#22c55e"]),
        price: 2500,
      },
      {
        name: "Monthly Full Clean",
        desc: "Per visit",
        details: "Comprehensive monthly deep cleaning to maintain pristine conditions",
        image: art("Monthly Full Clean", "Monthly deep pristine reset", "✨", ["#06b6d4", "#14b8a6"]),
        price: 4500,
      },
    ],
  },
] as const;

const bookingSchema = z.object({
  fullName: z.string().trim().min(1, "Please enter your full name"),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter your phone number")
    .transform((value) => value.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^(?:\+254|0)(?:7|1)\d{8}$/, "Please enter your phone number")),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().trim().min(1, "Please enter your Nairobi address"),
  propertyType: z.enum(PROPERTY_TYPES, { message: "Please select your property type" }),
  propertySize: z.enum(PROPERTY_SIZES, { message: "Please select your property size" }),
  preferredDate: z.string().min(1, "Please select your preferred date"),
  preferredTime: z.enum(PREFERRED_TIMES, { message: "Please select your preferred time" }),
  frequency: z.enum(BOOKING_FREQUENCIES, { message: "Please select booking frequency" }),
  notes: z.string().optional(),
});

type BookingForm = z.infer<typeof bookingSchema>;

interface ServiceItem {
  name: string;
  desc: string;
  details: string;
  image: string;
  price: number;
  perUnit?: boolean;
}

const requiredFields = [
  "fullName",
  "phone",
  "address",
  "propertyType",
  "propertySize",
  "preferredDate",
  "preferredTime",
  "frequency",
] as const;

export default function BookingPage() {
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const {
    register,
    handleSubmit,
    control,
    setFocus,
    watch,
    formState: { errors },
  } = useForm<BookingForm>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      email: "",
      address: "",
      propertyType: "" as BookingForm["propertyType"],
      propertySize: "" as BookingForm["propertySize"],
      preferredDate: "",
      preferredTime: "" as BookingForm["preferredTime"],
      frequency: "" as BookingForm["frequency"],
      notes: "",
    },
  });

  const totalPrice = selectedService ? selectedService.price * quantity : 0;
  const watchedValues = watch(requiredFields);
  const isBookingReady = watchedValues.every((value) => typeof value === "string" ? value.trim().length > 0 : Boolean(value));

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, cardId: string) => {
    if (hoveredCard !== cardId) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const rotationX = ((y - rect.height / 2) / rect.height) * 10;
    const rotationY = ((x - rect.width / 2) / rect.width) * -10;

    setRotation({ x: rotationX, y: rotationY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setHoveredCard(null);
  };

  const onInvalid = (fieldErrors: typeof errors) => {
    for (const field of requiredFields) {
      if (fieldErrors[field]) {
        setTimeout(() => setFocus(field), 0);
        break;
      }
    }
  };

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

      localStorage.setItem("lastBookingRef", result.bookingRef);
      localStorage.setItem("lastBookingData", JSON.stringify({
        name: data.fullName,
        phone: data.phone,
        service: selectedService.name,
        date: data.preferredDate,
        time: data.preferredTime,
        totalPrice,
      }));

      toast.success("Booking submitted! Redirecting...");
      setTimeout(() => navigate("/book/confirm"), 500);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create booking");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-900 to-slate-950 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000" />
      </div>

      <div className="relative z-10">
        <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-b border-blue-500/20 py-4 backdrop-blur-md sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-300">
              <Phone className="w-5 h-5 animate-pulse" />
              <span className="font-semibold">📞 0768 362 805</span>
            </div>
            <div className="text-sm text-blue-200">✨ Professional Cleaning Services Across Nairobi</div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-16">
          {!showForm ? (
            <>
              <div className="text-center mb-20">
                <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6 backdrop-blur-md">
                  <Sparkles className="w-4 h-4 text-blue-300" />
                  <span className="text-blue-200 text-sm font-medium">Premium Cleaning Excellence</span>
                </div>
                <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-200 via-blue-100 to-purple-200 bg-clip-text text-transparent mb-4">
                  SparkleClean Kenya
                </h1>
                <p className="text-xl text-blue-200/80 max-w-2xl mx-auto mb-2">
                  Choose from our premium cleaning services designed to transform your space
                </p>
                <p className="text-sm text-blue-300/60">Select a service below to get started with your booking</p>
              </div>

              <div className="space-y-16">
                {SERVICE_DETAILS.map((category) => (
                  <div key={category.category} className="group">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="text-4xl">{category.icon}</span>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-1">{category.category}</h2>
                        <div className={`h-1 w-20 bg-gradient-to-r ${category.color} rounded-full`} />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {category.items.map((service, idx) => (
                        <div
                          key={service.name}
                          onMouseEnter={() => setHoveredCard(`${category.category}-${idx}`)}
                          onMouseMove={(e) => handleMouseMove(e, `${category.category}-${idx}`)}
                          onMouseLeave={handleMouseLeave}
                          onClick={() => {
                            setSelectedService(service);
                            setQuantity(1);
                            setShowForm(true);
                          }}
                          style={{
                            transform: hoveredCard === `${category.category}-${idx}`
                              ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(20px)`
                              : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)",
                            transition: hoveredCard !== `${category.category}-${idx}` ? "transform 0.3s ease-out" : "none",
                          }}
                          className="group/card relative cursor-pointer"
                        >
                          <Card className="h-full bg-gradient-to-br from-white/5 via-white/[0.02] to-white/0 border border-white/10 hover:border-blue-500/50 overflow-hidden transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20">
                            <div className="relative h-48 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
                              <img
                                src={service.image}
                                alt={service.name}
                                className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                              <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
                                <Star className="w-3 h-3 text-yellow-200 fill-yellow-200" />
                                <span className="text-xs font-semibold text-yellow-200">5.0</span>
                              </div>
                            </div>

                            <div className="p-6">
                              <h3 className="text-lg font-bold text-white mb-2 group-hover/card:text-blue-200 transition-colors">
                                {service.name}
                              </h3>
                              <p className="text-sm text-blue-200/70 mb-4">{service.desc}</p>
                              <p className="text-xs text-white/60 mb-4 leading-relaxed line-clamp-2">
                                {service.details}
                              </p>
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-white/50">Starting from</p>
                                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                                    KSh {service.price.toLocaleString()}
                                  </p>
                                </div>
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center group-hover/card:scale-110 transition-transform">
                                  <ArrowRight className="w-5 h-5 text-white" />
                                </div>
                              </div>
                            </div>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-8">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowForm(false)}
                  className="text-blue-300 hover:text-blue-200 mb-4"
                >
                  ← Back to Services
                </Button>
                <h2 className="text-4xl font-bold text-white mb-2">Complete Your Booking</h2>
                {selectedService && (
                  <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 backdrop-blur-md mt-4">
                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                    <span className="text-blue-200 text-sm">
                      {selectedService.name} • KSh {totalPrice.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <Card className="bg-gradient-to-br from-white/5 via-white/[0.02] to-white/0 border border-white/10 backdrop-blur-md p-8">
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
                  <div>
                    <Label className="text-white/90 font-semibold">Full Name *</Label>
                    <Input
                      placeholder="Your Name"
                      {...register("fullName")}
                      className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                    {errors.fullName && <p className="text-red-400 text-sm mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white/90 font-semibold">Phone Number *</Label>
                      <Input
                        placeholder="+254 7XX XXX XXX"
                        inputMode="tel"
                        {...register("phone")}
                        className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                      {errors.phone && <p className="text-red-400 text-sm mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <Label className="text-white/90 font-semibold">Email (Optional)</Label>
                      <Input
                        type="email"
                        placeholder="youremail@example.com"
                        {...register("email")}
                        className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/90 font-semibold">Address *</Label>
                    <Input
                      placeholder="e.g., Westlands, Nairobi"
                      {...register("address")}
                      className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                    {errors.address && <p className="text-red-400 text-sm mt-1">{errors.address.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white/90 font-semibold">Property Type *</Label>
                      <Controller
                        name="propertyType"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-white/15 text-white">
                              {PROPERTY_TYPES.map((option) => (
                                <SelectItem key={option} value={option} className="text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white">
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.propertyType && <p className="text-red-400 text-sm mt-1">{errors.propertyType.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90 font-semibold">Property Size *</Label>
                      <Controller
                        name="propertySize"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder="Select property size" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-white/15 text-white">
                              {PROPERTY_SIZES.map((option) => (
                                <SelectItem key={option} value={option} className="text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white">
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.propertySize && <p className="text-red-400 text-sm mt-1">{errors.propertySize.message}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label className="text-white/90 font-semibold">Preferred Date *</Label>
                      <Input
                        type="date"
                        min={today}
                        {...register("preferredDate")}
                        className="mt-2 bg-white/5 border-white/20 text-white"
                      />
                      {errors.preferredDate && <p className="text-red-400 text-sm mt-1">{errors.preferredDate.message}</p>}
                    </div>

                    <div>
                      <Label className="text-white/90 font-semibold">Preferred Time *</Label>
                      <Controller
                        name="preferredTime"
                        control={control}
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
                              <SelectValue placeholder="Select preferred time" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-950 border-white/15 text-white">
                              {PREFERRED_TIMES.map((option) => (
                                <SelectItem key={option} value={option} className="text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white">
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.preferredTime && <p className="text-red-400 text-sm mt-1">{errors.preferredTime.message}</p>}
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/90 font-semibold">Booking Frequency *</Label>
                    <Controller
                      name="frequency"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="mt-2 bg-white/5 border-white/20 text-white">
                            <SelectValue placeholder="Select booking frequency" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-950 border-white/15 text-white">
                            {BOOKING_FREQUENCIES.map((option) => (
                              <SelectItem key={option} value={option} className="text-white data-[highlighted]:bg-white/10 data-[highlighted]:text-white">
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.frequency && <p className="text-red-400 text-sm mt-1">{errors.frequency.message}</p>}
                  </div>

                  <div>
                    <Label className="text-white/90 font-semibold">Special Instructions (Optional)</Label>
                    <Textarea
                      placeholder="Tell us about any special requirements..."
                      {...register("notes")}
                      className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                  </div>

                  {selectedService?.perUnit && (
                    <div>
                      <Label className="text-white/90 font-semibold">Quantity *</Label>
                      <div className="flex items-center gap-4 mt-2">
                        <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="border-white/20 text-white">
                          −
                        </Button>
                        <span className="text-2xl font-bold text-blue-300 w-8 text-center">{quantity}</span>
                        <Button type="button" variant="outline" size="sm" onClick={() => setQuantity(Math.min(20, quantity + 1))} className="border-white/20 text-white">
                          +
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-lg p-6 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white/70">Service</span>
                      <span className="text-white font-medium">KSh {selectedService?.price.toLocaleString()}</span>
                    </div>
                    {selectedService?.perUnit && quantity > 1 && (
                      <div className="flex justify-between items-center mb-2 text-sm text-white/60">
                        <span>× {quantity}</span>
                      </div>
                    )}
                    <div className="border-t border-blue-500/20 pt-2 flex justify-between items-center">
                      <span className="text-white font-semibold">Total Amount</span>
                      <span className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                        KSh {totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={loading || !isBookingReady}
                    className="w-full h-12 font-semibold text-base bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </form>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
