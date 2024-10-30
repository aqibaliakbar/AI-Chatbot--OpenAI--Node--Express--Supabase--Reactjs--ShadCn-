import React from "react";
import { motion } from "framer-motion";

import { Bot } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";



import { ModeToggle } from "../ModeToggler";
import AuthButton from "../auth/AuthButton/AuthButton";
import ParticleBackground from "../ParticleBackground";
import { SignIn } from "../auth/Signin/Signin";
import Sidebar from "./Sidebar";
import { Link } from "react-router-dom";
import { FuturisticLogo } from "../FuturicticLogo";

const LoadingScreen = () => (
  <div className="relative flex items-center justify-center min-h-screen bg-background">
    <ParticleBackground
      count={30}
      minOpacity={0.2}
      maxOpacity={0.5}
      speed={0.2}
      className="!fixed"
    />
    <div className="relative z-10">
      <div className="relative w-24 h-24">
        <div className="absolute inset-0 border-4 border-primary/50 rounded-full animate-pulse" />
        <div className="absolute inset-0 border-4 border-t-primary rounded-full animate-spin" />
        <Bot className="absolute inset-0 m-auto w-12 h-12 text-primary animate-pulse" />
      </div>
    </div>
  </div>
);

const Layout = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <SignIn />;
  }

  return (
    <div className="relative min-h-screen h-[97vh] bg-background text-foreground flex overflow-hidden">
      <ParticleBackground
        count={30}
        minOpacity={0.1}
        maxOpacity={0.4}
        speed={0.2}
        className="!fixed"
      />
      <div className="relative z-10 flex w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <motion.header
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="border-b backdrop-blur-sm bg-background/80 sticky top-0 z-50"
          >
            <div className="max-w-[97rem] mx-auto flex items-center justify-between py-4 px-6">
              <FuturisticLogo />
              <div className="flex items-center space-x-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex space-x-4 items-center"
                >
                  <ModeToggle />
                  <AuthButton />
                </motion.div>
              </div>
            </div>
          </motion.header>
          <main className="flex-1 overflow-hidden relative  ">{children}</main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
