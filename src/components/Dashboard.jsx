import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "./layout/Layout";
import ChatInterface from "./ChatInterface";
import FileAnalysisInterface from "./FileAnalysisInterface";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ChatFeatures from "./ChatFeatures";
import { useChatSessions } from "@/contexts/ChatSessionsContext";

export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const { currentSession, sessions } = useChatSessions();

  // Switch to chat tab if current session has no file analysis
  useEffect(() => {
    if (
      currentSession &&
      !currentSession?.file_analysis &&
      activeTab === "fileAnalysis"
    ) {
      setActiveTab("chat");
    }
  }, [currentSession]);

  // Handle session deletion
  useEffect(() => {
    if (!currentSession && sessions.length > 0) {
      setActiveTab("chat");
    }
  }, [currentSession, sessions]);

  const handleSwitchToFileAnalysis = () => {
    setActiveTab("fileAnalysis");
  };

  return (
    <Layout>
      <div className="relative max-w-[99rem] mx-auto p-8 h-full"> {/* Changed py-8 to p-8 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full"> {/* Increased gap-4 to gap-6 */}
          <div className="lg:col-span-2 h-full flex flex-col"> {/* Added flex flex-col */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="h-full flex flex-col"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  Chat
                </TabsTrigger>
                <TabsTrigger
                  value="fileAnalysis"
                  disabled={!currentSession?.file_analysis}
                  className="flex items-center gap-2"
                >
                  File Analysis
                  {currentSession?.file_analysis && (
                    <span className="w-2 h-2 bg-primary rounded-full" />
                  )}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="chat" className="flex-1 mt-0 border-none">
                <ChatInterface
                  onSwitchToFileAnalysis={handleSwitchToFileAnalysis}
                />
              </TabsContent>
              <TabsContent
                value="fileAnalysis"
                className="flex-1 mt-0 border-none"
              >
                {currentSession?.file_analysis && (
                  <FileAnalysisInterface
                    onReturnToChat={() => setActiveTab("chat")}
                  />
                )}
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-1 flex flex-col space-y-4">
            <div className="flex-none">
              <AnalyticsDashboard />
            </div>
            {activeTab === "chat" && (
              <div className="flex-none">
                <ChatFeatures />
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}