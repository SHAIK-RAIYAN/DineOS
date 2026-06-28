import { RevealText } from "@/components/UI/RevealText";
import ChefIcon from "../../../public/Icons/chef";
import { Globe, Mail, X } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer
      id="contact"
      className="bg-[#FAF9F6] text-[#0A0A0A] -mt-10 z-50 pt-32 pb-12 rounded-t-[3rem] relative z-30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-20 mb-32">
          <div>
            <h2 className="text-6xl border-b border-yellow-600 pb-5 font-garamond font-bold mb-8">
              Ready to elevate your service?
            </h2>
          </div>
          <div className="grid grid-cols-2 gap-10 font-sans">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-[#5A5A5A] uppercase tracking-widest text-xs mb-4">
                Connect
              </h4>
              <div className="flex gap-4">
                <a
                  href="mailto:shaikraiyan2005@gmail.com"
                  className="group flex items-center justify-center h-12 w-12 rounded-full border border-[#E5E5E5] hover:border-[#C5A880] hover:bg-[#C5A880]/5 transition-colors">
                  <Mail className="w-5 h-5 text-[#0A0A0A] group-hover:text-[#C5A880] transition-colors" />
                </a>

                <a
                  href="https://x.com/shaikraiyan2005"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center h-12 w-12 rounded-full border border-[#E5E5E5] hover:border-[#C5A880] hover:bg-[#C5A880]/5 transition-colors">
                  <X className="w-5 h-5 text-[#0A0A0A] group-hover:text-[#C5A880] transition-colors" />
                </a>

                <a
                  href="https://shaikraiyan.me/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center h-12 w-12 rounded-full border border-[#E5E5E5] hover:border-[#C5A880] hover:bg-[#C5A880]/5 transition-colors">
                  <Globe className="w-5 h-5 text-[#0A0A0A] group-hover:text-[#C5A880] transition-colors" />
                </a>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-[#5A5A5A] uppercase tracking-widest text-xs mb-4">
                Corporate
              </h4>
              <Link
                href="/about"
                className="hover:text-[#C5A880] transition-colors">
                <RevealText text="About" />
              </Link>
              <Link
                href="/investors"
                className="hover:text-[#C5A880] transition-colors">
                <RevealText text="Investors" />
              </Link>
              <Link
                href="/howtouse"
                className="hover:text-[#C5A880] transition-colors">
                <RevealText text="How to Use" />
              </Link>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-[#E5E5E5] pt-12">
          <h1 className="text-5xl flex items-center md:text-8xl font-garamond font-black tracking-tighter mb-6 md:mb-0">
            <ChefIcon className="size-20" />
            DINE<span className="text-[#C5A880]">OS</span>
          </h1>
          <p className="text-[#888888] font-sans text-sm">
            © {new Date().getFullYear()} DineOS Systems. Engineered for
            Excellence.
          </p>
        </div>
      </div>
    </footer>
  );
}
