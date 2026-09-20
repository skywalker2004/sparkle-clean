import React, { useMemo, useState } from "react";
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

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=85&auto=format&fit=crop";

// Image URLs are now resolved via backend Unsplash proxy using per-service keywords.

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
        imageKeyword: "standard house interior cleaning",
        price: 2500,
      },
      {
        name: "Deep House Clean",
        desc: "Thorough top-to-bottom cleaning",
        details: "Intensive deep cleaning including baseboards, light fixtures, inside cabinets, deep carpet shampooing, and tile grout cleaning",
        imageKeyword: "deep house deep cleaning",
        price: 5500,
      },
      {
        name: "Move-In Cleaning",
        desc: "Before you settle in",
        details: "Complete property sanitization before moving in, including wall cleaning, cabinet sanitization, and deep appliance cleaning",
        imageKeyword: "move in cleaning empty apartment",
        price: 7000,
      },
      {
        name: "Move-Out Cleaning",
        desc: "Leave it spotless",
        details: "Full property restoration cleaning after vacating, ensuring all surfaces are impeccable for the next tenant",
        imageKeyword: "move out cleaning empty property",
        price: 7000,
      },
      {
        name: "Post-Construction Clean",
        desc: "Remove all dust and debris",
        details: "Specialized cleaning to remove construction dust, debris, and polish all surfaces for final finishing",
        imageKeyword: "post construction cleanup site",
        price: 12000,
      },
      {
        name: "After-Party Clean",
        desc: "Party cleanup services",
        details: "Professional post-event cleanup including floor cleaning, trash removal, and full restoration",
        imageKeyword: "post party cleanup floor trash",
        price: 4500,
      },
      {
        name: "Spring/Seasonal Clean",
        desc: "Refresh your home seasonally",
        details: "Full seasonal refresh including window cleaning, ceiling fans, and deep carpet cleaning",
        imageKeyword: "seasonal deep home cleaning",
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
        imageKeyword: "clean kitchen countertop interior",
        price: 2000,
      },
      {
        name: "Bathroom Deep Clean",
        desc: "Per bathroom",
        details: "Tile scrubbing, fixture polishing, grout cleaning, and disinfection of all surfaces",
        imageKeyword: "deep bathroom tile grout cleaning",
        price: 1500,
        perUnit: true,
      },
      {
        name: "Bedroom Clean",
        desc: "Per bedroom",
        details: "Dusting, vacuuming, bed cleaning, and comprehensive surface disinfection",
        imageKeyword: "bedroom tidy bed made clean",
        price: 1200,
        perUnit: true,
      },
      {
        name: "Living Room Clean",
        desc: "Full living room refresh",
        details: "Complete living area cleaning including upholstery care, floor treatment, and dust removal",
        imageKeyword: "living room upholstery clean sofa",
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
        imageKeyword: "vacuum cleaning carpet room",
        price: 1800,
        perUnit: true,
      },
      {
        name: "Sofa/Couch Cleaning (2-seater)",
        desc: "2-seater couch",
        details: "Professional upholstery cleaning with fabric protection treatment",
        imageKeyword: "two seater sofa upholstery cleaning",
        price: 2500,
      },
      {
        name: "Sofa/Couch Cleaning (3-seater)",
        desc: "3-seater couch",
        details: "Deep upholstery restoration including stain treatment and deodorization",
        imageKeyword: "three seater couch cleaning",
        price: 3500,
      },
      {
        name: "Mattress Cleaning (single)",
        desc: "Single mattress",
        details: "Dust mite elimination, stain removal, and complete sanitization",
        imageKeyword: "single mattress deep clean",
        price: 1500,
      },
      {
        name: "Mattress Cleaning (double/king)",
        desc: "Double/king mattress",
        details: "Professional deep cleaning with allergen and dust removal",
        imageKeyword: "double mattress deep cleaning",
        price: 2000,
      },
      {
        name: "Rug Cleaning",
        desc: "Standard rug",
        details: "Specialized rug cleaning with fabric-specific treatment",
        imageKeyword: "rug cleaning area rug carpet",
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
        imageKeyword: "small office interior cleaning desk",
        price: 4000,
      },
      {
        name: "Office Clean (medium, 50-150sqm)",
        desc: "Medium office space",
        details: "Comprehensive office cleaning including conference rooms and common areas",
        imageKeyword: "office workspace cleaning medium sized",
        price: 8000,
      },
      {
        name: "Office Clean (large, 150sqm+)",
        desc: "Large office space",
        details: "Full-scale office sanitization with specialized equipment and multiple cleaners",
        imageKeyword: "commercial office cleaning large space",
        price: 15000,
      },
      {
        name: "Retail Shop Clean",
        desc: "Retail space cleaning",
        details: "Display cleaning, floor care, and customer area sanitization",
        imageKeyword: "retail shop floor cleaning display",
        price: 5000,
      },
      {
        name: "Restaurant/Café Clean",
        desc: "Food service establishment",
        details: "Health-code compliant cleaning including kitchen deep clean and dining area",
        imageKeyword: "restaurant kitchen dining area clean",
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
        imageKeyword: "cleaning window glass indoor",
        price: 150,
        perUnit: true,
      },
      {
        name: "Window Cleaning (interior + exterior)",
        desc: "Per window",
        details: "Complete window cleaning including frames and sills",
        imageKeyword: "window washer exterior building",
        price: 250,
        perUnit: true,
      },
      {
        name: "Ceiling and Wall Wash",
        desc: "Full cleaning",
        details: "Spider web removal, stain treatment, and wall restoration",
        imageKeyword: "white ceiling wall interior clean",
        price: 3000,
      },
      {
        name: "Tile and Grout Deep Clean",
        desc: "Complete tile cleaning",
        details: "Professional grout restoration and tile polishing with anti-bacterial treatment",
        imageKeyword: "tile grout deep cleaning floor",
        price: 2500,
      },
      {
        name: "Fridge/Freezer Clean",
        desc: "Deep appliance clean",
        details: "Interior and exterior cleaning with sanitization and deodorization",
        imageKeyword: "clean fridge interior appliance",
        price: 1000,
      },
      {
        name: "Oven Deep Clean",
        desc: "Complete oven cleaning",
        details: "Interior and exterior oven restoration with chemical-free methods",
        imageKeyword: "clean oven interior kitchen appliance",
        price: 1500,
      },
      {
        name: "Pressure Washing",
        desc: "Per area",
        details: "High-pressure cleaning for driveways, patios, and exterior surfaces",
        imageKeyword: "pressure washing driveway concrete",
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
        imageKeyword: "weekly home maintenance cleaning visit",
        price: 2000,
      },
      {
        name: "Biweekly Maintenance Clean",
        desc: "Per visit",
        details: "Twice monthly maintenance cleaning service",
        imageKeyword: "biweekly home cleaning service visit",
        price: 2500,
      },
      {
        name: "Monthly Full Clean",
        desc: "Per visit",
        details: "Comprehensive monthly deep cleaning to maintain pristine conditions",
        imageKeyword: "monthly full deep cleaning service",
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
    .min(10, "Please enter your phone number")
    .transform((value) => value.replace(/\s+/g, ""))
    .pipe(z.string().regex(/^(\+?254|0)(?:7|1)\d{8}$/, "Please enter your phone number")),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().trim().min(1, "Please enter your Nairobi address"),
  propertyType: z.enum(PROPERTY_TYPES, { message: "Please select your property type" }),
  propertySize: z.enum(PROPERTY_SIZES, { message: "Please select your property size" }),
  preferredDate: z.string().min(1, "Please select your preferred date"),
  preferredTime: z.enum(PREFERRED_TIMES, { message: "Please select your preferred time" }),
  frequency: z.enum(BOOKING_FREQUENCIES, { message: "Please select booking frequency" }),
  preferredContactMethod: z.enum(["email", "whatsapp"]),
  notes: z.string().optional(),
}).superRefine((val, ctx) => {
  if (val.preferredContactMethod === "email") {
    if (!val.email || (typeof val.email === "string" && val.email.trim() === "")) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please enter your email address", path: ["email"] });
    }
  }
});

