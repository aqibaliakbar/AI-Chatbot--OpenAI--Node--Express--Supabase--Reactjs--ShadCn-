import React from "react";
import { ModeToggle } from "./ModeToggler";
import Sidebar from "./Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar />
      <div className="flex flex-col">
        <header className="border-b">
          <div className="container flex items-center justify-between py-2">
            <h1 className="text-xl font-bold">InsightBot</h1>
            <ModeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-hidden">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
