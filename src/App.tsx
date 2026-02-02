import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminOverview from "./pages/admin-dashboard/Overview";
import AdminAnnouncements from "./pages/admin-dashboard/Announcements";
import AdminResources from "./pages/admin-dashboard/ResourceLibrary";
import AdminQuizManager from "./pages/admin-dashboard/QuizManager";
import AdminAnalytics from "./pages/admin-dashboard/StudentAnalytics";
import { RoleGuard } from "./components/auth/RoleGuard";
import FocusChamber from "./pages/FocusChamber";

const queryClient = new QueryClient();

import { ThemeProvider } from "@/components/theme-provider";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}

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
              {/* Future routes will go here: announcements, quizzes, etc */}
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

            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
