import React from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import ChatInterface from "./components/ChatInterface";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { ChatSessionsProvider } from "./contexts/ChatSessionsContext";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <ChatSessionsProvider>
        <Layout>
          <div className="container mx-auto p-4 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              <div className="lg:col-span-2 h-full">
                <ChatInterface />
              </div>
              <div className="lg:col-span-1">
                <AnalyticsDashboard />
              </div>
            </div>
          </div>
        </Layout>
      </ChatSessionsProvider>
    </ThemeProvider>
  );
}

export default App;
