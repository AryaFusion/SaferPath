import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Hero from "./components/home/Hero";
import About from "./components/home/About";
import HowItWorks from "./components/home/HowItWorks";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import HomePage from "./pages/HomePage";
import TripsPage from "./pages/TripsPage";
import ReportsPage from "./pages/ReportsPage";
import HelpNearbyPage from "./pages/HelpNearbyPage";
import ProfilePage from "./pages/ProfilePage";
import { JourneyProvider } from "./context/JourneyContext";
import { PreferencesProvider } from "./context/PreferencesContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Change to true to bypass authentication during rapid UI development
const DEV_BYPASS = false;

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated && !DEV_BYPASS) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
}

function AuthRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  
  if (isAuthenticated && !DEV_BYPASS) {
    return <Navigate to="/home" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <main>
        <Hero />
        <About />
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <PreferencesProvider>
        <JourneyProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
              <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />
              
              {/* Protected Routes */}
              <Route path="/home" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
              <Route path="/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><HelpNearbyPage /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            </Routes>
          </BrowserRouter>
        </JourneyProvider>
      </PreferencesProvider>
    </AuthProvider>
  );
}

export default App;