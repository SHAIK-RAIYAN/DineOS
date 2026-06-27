# Agents Instructions for DineOS Project

## **1. Core Project Rules (Non-Negotiable)**

### **1.1 Language Requirements**
* **All code must be written in:** **TypeScript**  
* **Strict Type Safety:** 
    - No `as any` or type assertions without explicit justification  
    - Use `unknown` when type is genuinely uncertain  
    - Prefer generics and type guards over broad types
* **File naming:** 
    - PascalCase for components (`MyComponent.tsx`)  
    - camelCase for utility functions (`myUtil.ts`)  
    - kebab-case for CSS modules (`my-component.module.css`)

### **1.2 Framework Rules**
* **Framework:** Next.js (App Router only)  
* **Styling:** Tailwind CSS (Shadcn UI components preferred)  
* **State Management:** Zustand (Zustand stores required for all auth and order data)  
* **API Layer:** Supabase (client-side only, no server-side Supabase SDK)  
* **Folder Structure:** Use `app`, `src/components`, `src/lib`, `src/store`, `src/hooks`, `src/types`

### **1.3 UI/UX Standards**
* **Component Library:** Shadcn UI (all UI must use Shadcn components)  
* **Design System:**
    - Primary color: `#6366F1` (indigo)  
    - Background: `#F8FAFC` (slate-50)  
    - Text: `#1E293B` (slate-800)
* **Responsiveness:** Mobile-first approach, all pages must be fully responsive
* **Accessibility:** 
    - Semantic HTML  
    - ARIA labels where needed  
    - Keyboard navigation support  
    - Color contrast >= 4.5:1

### **1.4 Backend/Data Rules**
* **Database:** Supabase (PostgreSQL)  
* **Data Modeling:** All database schema decisions must be:
    - Documented in the project's Supabase SQL files  
    - Reviewed by AI and human stakeholders before implementation  
    - Include migrations for schema changes
* **Security:** 
    - No direct database access from client (always use Supabase client)  
    - RLS (Row Level Security) must be enabled on all tables

### **1.5 API Rules**
* **API Structure:** RESTful API following these patterns:
    * **Create:** `POST /api/v1/{resource}`  
    * **Read:** `GET /api/v1/{resource}` or `GET /api/v1/{resource}/{id}`  
    * **Update:** `PUT /api/v1/{resource}/{id}`  
    * **Delete:** `DELETE /api/v1/{resource}/{id}`
* **Response Format:** JSON only (`application/json` content type)  
* **Error Handling:** Always return appropriate HTTP status codes with meaningful error messages
* **Security:** 
    - Use Supabase client for all database operations  
    - Never expose secrets in API routes  
    - Implement proper validation and sanitization

### **1.6 Workflow Rules**
* **Atomic commits:** Each commit should represent a single logical change  
* **Descriptive commit messages:** Conventional commits format (e.g., `feat: add user authentication`)
* **Branch naming:** 
    * `feature/` for new features  
    * `fix/` for bug fixes  
    * `chore/` for maintenance tasks  
    * `docs/` for documentation changes
* **Pull requests:** 
    * Minimum 1 reviewer required  
    * Must pass CI checks before merging

## **2. Project-Specific Configuration**

### **2.1 Next.js Configuration**
* **App Router:** All development must use the App Router (not Pages Router)
* **Middleware:** Use for authentication checks and routing logic
* **Environment Variables:** All Supabase credentials in `.env.local`, never commit to Git
* **TypeScript:** Strict mode enabled by default, all new files must use `.ts` extension

### **2.2 Supabase Configuration**
* **Client initialization:** Use `createClient()` from `@supabase/supabase-js`
* **Connection pooling:** Supabase handles pooling automatically
* **Type generation:** Generated types from Supabase schema must be used throughout codebase
* **Schema management:** All schema changes via migrations in `supabase/migrations/`

### **2.3 Shadcn UI Configuration**
* **Initialization:** Use `npx shadcn-ui@latest init` to set up
* **Customization:** Configure colors and themes in `tailwind.config.ts`
* **Component usage:** 
    * Buttons: `Button` from `@/components/ui/button`  
    * Cards: `Card` from `@/components/ui/card`  
    * Forms: `Form`, `Input`, `Select` from `@/components/ui/form`

## **3. Performance Requirements**

### **3.1 Performance Goals**
* **Load Time:** < 2 seconds for initial page load  
* **Interactions:** < 200ms response time for UI interactions  
* **Database Queries:** All queries must complete in < 100ms on average
* **Memory Usage:** Must remain stable and not increase over time

### **3.2 Performance Optimization**
* **Image optimization:** Use `next/image` with `alt` tags and proper sizing  
* **Code splitting:** Next.js handles automatically via dynamic imports  
* **Memoization:** Use `React.memo`, `useMemo`, and `useCallback` where appropriate  
* **Lazy loading:** Load components and heavy operations only when needed  
* **Database indexing:** All tables must have appropriate indexes

### **3.3 Performance Monitoring**
* **Lighthouse:** Run Lighthouse audits regularly  
* **Web Vitals:** Track Core Web Vitals (LCP, FID, CLS)  
* **Performance budgets:** Define budgets for bundle size and load time

## **4. Security Requirements**

### **4.1 Security Best Practices**
* **Never expose secrets:** All API keys and credentials in `.env.local` only
* **Input validation:** Validate all user inputs on client and server
* **Rate limiting:** Implement rate limiting on all API endpoints
* **SQL injection prevention:** Always use parameterized queries via Supabase client
* **XSS prevention:** Properly sanitize all user-generated content
* **CSRF protection:** Implement CSRF tokens for state-changing requests

### **4.2 Authentication Security**
* **Password policies:** Enforce strong password requirements
* **Session management:** Use secure, HttpOnly cookies for session tokens
* **Two-factor authentication:** Implement optional 2FA
* **Session rotation:** Implement automatic session rotation
* **Secure headers:** Use Helmet or Next.js security headers middleware

### **4.3 Supabase Security**
* **Row Level Security (RLS):** Enable RLS on all tables  
* **JWT validation:** Validate JWT on every authenticated request
* **No bypassing RLS:** Never bypass RLS via `service_role` key in production
* **Audit logging:** Enable audit logs for sensitive operations

## **5. Documentation Requirements**

### **5.1 Documentation Standards**
* **Inline comments:** All functions and complex logic must have JSDoc comments
* **Component documentation:** Each component must have:
    * Description of purpose  
    * Props table with types and defaults  
    * Usage examples
* **API documentation:** Auto-generate OpenAPI/Swagger documentation
* **Database documentation:** All tables and relationships documented in Supabase SQL files
* **Architecture documentation:** 
    * High-level architecture diagrams  
    * Component hierarchy documentation  
    * Data flow diagrams

### **5.2 README Structure**
* **Project Setup:** Step-by-step installation and configuration guide  
* **Development:**
    * Development workflow  
    * Available scripts  
    * Running tests  
    * Debugging information
* **Architecture:** Overview of the architecture and design decisions  
* **API Reference:** Complete API documentation  
* **Database Schema:** ER diagrams and table descriptions  
* **Troubleshooting:** Common issues and solutions  
* **Contributing:** Contribution guidelines and code style

### **5.3 Documentation Tools**
* **TypeDoc:** Generate API documentation from JSDoc comments
* **Swagger/OpenAPI:** Auto-generate API documentation
* **Storybook:** Component documentation and
