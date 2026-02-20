import { Toaster } from "@/components/ui/toaster";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Loader2 } from "lucide-react";
import { ThemeProvider } from "@/components/theme-provider";

// Lazy load utils
const RoleGuard = lazy(() => import("./components/auth/RoleGuard").then(module => ({ default: module.RoleGuard })));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(module => ({ default: module.AdminLayout })));

// Lazy load pages to isolate crashes
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const Authentication = lazy(() => import("./pages/Auth"));
const Landing = lazy(() => import("./pages/Landing"));
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
  <div className="flex items-center justify-center min-h-screen bg-background">
    <Loader2 className="w-10 h-10 animate-spin text-primary" />
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
