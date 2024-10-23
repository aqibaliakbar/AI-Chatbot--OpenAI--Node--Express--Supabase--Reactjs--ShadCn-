import React, { useState } from "react";
import { ThemeProvider } from "./components/ThemeProvider";
import Layout from "./components/Layout";
import ChatInterface from "./components/ChatInterface";
import FileAnalysisInterface from "./components/FileAnalysisInterface";
import AnalyticsDashboard from "./components/AnalyticsDashboard";
import { ChatSessionsProvider } from "./contexts/ChatSessionsContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [fileSummary, setFileSummary] = useState(null);

  const handleSwitchToFileAnalysis = (summary) => {
    setFileSummary(summary);
    setActiveTab("fileAnalysis");
  };

  return (
    <ThemeProvider defaultTheme="system" storageKey="app-theme">
      <ChatSessionsProvider>
        <Layout>
          <div className="container mx-auto py-8 h-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
              <div className="lg:col-span-2 h-full">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="h-full"
                >
                  <TabsList>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="fileAnalysis" disabled={!fileSummary}>
                      File Analysis
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="chat" className="h-full">
                    <ChatInterface
                      onSwitchToFileAnalysis={handleSwitchToFileAnalysis}
                    />
                  </TabsContent>
                  <TabsContent value="fileAnalysis" className="h-full">
                    {fileSummary && (
                      <FileAnalysisInterface
                        initialSummary={fileSummary}
                        onReturnToChat={() => setActiveTab("chat")}
                      />
                    )}
                  </TabsContent>
                </Tabs>
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
