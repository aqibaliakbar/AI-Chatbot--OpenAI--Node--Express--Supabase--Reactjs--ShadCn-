import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users,
  MessageSquare,
  Activity,
  PieChart as PieChartIcon,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useChatSessions } from "../contexts/ChatSessionsContext";
import { FeatureShowcase } from "./NoSessionUIComponents/FeaturesShowCase";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const MetricCard = ({ icon: Icon, label, value, trend }) => (
  <div className="flex items-center space-x-3 bg-background/40 rounded-lg p-3">
    <div className="p-2 bg-primary/10 rounded-lg">
      <Icon className="w-4 h-4 text-primary" />
    </div>
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <div className="flex items-center space-x-2">
        <p className="text-lg font-semibold">{value}</p>
        {trend && (
          <span
            className={`text-xs ${
              trend.startsWith("+") ? "text-green-500" : "text-red-500"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  </div>
);

const AnalyticsDashboard = () => {
  const { sessions } = useChatSessions();
  const [personalityData, setPersonalityData] = useState([]);
  const [sessionLengthData, setSessionLengthData] = useState([]);

  useEffect(() => {
    const personalityUsage = sessions.reduce((acc, session) => {
      const personality = session.personality || "Default";
      acc[personality] = (acc[personality] || 0) + 1;
      return acc;
    }, {});

    setPersonalityData(
      Object.entries(personalityUsage).map(([name, value]) => ({
        name,
        value,
      }))
    );

    setSessionLengthData(
      sessions.map((session, index) => ({
        name: `Session ${index + 1}`,
        messages: session.messages.length,
      }))
    );
  }, [sessions]);

  const totalMessages = sessions.reduce(
    (acc, session) => acc + session.messages.length,
    0
  );
  const averageMessages = sessions.length
    ? (totalMessages / sessions.length).toFixed(1)
    : 0;

  return (
    <div className="h-full">
      <Tabs defaultValue="personality" className="h-full space-y-4">
        <div className="bg-background/40 backdrop-blur-sm p-1 rounded-lg mb-4">
          <TabsList className="grid grid-cols-3 gap-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="personality">Personality Analysis</TabsTrigger>
            <TabsTrigger value="sessions">Session Analysis</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-4 mt-0">
          <div className="grid grid-cols-2 gap-4">
            <MetricCard
              icon={Users}
              label="Total Sessions"
              value={sessions.length}
              trend="+12.5% from last week"
            />
            <MetricCard
              icon={MessageSquare}
              label="Total Messages"
              value={totalMessages}
              trend="+8.2% from last week"
            />
            <MetricCard
              icon={Activity}
              label="Avg Messages/Session"
              value={averageMessages}
              trend="-2.4% from last week"
            />
            <MetricCard
              icon={PieChartIcon}
              label="Active Personalities"
              value={personalityData.length}
              trend="+15.8% from last week"
            />
          </div>
        </TabsContent>

        <TabsContent value="personality" className="mt-0">
          {!sessions.length ? (
            <FeatureShowcase />
          ) : (
            <Card className="bg-background/40 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={personalityData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                      >
                        {personalityData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sessions" className="mt-0">
          <Card className="bg-background/40 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sessionLengthData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        border: "none",
                        borderRadius: "4px",
                        color: "white",
                      }}
                    />
                    <Bar
                      dataKey="messages"
                      fill="var(--primary)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
