
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { TaskProvider } from "./context/TaskContext";
import { NoteProvider } from './context/NoteContext'; // Added NoteProvider
import { AuthProvider, useAuth } from './hooks/useAuth';
import Index from "./pages/Index";
import NoteEditorPage from './components/pages/NoteEditorPage'; // Added NoteEditorPage
import AllNotesPage from './components/pages/AllNotesPage'; // Added AllNotesPage
import TaskDetailPage from './pages/TaskDetailPage'; // Added TaskDetailPage
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
    return <div className="flex h-screen items-center justify-center bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">Loading...</div>;
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

        {/* Dashboard/Tasks Routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />
        <Route path="/tasks" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />

        {/* Note Editor Routes */}
        <Route 
          path="/tasks/:taskId/notes/new" 
          element={<ProtectedRoute><NoteEditorPage /></ProtectedRoute>} 
        />
        <Route 
          path="/notes/new" 
          element={<ProtectedRoute><NoteEditorPage /></ProtectedRoute>} 
        />
        <Route 
          path="/notes/:noteId/edit" 
          element={<ProtectedRoute><NoteEditorPage /></ProtectedRoute>} 
        />
        <Route 
          path="/tasks/:taskId/notes/:noteId/edit" 
          element={<ProtectedRoute><NoteEditorPage /></ProtectedRoute>} 
        />
        <Route 
          path="/notes"
          element={<ProtectedRoute><AllNotesPage /></ProtectedRoute>}
        />

        {/* Task Detail Page Route */}
        <Route 
          path="/tasks/:taskId"
          element={<ProtectedRoute><TaskDetailPage /></ProtectedRoute>}
        />

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
          <NoteProvider> { /* Added NoteProvider wrapper */ }
            <Toaster />
            <Sonner />
            <AppRoutes />
          </NoteProvider>
        </TaskProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
