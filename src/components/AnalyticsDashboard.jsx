import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { useChatSessions } from "../contexts/ChatSessionsContext";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const AnalyticsDashboard = () => {
  const { sessions } = useChatSessions();
  const [personalityData, setPersonalityData] = useState([]);
  const [sessionLengthData, setSessionLengthData] = useState([]);


  useEffect(() => {
    // Personality usage data
    const personalityUsage = sessions.reduce((acc, session) => {
      const personality = session.personality || "default";
      acc[personality] = (acc[personality] || 0) + 1;
      return acc;
    }, {});
    const personalityChartData = Object.entries(personalityUsage).map(
      ([name, value]) => ({
        name,
        value,
      })
    );
    setPersonalityData(personalityChartData);

    // Session length data
    const sessionLengths = sessions.map((session) => ({
      id: session.id,
      length: session.messages.length,
      name: session.name || `Session ${session.id}`,
    }));
    setSessionLengthData(sessionLengths);
   
  }, [sessions]);

  const totalMessages = sessions.reduce(
    (acc, session) => acc + session.messages.length,
    0
  );
  const averageMessagesPerSession = sessions.length
    ? (totalMessages / sessions.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-card rounded-lg p-4 shadow">
              <h3 className="text-lg font-semibold mb-2">Quick Stats</h3>
              <p>Total Sessions: {sessions.length}</p>
              <p>Total Messages: {totalMessages}</p>
              <p>Avg Messages/Session: {averageMessagesPerSession}</p>
            </div>
            <div className="bg-card rounded-lg p-4 shadow h-64">
              <h3 className="text-lg font-semibold mb-2">Personality Usage</h3>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={personalityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    label
                  >
                    {personalityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-4">
            <h3 className="text-lg font-semibold mb-2">Session Lengths</h3>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sessionLengthData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="length" fill="var(--primary)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
  
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