type BookingForm = z.infer<typeof bookingSchema>;

interface ServiceItem {
  name: string;
  desc: string;
  details: string;
  imageKeyword: string;
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

  function ServiceImage({ keyword, alt }: { keyword: string; alt: string }) {
    const [resolved, setResolved] = useState<{ imageUrl: string; photographerName?: string | null; photographerLink?: string | null } | null>(null);
    const [loadingImage, setLoadingImage] = useState(true);

    React.useEffect(() => {
      let cancelled = false;
      const fetchImage = async () => {
        setLoadingImage(true);
        try {
          const res = await fetch(`http://localhost:5000/api/images/service-image?keyword=${encodeURIComponent(keyword)}`);
          if (!res.ok) throw new Error('image fetch failed');
          const data = await res.json();
          if (!cancelled) setResolved({ imageUrl: data.imageUrl, photographerName: data.photographerName, photographerLink: data.photographerLink });
        } catch (e) {
          if (!cancelled) setResolved({ imageUrl: FALLBACK_IMAGE, photographerName: null, photographerLink: null });
        } finally {
          if (!cancelled) setLoadingImage(false);
        }
      };
      fetchImage();
      return () => { cancelled = true; };
    }, [keyword]);

    return (
      <div className="relative h-56 shrink-0 overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900">
        {loadingImage ? (
          <div className="h-full w-full bg-slate-800 animate-pulse" />
        ) : (
          <>
            <img
              src={resolved?.imageUrl || FALLBACK_IMAGE}
              alt={alt}
              loading="lazy"
              onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGE; }}
              className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-110"
            />
            {resolved?.photographerName && (
              <div className="absolute left-3 bottom-3 text-xs text-white/60 bg-black/30 px-2 py-1 rounded">
                Photo: <a href={resolved.photographerLink || '#'} className="underline" target="_blank" rel="noreferrer noopener">{resolved.photographerName}</a> / Unsplash
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </>
        )}
      </div>
    );
  }

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
        preferredContactMethod: "email",
        notes: "",
    },
  });

  const preferredContactMethod = watch("preferredContactMethod");

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
        preferredContactMethod: data.preferredContactMethod,
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
        preferredContactMethod: data.preferredContactMethod,
        bookingRef: result.bookingRef,
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
                            try {
                              localStorage.setItem("sparkle_selected_services", JSON.stringify([{ name: service.name, price: service.price }]));
                            } catch {}
                            setQuantity(1);
                            setShowForm(true);
                          }}
                          style={{
                            transform: hoveredCard === `${category.category}-${idx}`
                              ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) translateZ(20px)`
                              : "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)",
                            transition: hoveredCard !== `${category.category}-${idx}` ? "transform 0.3s ease-out" : "none",
                          }}
                          className="group/card relative h-full cursor-pointer"
                        >
                          <Card className="h-full flex flex-col overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 via-white/[0.02] to-white/0 transition-all duration-300 hover:border-blue-500/50 hover:shadow-2xl hover:shadow-blue-500/20">
                            <ServiceImage keyword={service.imageKeyword} alt={service.name} />
                            <div className="absolute top-3 right-3 bg-yellow-500/90 backdrop-blur-md rounded-full px-3 py-1 flex items-center gap-1">
                              <Star className="w-3 h-3 fill-yellow-200 text-yellow-200" />
                              <span className="text-xs font-semibold text-yellow-200">5.0</span>
                            </div>

                            <div className="flex flex-1 flex-col p-6">
                              <h3 className="mb-2 text-lg font-bold text-white transition-colors group-hover/card:text-blue-200">
                                {service.name}
                              </h3>
                              <p className="mb-4 text-sm text-blue-200/70">{service.desc}</p>
                              <p className="mb-4 text-xs leading-relaxed text-white/60 line-clamp-2">
                                {service.details}
                              </p>
                              <div className="mt-auto flex items-center justify-between">
                                <div>
                                  <p className="text-xs text-white/50">Starting from</p>
                                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">
                                    KSh {service.price.toLocaleString()}
                                  </p>
                                </div>
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-transform group-hover/card:scale-110">
                                  <ArrowRight className="h-5 w-5 text-white" />
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
                      <Label className="text-white/90 font-semibold">Preferred Contact Method *</Label>
                      <Controller
                        name="preferredContactMethod"
                        control={control}
                        render={({ field }) => (
                          <div role="radiogroup" aria-label="Preferred contact method" className="mt-2 flex gap-3">
                            <button
                              type="button"
                              role="radio"
                              aria-checked={field.value === "email"}
                              onClick={() => field.onChange("email")}
                              className={`w-1/2 p-3 rounded-lg text-left transition-shadow ${field.value === "email" ? "border-2 border-blue-500 bg-white/5" : "border border-white/10 bg-white/2"}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-semibold">📧 Email</div>
                                  <div className="text-xs text-white/60">We'll email your booking confirmation</div>
                                </div>
                                {field.value === "email" && <div className="text-blue-400">✓</div>}
                              </div>
                            </button>
                            <button
                              type="button"
                              role="radio"
                              aria-checked={field.value === "whatsapp"}
                              onClick={() => field.onChange("whatsapp")}
                              className={`w-1/2 p-3 rounded-lg text-left transition-shadow ${field.value === "whatsapp" ? "border-2 border-emerald-500 bg-white/5" : "border border-white/10 bg-white/2"}`}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-semibold">💬 WhatsApp</div>
                                  <div className="text-xs text-white/60">We'll message you on WhatsApp instantly</div>
                                </div>
                                {field.value === "whatsapp" && <div className="text-emerald-400">✓</div>}
                              </div>
                            </button>
                          </div>
                        )}
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-white/90 font-semibold">{preferredContactMethod === "whatsapp" ? "Email Address (optional)" : "Email Address *"}</Label>
                    <Input
                      type="email"
                      placeholder="youremail@example.com"
                      {...register("email")}
                      className="mt-2 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                    />
                    {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>}
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
                            <SelectContent>
                              {PROPERTY_TYPES.map((option) => (
                                <SelectItem key={option} value={option}>
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
                            <SelectContent>
                              {PROPERTY_SIZES.map((option) => (
                                <SelectItem key={option} value={option}>
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
                            <SelectContent>
                              {PREFERRED_TIMES.map((option) => (
                                <SelectItem key={option} value={option}>
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
                          <SelectContent>
                            {BOOKING_FREQUENCIES.map((option) => (
                              <SelectItem key={option} value={option}>
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
