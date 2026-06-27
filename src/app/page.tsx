import {
  ArrowRight,
  ChefHat,
  ChevronDown,
  Layers,
  MonitorSmartphone,
  Receipt,
  ShieldCheck,
  WifiOff,
  Zap
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function RootIndex() {
  return (
    <main className="min-h-screen bg-slate-50 selection:bg-indigo-500 selection:text-white font-sans overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex flex-col items-center justify-center pt-20 pb-12 overflow-hidden">
        {/* Background Image & Overlay */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/restaurant.jpg" 
            alt="DineOS Restaurant Atmosphere" 
            fill 
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-slate-900/95" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 backdrop-blur-md mb-8">
            <Zap className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold tracking-widest uppercase">The Next-Generation POS</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
            One Unified Platform.<br />
            <span className="text-transparent bg-clip-text bg-blue-400">
              Infinite Possibilities.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-2xl font-medium mb-10 leading-relaxed">
            DineOS is an elite, multi-tenant hospitality ecosystem. Connect your front-of-house, kitchen, cashier, and management in real-time with sub-second state propagation.
          </p>
          
          <a 
            href="#auth-portal" 
            className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl overflow-hidden transition-transform active:scale-95 shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.5)]"
          >
            <span className="relative z-10">Access System</span>
            <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-10 animate-bounce">
          <ChevronDown className="w-8 h-8 text-white/50" />
        </div>
      </section>

      {/* 2. Features / About Section */}
      <section className="py-24 bg-white relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">Built for Scale & Speed</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto">Experience a frictionless workflow where every surface shares the exact same live data layer without delay.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Zap className="w-7 h-7 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Real-Time Sync</h3>
              <p className="text-slate-600 leading-relaxed">
                An order fired on the Waiter app hits the Kitchen Display System in under one second. Perfect harmony across all interfaces.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-red-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <WifiOff className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Offline-First Resiliency</h3>
              <p className="text-slate-600 leading-relaxed">
                Lose WiFi? Keep taking orders. When the network returns, everything auto-syncs securely to the backend source of truth.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-xl transition-shadow group">
              <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Layers className="w-7 h-7 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Multi-Tenant Architecture</h3>
              <p className="text-slate-600 leading-relaxed">
                Manage multiple properties and outlets seamlessly. Different outlets see different menus, all controlled centrally.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Role Selection (Auth Portal) */}
      <section id="auth-portal" className="py-24 bg-slate-900 relative">
        <div className="absolute inset-0 z-0 opacity-20">
          <Image 
            src="/images/landscaper food.jpg" 
            alt="Food Background" 
            fill 
            className="object-cover object-center grayscale"
          />
        </div>
        
        <div className="relative z-10 px-6  mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">System Authentication</h2>
            <p className="text-slate-400 font-medium max-w-2xl mx-auto">Select your designated surface to enter the ecosystem. (Simulation Mode: No PIN required)</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Waiter Card */}
            <Link href="/waiter" className="group relative h-150 w-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-end">
              <div className="absolute inset-0 z-0">
                <Image src="/images/waiter.jpg" alt="Waiter Surface" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              </div>
              <div className="relative z-10 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center mb-4">
                  <MonitorSmartphone className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">Floor Waiter</h3>
                <p className="text-slate-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Take orders, manage tables, and fire tickets to the kitchen.
                </p>
              </div>
            </Link>

            {/* KDS Card */}
            <Link href="/kds" className="group relative h-150 w-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-end">
              <div className="absolute inset-0 z-0">
                <Image src="/images/Chef.jpg" alt="Kitchen Display" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              </div>
              <div className="relative z-10 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center mb-4">
                  <ChefHat className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">Kitchen Display</h3>
                <p className="text-slate-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Real-time ticket queue, bump orders, and modifier alerts.
                </p>
              </div>
            </Link>

            {/* Cashier Card */}
            <Link href="/cashier" className="group relative h-150 w-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-end">
              <div className="absolute inset-0 z-0">
                <Image src="/images/cashier.jpg" alt="Cashier Terminal" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
              </div>
              <div className="relative z-10 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center mb-4">
                  <Receipt className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">Cashier Desk</h3>
                <p className="text-slate-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Process payments, split bills, and compute Indian GST.
                </p>
              </div>
            </Link>

            {/* Manager Card */}
            <Link href="/manager" className="group relative h-150 w-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-end border border-white/10">
              <div className="absolute inset-0 z-0 overflow-hidden">
                <Image src="/images/manager.jpg" alt="Cashier Terminal" fill className="object-cover transition-transform duration-700 group-hover:scale-110" />
            
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000" />
              </div>
              <div className="relative z-10 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black text-white mb-1">Management</h3>
                <p className="text-slate-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                  Monitor live revenue, approve discounts, and control inventory.
                </p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* 4. Footer */}
      <footer className="bg-neutral-950 py-12 h-50 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-lg font-medium">
            © {new Date().getFullYear()} DineOS. Built for speed and reliability.
          </p>
          
          <div className="flex gap-4 text-lg font-bold text-slate-400">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-white cursor-pointer transition-colors">Support</span>
          </div>
        </div>
        
      </footer>
      <footer className=" bg-background overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center text-center">
          <div className="relative w-full  flex justify-center -mb-10 pointer-events-none select-none">
            <h1 className="text-[20vw] font-bold tracking-tighter leading-none text-transparent bg-clip-text bg-linear-to-b from-neutral-950 to-white ">
              Dine<span className="bg-clip-text bg-linear-to-t from-white to-neutral-950 font-sans">OS</span>
              
            </h1>
          </div>
        </div>
      </footer>

    </main>
  )
}