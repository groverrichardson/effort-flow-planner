
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TaskProvider } from "./context/TaskContext";
import { AuthProvider, useAuth } from './hooks/useAuth';
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  console.log('ProtectedRoute - Auth state:', { user: user?.email || 'null', loading });
  
  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    console.log('ProtectedRoute - No user, redirecting to login');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  console.log('ProtectedRoute - User authenticated, rendering protected content');
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TaskProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TaskProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
