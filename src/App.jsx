import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { SignUpPage } from "./components/auth/SignUpPage";
import { LoginPage } from "./components/auth/LoginPage";
import GroupSetup from "./components/auth/GroupSetup";
import { Dashboard } from "./components/Dashboard";
import { AuthProvider } from "./context/AuthProvider";

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { claims, profile, loading } = useAuth();
  const [showSignUp, setShowSignUp] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!claims) {
    return showSignUp ? (
      <SignUpPage onSwitch={() => setShowSignUp(false)} />
    ) : (
      <LoginPage onSwitch={() => setShowSignUp(true)} />
    );
  }

  if (!profile?.group_id) return <GroupSetup />;

  return <Dashboard />;
}
