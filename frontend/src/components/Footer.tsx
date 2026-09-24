import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { formatWhatsAppNumber } from "@/lib/utils";

// TODO: Replace REPLACE_WITH_REAL_HANDLE placeholders with verified SparkleClean Kenya handles.
const SOCIAL_LINKS = {
  facebook: "https://facebook.com/REPLACE_WITH_REAL_HANDLE",
  instagram: "https://instagram.com/REPLACE_WITH_REAL_HANDLE",
  tiktok: "https://tiktok.com/@REPLACE_WITH_REAL_HANDLE",
  twitter: "https://x.com/REPLACE_WITH_REAL_HANDLE",
  linkedin: "https://linkedin.com/company/REPLACE_WITH_REAL_HANDLE",
  youtube: "https://youtube.com/@REPLACE_WITH_REAL_HANDLE",
  whatsapp: `https://wa.me/${formatWhatsAppNumber("0768362805")}`,
};

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" width="20" height="20" className={className} aria-hidden>
      <path fill="currentColor" d="M213.3 88.7c-9.6-4.6-20.6-7.2-32-7.2v44.7c0 24.1-19.6 43.7-43.7 43.7-24.1 0-43.7-19.6-43.7-43.7 0-24.1 19.6-43.7 43.7-43.7 6.9 0 13.4 1.7 19.1 4.7V40.9h36.9c0 0 .1 47.8 23.7 47.8v0z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07C2 17.06 5.66 21.13 10.44 21.95v-6.99H7.9v-2.89h2.54V9.41c0-2.5 1.49-3.88 3.77-3.88 1.09 0 2.23.2 2.23.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.89h-2.34v6.99C18.34 21.13 22 17.06 22 12.07z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53A4.48 4.48 0 0 0 22.4.36a9.08 9.08 0 0 1-2.88 1.1A4.52 4.52 0 0 0 12.07 4.5V6A12.86 12.86 0 0 1 3 4s-4 9 5 13a13 13 0 0 1-8 2c9 5 20 0 20-11.5 0-.2 0-.39-.02-.58A7.72 7.72 0 0 0 23 3z" />
    </svg>
  );
}

function LinkedinIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM0 8h5v16H0zM9 8h4.8v2.2h.1c.7-1.2 2.4-2.6 4.9-2.6C23.2 7.6 24 10 24 13.8V24h-5V14.6c0-2.2-.04-5-3-5s-3.5 2.3-3.5 4.8V24H9V8z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M23.5 6.2s-.2-1.6-.8-2.3c-.8-.9-1.7-.9-2.1-1C16.9 2.5 12 2.5 12 2.5h-.1s-4.9 0-8.5.4c-.4 0-1.3 0-2.1 1-.6.7-.8 2.3-.8 2.3S0 8 0 9.8v1.5C0 13 0 14.8 0 14.8s.2 1.6.8 2.3c.8.9 1.9.9 2.4 1 1.7.2 7.3.4 7.3.4s4.9 0 8.5-.4c.4 0 1.3 0 2.1-1 .6-.7.8-2.3.8-2.3s.2-1.9.2-3.7v-1.5c0-1.8-.2-3.7-.2-3.7zM9.8 15.6V8.4l6.2 3.6-6.2 3.6z" />
    </svg>
  );
}

export default function Footer() {
  const year = new Date().getFullYear();

  const iconBase = "w-10 h-10 rounded-full flex items-center justify-center bg-white/10 text-white transition transform hover:scale-110 hover:bg-emerald-500 duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400";

  return (
    <footer className="bg-[#071020] text-slate-200 border-t border-white/6">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                  <path d="M3 3l18 18" stroke="currentColor" strokeWidth="0" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-white">SparkleClean Kenya</div>
                <div className="text-sm text-slate-300">Premium Home & Office Cleaning Services in Nairobi</div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" aria-label="Follow SparkleClean Kenya on Facebook" className={iconBase}>
                <FacebookIcon />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" aria-label="Follow SparkleClean Kenya on Instagram" className={iconBase}>
                <InstagramIcon />
              </a>
              <a href={SOCIAL_LINKS.tiktok} target="_blank" rel="noopener noreferrer" aria-label="Follow SparkleClean Kenya on TikTok" className={iconBase}>
                <TikTokIcon />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" aria-label="Follow SparkleClean Kenya on X (Twitter)" className={iconBase}>
                <XIcon />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" aria-label="Follow SparkleClean Kenya on LinkedIn" className={iconBase}>
                <LinkedinIcon />
              </a>
              <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noopener noreferrer" aria-label="Subscribe to SparkleClean Kenya on YouTube" className={iconBase}>
                <YoutubeIcon />
              </a>
              <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat with SparkleClean Kenya on WhatsApp" className={iconBase}>
                <MessageCircle size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link to="/book" className="text-slate-300 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">Book a Cleaning</Link></li>
              <li><Link to="/book" className="text-slate-300 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">Our Services</Link></li>
              <li><Link to="/login" className="text-slate-300 hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">Admin Login</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Contact</h3>
            <ul className="space-y-2 text-slate-300">
              <li>
                <a href={`tel:+254768362805`} aria-label="Call SparkleClean Kenya" className="hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">📞 0768 362 805</a>
              </li>
              <li>
                <a href={SOCIAL_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" aria-label="Chat with SparkleClean Kenya on WhatsApp" className="hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">💬 WhatsApp</a>
              </li>
              <li>
                <a href={`mailto:admin@sparkleclean.co.ke`} aria-label="Email SparkleClean Kenya" className="hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">📧 admin@sparkleclean.co.ke</a>
              </li>
              <li className="text-slate-400">📍 Nairobi, Kenya</li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-3">Business Hours</h3>
            <ul className="space-y-2 text-slate-300">
              <li>Monday – Saturday: 8:00 AM – 8:00 PM</li>
              <li>Sunday: 9:00 AM – 5:00 PM</li>
              <li>Emergency bookings available on request</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/6">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row items-center justify-between text-slate-400 text-sm gap-3">
          <div>© {year} SparkleClean Kenya. All rights reserved.</div>
          <div className="flex items-center gap-4">
            {/* TODO: Create Privacy Policy and Terms pages and replace href="#" */}
            <a href="#" className="hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">Privacy Policy</a>
            <a href="#" className="hover:text-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 rounded">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
