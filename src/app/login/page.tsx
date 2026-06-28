import Link from "next/link";
import { ChefHat, MonitorDot, Receipt, UtensilsCrossed } from "lucide-react";
import ChefIcon from "../../../public/Icons/chef";

const roles = [
  {
    title: "Floor Waiter",
    description: "Take orders, manage tables, and fire tickets.",
    icon: <UtensilsCrossed className="w-8 h-8" />,
    href: "/waiter",
    color: "from-blue-500/20 to-blue-500/5",
    hoverColor: "group-hover:border-blue-500/50 group-hover:bg-blue-500/10",
  },
  {
    title: "Kitchen Display (KDS)",
    description: "Real-time order queue and ticket management.",
    icon: <ChefHat className="w-8 h-8" />,
    href: "/kds",
    color: "from-orange-500/20 to-orange-500/5",
    hoverColor: "group-hover:border-orange-500/50 group-hover:bg-orange-500/10",
  },
  {
    title: "Cashier Terminal",
    description: "Settle bills, split checks, and run reports.",
    icon: <Receipt className="w-8 h-8" />,
    href: "/cashier",
    color: "from-emerald-500/20 to-emerald-500/5",
    hoverColor: "group-hover:border-emerald-500/50 group-hover:bg-emerald-500/10",
  },
  {
    title: "Manager Dashboard",
    description: "Analytics, revenue tracking, and oversight.",
    icon: <MonitorDot className="w-8 h-8" />,
    href: "/manager",
    color: "from-purple-500/20 to-purple-500/5",
    hoverColor: "group-hover:border-purple-500/50 group-hover:bg-purple-500/10",
  },
];

export default function AuthPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C5A880]/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="z-10 w-full max-w-5xl space-y-12">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <ChefIcon className="w-16 h-16 text-[#C5A880]" />
          </div>
          <h1 className="text-5xl md:text-6xl font-garamond font-bold text-[#FAF9F6]">
            Select Your Workspace
          </h1>
          <p className="text-[#888888] text-lg max-w-xl mx-auto">
            Authentication is currently bypassed for demo purposes. Select a role below to launch the corresponding application surface.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Link
              key={role.href}
              href={role.href}
              className={`group flex flex-col items-center text-center p-8 rounded-3xl border border-[#222222] bg-[#111111]/80 backdrop-blur-sm transition-all duration-300 ${role.hoverColor} hover:-translate-y-2 hover:shadow-2xl`}
            >
              <div
                className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center bg-gradient-to-br ${role.color} border border-white/5 transition-colors text-white group-hover:text-white`}
              >
                {role.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-[#FAF9F6]">
                {role.title}
              </h3>
              <p className="text-sm text-[#888888] leading-relaxed">
                {role.description}
              </p>
              
              <div className="mt-6 px-6 py-2 rounded-full border border-[#333333] text-xs font-bold uppercase tracking-widest text-[#5A5A5A] group-hover:text-white group-hover:border-white/20 transition-colors">
                Launch
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center pt-8">
            <Link href="/" className="text-sm text-[#5A5A5A] hover:text-[#C5A880] transition-colors border-b border-transparent hover:border-[#C5A880] pb-0.5">
                ← Return to Landing Page
            </Link>
        </div>
      </div>
    </div>
  );
}
