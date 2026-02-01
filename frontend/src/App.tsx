import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import Welcome from "./pages/Welcome";
import ClientDashboard from "./pages/ClientDashboard";
import Intake from "./pages/Intake";
import MyGroup from "./pages/MyGroup";
import Schedule from "./pages/Schedule";
import Payment from "./pages/Payment";
import Success from "./pages/Success";
import TherapistDashboard from "./pages/TherapistDashboard";
import TherapistGroupDetail from "./pages/TherapistGroupDetail";
import ResourceLibrary from "./pages/ResourceLibrary";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Component to handle auth-based redirects
function AuthenticatedRedirect() {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return null;
  }
  
  if (user?.role === 'therapist') {
    return <Navigate to="/therapist" replace />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/* Client routes */}
            <Route
              path="/chatinstructions"
              element={
                <ProtectedRoute requiredRole="client">
                  <Welcome />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="client">
                  <ClientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute requiredRole="client">
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/intake"
              element={
                <ProtectedRoute requiredRole="client">
                  <Intake />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-group"
              element={
                <ProtectedRoute requiredRole="client">
                  <MyGroup />
                </ProtectedRoute>
              }
            />
            <Route
              path="/schedule"
              element={
                <ProtectedRoute requiredRole="client">
                  <Schedule />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payment"
              element={
                <ProtectedRoute requiredRole="client">
                  <Payment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/success"
              element={
                <ProtectedRoute requiredRole="client">
                  <Success />
                </ProtectedRoute>
              }
            />

            {/* Therapist routes */}
            <Route
              path="/therapist"
              element={
                <ProtectedRoute requiredRole="therapist">
                  <TherapistDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapist/group/:groupId"
              element={
                <ProtectedRoute requiredRole="therapist">
                  <TherapistGroupDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="/therapist/resources"
              element={
                <ProtectedRoute requiredRole="therapist">
                  <ResourceLibrary />
                </ProtectedRoute>
              }
            />

            {/* Public pages */}
            <Route path="/privacy" element={<PrivacyPolicy />} />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
