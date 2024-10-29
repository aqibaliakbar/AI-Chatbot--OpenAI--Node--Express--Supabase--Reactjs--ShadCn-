import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Layout from "./layout/Layout";
import ChatInterface from "./ChatInterface";
import FileAnalysisInterface from "./FileAnalysisInterface";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ParticleBackground from "./ParticleBackground";
// Dashboard component to contain the main app functionality
export const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("chat");
  const [fileSummary, setFileSummary] = useState(null);
  const handleSwitchToFileAnalysis = (summary) => {
    setFileSummary(summary);
    setActiveTab("fileAnalysis");
  };
  return (
    <Layout>
      <div className="relative container mx-auto py-8 h-full">
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
  );
};
