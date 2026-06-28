# Agents Instructions for DineOS Project

## **1. Core Project Rules (Non-Negotiable)**

### **1.1 Language Requirements**

* **All code must be written in:** **TypeScript**
* **Strict Type Safety:**
* No `any` types or type assertions without documented justification.
* Utilize `unknown` for runtime validation boundaries.
* Leverage generics and narrow type guards over broad interfaces.


* **File naming conventions:**
* PascalCase for components (`MyComponent.tsx`)
* camelCase for utility functions and hooks (`myUtil.ts`, `useMotion.ts`)
* kebab-case for CSS modules/globals (`layout-grid.css`)



### **1.2 Framework Rules**

* **Framework:** Next.js (App Router exclusive)
* **Styling:** Tailwind CSS (Strictly flat colors, Shadcn UI base)
* **State Management:** Zustand (Isolate stores for granular re-renders)
* **API Layer:** Supabase (Client-side implementation)
* **Architecture Directory:** `app`, `src/components`, `src/lib`, `src/store`, `src/hooks`, `src/types`

### **1.3 UI/UX Standards (Strict Enforcement)**

* **Component Architecture:** Shadcn UI primitive abstractions. Do not diverge from established component APIs.
* **Design System (Monolithic & Flat):**
* **Primary:** `#000000` (Pure Black) or `#09090B` (Zinc-950)
* **Background:** `#FFFFFF` (Pure White)
* **Text (High Contrast):** `#09090B` (Zinc-950) for headings, `#52525B` (Zinc-500) for secondary prose.
* **Borders/Dividers:** `#E4E4E7` (Zinc-200)
* **Interactive States:** Solid color inversion or specific opacity shifts.
* **FORBIDDEN:** Gradients, drop-shadows (use solid hard shadows or flat borders), Indigo, Slate, Blue, or any default Tailwind accent colors.


* **Spatial System:** Base-8 layout grid (`0.5rem` increments). Padding and margins must adhere to scale.
* **Typography:**
* Font configurations must enforce strict tracking (letter-spacing) and leading (line-height) rules.
* Headers must be `-tracking-tight` with `leading-none` or `leading-tight`.


* **Accessibility (WCAG 2.1 AA):**
* Semantic DOM structure.
* ARIA labels mandated for all icon-only triggers.
* Focus states must be highly visible (e.g., `ring-2 ring-black ring-offset-2`).



### **1.4 Motion & Micro-interactions (New Paradigm)**

* **Engine:** Framer Motion (`framer-motion`)
* **Execution Rules:**
* **Zero Layout Thrashing:** Only animate `transform` (`x`, `y`, `scale`) and `opacity`. Never animate `width`, `height`, `top`, or `left`.
* **Hardware Acceleration:** Ensure `will-change-transform` or `pointer-events-none` on transitional layers to prevent main-thread blocking.
* **Physics over Durations:** Default to spring physics for interactive elements (buttons, modals).
* Example Spring: `stiffness: 400, damping: 30`.


* **Easing Functions:** When utilizing durations, linear easing is strictly prohibited. Utilize customized cubic-beziers (`easeOut` for enter, `easeIn` for exit).
* **Choreography:** Stagger children using `transition={{ staggerChildren: 0.05 }}` to establish directional flow.



### **1.5 Backend/Data Rules**

* **Database:** Supabase (PostgreSQL)
* **Data Modeling:** Schema changes require rigorous peer review and strict migration tracking in `supabase/migrations/`.
* **Security:**
* RLS (Row Level Security) is mandatory. Client SDKs must never bypass RLS.



### **1.6 API Rules**

* **Architecture:** RESTful standards via Next.js Route Handlers.
* **Response Format:** Strictly JSON (`application/json`).
* **Error Handling:** Expose structured HTTP status codes mapping to standard error types. Provide sanitized error payloads to the client.

### **1.7 Workflow Rules**

* **Atomic Commits:** Isolate logical changes.
* **Branching Strategy:**
* `feat/` for product increments
* `fix/` for defect resolution
* `refactor/` for architectural improvements



## **2. Project-Specific Configuration**

### **2.1 Next.js Configuration**

* **App Router:** Mandatory.
* **Middleware:** Centralized authentication and edge-level routing logic.
* **Environment Constraints:** `.env.local` for secrets. CI pipelines will fail if secrets are committed.

### **2.2 Supabase Configuration**

* **Client Architecture:** Singleton instantiation of `createClient()` from `@supabase/supabase-js`.
* **Type Generation:** PostgREST types must be generated and strictly bound to client invocations.

### **2.3 Shadcn UI & Tailwind Configuration**

* **Customization:** Modify `tailwind.config.ts` to strip all default colors and gradients. Register the custom monochrome palette explicitly under `theme.colors`.
* **Radius Strategy:** Define a global border-radius logic (e.g., `radius: 0` for brutalist, `radius: 0.5rem` for modern flat). Do not mix radii arbitrarily.

## **3. Performance Requirements**

### **3.1 Metrics Execution**

* **LCP (Largest Contentful Paint):** < 1.2s.
* **INP (Interaction to Next Paint):** < 100ms.
* **Bundle Size:** Core layout must remain under 150kb parsed JavaScript.

### **3.2 Rendering Optimization**

* **Component Splitting:** Dynamically import heavy UI elements (`next/dynamic`) positioned below the fold or inside modals.
* **Image Delivery:** `next/image` is mandatory. Utilize `priority` flags for LCP elements. Set explicit `width` and `height` to eliminate CLS (Cumulative Layout Shift).

## **4. Security Requirements**

### **4.1 Implementation Standards**

* **Input Validation:** Zod schema validation mandatory on both client-side forms and API route payloads.
* **XSS Protocol:** React inherently sanitizes DOM injections; however, `dangerouslySetInnerHTML` is categorically banned without executive engineering approval.

### **4.2 Authentication & Session Management**

* **Token Handling:** Secure, HttpOnly, SameSite cookies required.
* **Session Verification:** Validate JWTs at the middleware layer before rendering protected layouts.

## **5. Documentation Requirements**

### **5.1 Codebase Documentation**

* **Docstrings:** JSDoc annotations required for all complex utility functions and custom hooks outlining parameter types and return boundaries.
* **Prop Signatures:** All React components must export their Prop interfaces clearly above the functional component declaration.

### **5.2 README Architecture**

* **Deployment Topology:** Document Vercel/Supabase environment alignments.
* **Local Instantiation:** Provide strict terminal commands for `.env` setup, dependency installation, and local server execution.