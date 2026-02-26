import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";

// CORE PAGES - Static Load for Reliability
import Landing from "./pages/Landing";
import Authentication from "./pages/Auth";
import Index from "./pages/Index";

// Lazy load non-critical utils/admin
const RoleGuard = lazy(() => import("./components/auth/RoleGuard").then(module => ({ default: module.RoleGuard })));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(module => ({ default: module.AdminLayout })));

// Lazy load pages
const NotFound = lazy(() => import("./pages/NotFound"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const FocusChamber = lazy(() => import("./pages/FocusChamber"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));

// Admin pages
const AdminOverview = lazy(() => import("./pages/admin-dashboard/Overview"));
const AdminAnnouncements = lazy(() => import("./pages/admin-dashboard/Announcements"));
const AdminResources = lazy(() => import("./pages/admin-dashboard/ResourceLibrary"));
const AdminQuizManager = lazy(() => import("./pages/admin-dashboard/QuizManager"));
const AdminAnalytics = lazy(() => import("./pages/admin-dashboard/StudentAnalytics"));

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="flex items-center justify-center min-h-screen bg-black text-cyan-500 overflow-hidden relative">
    {/* Background Glow */}
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)]" />

    <div className="flex flex-col items-center gap-6 relative z-10 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>

      <div className="space-y-2">
        <span className="text-sm font-mono uppercase tracking-[0.5em] animate-pulse block">Initializing Hub</span>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-50">Synchronizing Environment...</p>
      </div>

      <div className="mt-8 pt-8 border-t border-border/40 w-full max-w-[200px]">
        <Button
          variant="ghost"
          size="sm"
          className="text-[10px] uppercase tracking-widest text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all font-mono"
          onClick={() => {
            localStorage.clear();
            window.location.href = "/auth";
          }}
        >
          Reset Session & Hub
        </Button>
        <p className="text-[8px] text-muted-foreground/40 mt-2 italic font-mono uppercase">Use only if stuck for more than 5s</p>
      </div>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner position="top-right" />
        <BrowserRouter>
          <ErrorBoundary>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/auth" element={<Authentication />} />
                <Route path="/dashboard" element={<Index />} />

                {/* Admin Routes */}
                <Route
                  path="/admin-dashboard"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'super_admin', 'master']}>
                      <AdminLayout />
                    </RoleGuard>
                  }
                >
                  <Route index element={<AdminOverview />} />
                  <Route path="announcements" element={<AdminAnnouncements />} />
                  <Route path="quizzes" element={<AdminQuizManager />} />
                  <Route path="resources" element={<AdminResources />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                </Route>

                <Route path="focus-chamber" element={
                  <RoleGuard allowedRoles={['student', 'teacher', 'super_admin', 'master', 'super-admin', 'super admin']}>
                    <FocusChamber />
                  </RoleGuard>
                } />

                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
