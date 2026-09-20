import React from "react";
import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { formatWhatsAppNumber } from "@/lib/utils";

const WA_NUMBER = "254768362805";
const DEFAULT_MESSAGE = "Hi SparkleClean, I'd like to book a cleaning service.";

function buildMessage(selectedServices: { name: string; price: number }[] | null) {
  if (!selectedServices || selectedServices.length === 0) return DEFAULT_MESSAGE;
  const list = selectedServices.map((s) => `${s.name} (KSh ${s.price.toLocaleString()})`).join(", ");
  return `Hi SparkleClean, I'm interested in booking: ${list}. Please help me schedule this.`;
}

export default function WhatsAppFloatButton() {
  const location = useLocation();

  // Only render on public booking paths; this component is mounted inside PublicBookingRoute
  const onBookPage = location.pathname.startsWith("/book");

  // Read selected service(s) from localStorage where BookingPage writes selection
  let selected: { name: string; price: number }[] | null = null;
  try {
    const raw = localStorage.getItem("sparkle_selected_services");
    if (raw) selected = JSON.parse(raw);
  } catch (e) {
    selected = null;
  }

  const message = buildMessage(selected);
  const encoded = encodeURIComponent(message);
  const waLink = `https://wa.me/${WA_NUMBER}?text=${encoded}`;

  return (
    <a
      href={waLink}
      target="_blank"
      rel="noreferrer noopener"
      aria-label="Chat with us on WhatsApp"
      className={
        "fixed z-40 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-offset-2" +
        ""
      }
      style={{
        right: window.innerWidth <= 640 ? 16 : 24,
        bottom: window.innerWidth <= 640 ? 90 : 24,
      }}
    >
      <div
        className="relative"
        style={{ width: window.innerWidth <= 640 ? 52 : 60, height: window.innerWidth <= 640 ? 52 : 60 }}
      >
        <span
          aria-hidden
          className="absolute inset-0 rounded-full bg-[#25D366] opacity-70 animate-pulse-ring"
          style={{ boxShadow: "0 8px 24px rgba(37,211,102,0.18)" }}
        />
        <button
          type="button"
          onClick={() => {
            // noop: anchor handles navigation
          }}
          className="relative w-full h-full rounded-full bg-[#25D366] flex items-center justify-center shadow-xl transform transition-transform hover:scale-105"
        >
          <MessageCircle className="w-6 h-6 text-white" />
        </button>
      </div>
      <style>{`
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.6 }
          70% { transform: scale(1.8); opacity: 0 }
          100% { transform: scale(1.8); opacity: 0 }
        }
        .animate-pulse-ring {
          animation: pulseRing 3s infinite;
        }
      `}</style>
    </a>
  );
}
