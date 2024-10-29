
import { ThemeProvider } from "./components/ThemeProvider";

import { ChatSessionsProvider } from "./contexts/ChatSessionsContext";

import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { RootContent } from "./components/auth/RootContent/RootContent";
import { GuestRoute } from "./components/auth/GuestRoute/GuestRoute";
import { SignIn } from "./components/auth/Signin/Signin";
import { SignUp } from "./components/auth/Signup/Signup";
import AuthCallback from "./components/auth/AuthCallBack/AuthCallback";


function App() {


  return (
    <BrowserRouter>
      <ThemeProvider defaultTheme="system" storageKey="app-theme">
        <AuthProvider>
          <ChatSessionsProvider>
            <Routes>
              {/* Root path - shows dashboard if logged in, sign in if not */}
              <Route path="/" element={<RootContent />} />

              {/* Auth routes - only accessible when not logged in */}
              <Route
                path="/signin"
                element={
                  <GuestRoute>
                    <SignIn />
                  </GuestRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <GuestRoute>
                    <SignUp />
                  </GuestRoute>
                }
              />

              {/* Auth callback route */}
              <Route path="/auth/callback" element={<AuthCallback />} />

              {/* Catch all route - redirect to root */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ChatSessionsProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}


export default App;
