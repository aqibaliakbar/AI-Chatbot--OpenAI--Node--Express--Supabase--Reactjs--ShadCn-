import { useAuth } from "@/contexts/AuthContext";
import { SignIn } from "../Signin/Signin";
import { Dashboard } from "@/components/Dashboard";

// Root content component that handles auth state
export const RootContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <SignIn />;
  }

  return <Dashboard />;
};
