# DineOS

DineOS is a robust, real-time hospitality operating system built to demonstrate modern web architecture and decentralized, multi-tenant synchronization for restaurants. 

Designed with a strict, high-performance luxury monochrome aesthetic, the platform unifies the entire restaurant lifecycle—from the waiter's order pad to the kitchen display, cashier terminal, and manager's analytics dashboard—in milliseconds.

## 🚀 Core Capabilities

### 1. Unified Multi-Surface Terminals

**Waiter Module:** An interactive floorplan grid with real-time table statuses (Free, Occupied, Paid). Features a complex catalog cart supporting item-level modifiers and instantaneous order firing.

**Kitchen Display System (KDS):** A high-contrast, real-time ticket board. Kitchen staff can track item-level prep statuses (New, Preparing, Ready, Completed) with live timers and bump logic to optimize throughput.

**Cashier Terminal:** Active ticket tracking with advanced bill-splitting logic (support for equal division and complex custom guest contributions), complete with a dynamic Z-Report generation engine for end-of-day analytics.

**Manager Dashboard:** A global control center featuring revenue charts, live cross-outlet metric cards, menu inventory management, and one-click remote discount/void approvals.

### 2. Instantaneous Decentralized Sync

**Zero-Latency Floor Operations:** Built entirely on WebSockets, DineOS ensures that when a waiter fires an order, it appears on the KDS and Cashier screens in milliseconds—eliminating the need for fragile, centralized local servers.

**Robust Data Integrity:** All transactions and state changes are strictly typed and persisted to a normalized relational database, preventing lost tickets and ensuring accurate historical financial reporting.

## 🏗️ Technical Architecture

DineOS is built on a modern, highly scalable edge architecture:

- **Framework:** Next.js (App Router) for optimized routing, client components, and server-side execution.
- **Language:** Strict TypeScript for end-to-end type safety, rigorous interface boundaries, and rapid refactoring.
- **Styling:** Tailwind CSS running a bespoke monochrome luxury design system (Black `#0A0A0A`, Pearl `#FAF9F6`, Gold `#C5A880`).
- **Animation:** Framer Motion for hardware-accelerated micro-interactions, layout transitions, and AnimatePresence modals. `NumberFlow` is utilized for premium typographic number ticking.
- **Database:** Supabase (PostgreSQL) for rigorous relational data modeling (handling the Organizations -> Properties -> Outlets multi-tenant hierarchy).
- **Real-Time Sync:** Supabase Realtime (WebSockets) for instantaneous state distribution across all active terminals.

## 🎨 Design System Constraints

DineOS enforces a strict Luxury Monochrome aesthetic. If you are contributing, adhere strictly to the following UI rules:

- **No Rogue Colors:** The UI relies entirely on the bespoke palette. Do not introduce arbitrary HEX or RGB values, gradients, or default Tailwind accent colors (no blue, indigo, red, etc. unless explicitly for destructive states).
- **Typography:** Garamond / Libre Baskerville is strictly reserved for high-level headings and premium data visualization. Inter/Sans is used for dense UI elements and standard data.
- **Motion:** Animations must be purposeful. Default to spring physics for interactive elements (`stiffness: 400`, `damping: 30`). Only animate `transform` and `opacity` to prevent main-thread layout thrashing.

---

## 📝 TODO: Feature Roadmap

The foundational schema perfectly supports multi-tenant scaling. The following features are slated for development to elevate DineOS into an enterprise-grade platform:

- [ ] **Manager Outlet Switcher:** Create a new path/dropdown in the `SurfaceHeader` for managers to create and seamlessly switch between outlets. Hook this into global Zustand state to dynamically filter all dashboard metrics, charts, and tables by `outlet_id`.
- [ ] **Kitchen Performance Analytics (KDS Metrics):** Utilize the `fired_at` and `bumped_at` timestamps in `order_items` to calculate Average Ticket Time (ATT) and identify kitchen bottlenecks.
- [ ] **Table Turnaround & Occupancy Rates:** Leverage `orders.created_at` and `closed_at` to build heat-maps showing peak occupancy hours and average table turnaround times.
- [ ] **Modifier & Upsell Analytics:** Aggregate the `JSONB` modifier data to report on popular add-ons (e.g., "Extra Cheese"), helping management optimize pricing.
- [ ] **Waiter Performance Tracking:** Add `waiter_id UUID REFERENCES users(id)` to the `orders` table to build a "Top Performing Staff" leaderboard.
- [ ] **Soft Deletes (Archival System):** Add an `is_active` boolean to `tables` and `menu_items` to allow managers to safely archive entities without violating PostgreSQL foreign key constraints on historical orders.
- [ ] **Discount & Void Audit Logs:** Expand the approval schema to track `discount_amount` and `void_reason` to provide a digital paper trail for loss prevention.

---

## 👨‍💻 Developer

**Shaik Raiyan** > Software Engineer

🌐 **Portfolio:** [http://shaikraiyan.me/](http://shaikraiyan.me/)

🔗 **LinkedIn:** [https://www.linkedin.com/in/shaik-raiyan](https://www.linkedin.com/in/shaik-raiyan)

🐙 **GitHub:** [https://github.com/SHAIK-RAIYAN](https://github.com/SHAIK-RAIYAN)
