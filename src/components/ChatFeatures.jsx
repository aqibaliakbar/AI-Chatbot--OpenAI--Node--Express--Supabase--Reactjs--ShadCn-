import React, { useState, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Pin,
  Search,
  Pen,
  Code,
  Calculator,
  GraduationCap,
  MessagesSquare,
  History,
  Settings,
  ChevronRight,
  BookMarked,
  FileText,
  Star,
  X,
  HelpCircle,
  Sparkles,
  Brain,
	MessageCircle,
} from "lucide-react";
import { useChatSessions } from "@/contexts/ChatSessionsContext";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";


const QuickTip = ({ icon: Icon, title, description }) => (
  <div className="flex items-start space-x-3 p-2 rounded-lg bg-background/40 hover:bg-primary/5 transition-colors">
    <Icon className="w-4 h-4 text-primary mt-1 shrink-0" />
    <div>
      <h4 className="text-xs font-medium">{title}</h4>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);

const SessionItem = ({ session, isActive, onClick, onPin, isPinned }) => (
  <div
    className={cn(
      "group flex items-center space-x-2 p-2 text-xs rounded-lg",
      "hover:bg-primary/5 cursor-pointer transition-colors duration-200",
      isActive && "bg-primary/10"
    )}
  >
    {isPinned ? (
      <Pin className="w-3 h-3 text-primary shrink-0 fill-current" />
    ) : (
      <Clock className="w-3 h-3 text-muted-foreground shrink-0" />
    )}
    <div className="flex-1 overflow-hidden" onClick={onClick}>
      <div className="font-medium truncate">{session.name}</div>
      <div className="text-xs text-muted-foreground truncate">
        {session.messages?.[0]?.content || "Empty chat"}
      </div>
      {session.personality && (
        <div className="flex items-center gap-1 mt-1">
          <div
            className={cn("w-1.5 h-1.5 rounded-full", {
              "bg-blue-400": session.personality === "default",
              "bg-violet-400": session.personality === "analyst",
              "bg-green-400": session.personality === "teacher",
              "bg-orange-400": session.personality === "creative",
              "bg-cyan-400": session.personality === "programmer",
            })}
          />
          <span className="text-[10px] text-muted-foreground">
            {session.personality
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ")}
          </span>
        </div>
      )}
    </div>
    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPin(session.id);
        }}
        className="p-1 hover:bg-primary/10 rounded transition-colors"
      >
        <Pin
          className={cn(
            "w-3 h-3",
            isPinned ? "text-primary" : "text-muted-foreground"
          )}
        />
      </button>
    </div>
  </div>
);

const PersonalityCard = ({ personality, isActive, onClick }) => {
  const Icon = personality.icon;

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative flex items-center space-x-3 p-3 rounded-lg cursor-pointer",
        "transition-all duration-200 ease-in-out",
        "hover:bg-primary/5 hover:shadow-md",
        isActive && "bg-primary/10 ring-1 ring-primary/20"
      )}
    >
      <div
        className={cn(
          "p-2 rounded-lg transition-colors",
          isActive ? personality.bgColor : "bg-background/60"
        )}
      >
        <Icon
          className={cn(
            "w-4 h-4 shrink-0",
            isActive ? personality.iconColor : "text-primary"
          )}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium">{personality.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {personality.description}
        </div>
        {isActive && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {personality.features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-1.5 text-[10px] text-primary/70"
              >
                <Sparkles className="w-2 h-2" />
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>
      <div
        className={cn(
          "absolute right-2 top-1/2 -translate-y-1/2 transition-transform",
          isActive
            ? "translate-x-0"
            : "translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
        )}
      >
        <ChevronRight className="w-4 h-4 text-primary" />
      </div>
    </div>
  );
};

const ChatFeatures = () => {
  const {
    sessions,
    currentSession,
    switchSession,
    updateSessionPersonality,
    user,
  } = useChatSessions();

  const [searchTerm, setSearchTerm] = useState("");
  const [pinnedSessions, setPinnedSessions] = useState([]);
  const [recentSessions, setRecentSessions] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const personalityTypes = [
    {
      id: "default",
      name: "Default Assistant",
      icon: Brain,
      description: "Versatile AI assistant for general tasks and queries",
      features: [
        "General assistance",
        "Task management",
        "Information lookup",
        "Basic help",
      ],
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-500",
    },
    {
      id: "analyst",
      name: "Data Analyst",
      icon: Calculator,
      description: "Specialized in data analysis and visualization",
      features: [
        "Data processing",
        "Statistical analysis",
        "Visualization",
        "Insights",
      ],
      bgColor: "bg-violet-500/20",
      iconColor: "text-violet-500",
    },
    {
      id: "teacher",
      name: "Teacher",
      icon: GraduationCap,
      description: "Educational support and learning assistance",
      features: [
        "Clear explanations",
        "Course planning",
        "Study guides",
        "Practice problems",
      ],
      bgColor: "bg-green-500/20",
      iconColor: "text-green-500",
    },
    {
      id: "creative",
      name: "Creative Writer",
      icon: Pen,
      description: "Creative writing and content creation specialist",
      features: [
        "Story writing",
        "Content ideas",
        "Creative assistance",
        "Editing help",
      ],
      bgColor: "bg-orange-500/20",
      iconColor: "text-orange-500",
    },
    {
      id: "programmer",
      name: "Programmer",
      icon: Code,
      description: "Technical implementation and coding support",
      features: [
        "Code help",
        "Debugging",
        "Best practices",
        "Technical guidance",
      ],
      bgColor: "bg-cyan-500/20",
      iconColor: "text-cyan-500",
    },
  ];

  const updatePinnedStatus = useCallback(
    async (sessionId, isPinned) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("chat_sessions")
          .update({ is_pinned: isPinned })
          .eq("id", sessionId)
          .eq("user_id", user.id);

        if (error) throw error;

        const updatedSessions = sessions.map((session) =>
          session.id === sessionId ? { ...session, isPinned } : session
        );

        const pinned = updatedSessions.filter((session) => session.isPinned);
        const recent = updatedSessions
          .filter((session) => !session.isPinned)
          .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
          .slice(0, 5);

        setPinnedSessions(pinned);
        setRecentSessions(recent);
      } catch (error) {
        console.error("Error updating pinned status:", error);
      }
    },
    [user, sessions]
  );

  useEffect(() => {
    const filtered = sessions.filter(
      (session) =>
        session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.messages?.some((msg) =>
          msg.content?.toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    const pinned = filtered.filter((session) => session.isPinned);
    setPinnedSessions(pinned);

    const recent = filtered
      .filter((session) => !session.isPinned)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5);
    setRecentSessions(recent);
  }, [sessions, searchTerm]);

  const handlePinSession = async (sessionId) => {
    const session = sessions.find((s) => s.id === sessionId);
    if (session) {
      await updatePinnedStatus(sessionId, !session.isPinned);
    }
  };

  const handlePersonalityChange = async (personalityId) => {
    if (currentSession) {
      await updateSessionPersonality(currentSession.id, personalityId);
    }
  };

  return (
    <Card className="bg-background/40 backdrop-blur-sm border-0 w-full">
      <Tabs defaultValue="help" className="w-full">
        <TabsList className="grid grid-cols-3 gap-2">
          <TabsTrigger value="session">
            <MessageCircle className="w-4 h-4 mr-2" />
           Session
          </TabsTrigger>
          <TabsTrigger value="personalities">
            <Brain className="w-4 h-4 mr-2" />
            AI Roles
          </TabsTrigger>
          <TabsTrigger value="help">
            <HelpCircle className="w-4 h-4 mr-2" />
            Help
          </TabsTrigger>
        </TabsList>

        <div className="p-3">
          <TabsContent value="session" className="mt-0">
            <div className="space-y-3">
              <div className="relative">
                <Search
                  className={cn(
                    "absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4",
                    isSearchFocused ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <Input
                  placeholder="Search saved chats... (⌘K)"
                  className="pl-8 text-xs h-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setSearchTerm("")}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[250px]">
                {pinnedSessions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <div className="text-xs font-medium text-muted-foreground pl-2 flex items-center gap-2">
                      <Pin className="w-3 h-3" />
                      Pinned Chats
                    </div>
                    {pinnedSessions.map((session) => (
                      <SessionItem
                        key={session.id}
                        session={session}
                        isActive={currentSession?.id === session.id}
                        onClick={() => switchSession(session.id)}
                        onPin={handlePinSession}
                        isPinned={true}
                      />
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <div className="text-xs font-medium text-muted-foreground pl-2 flex items-center gap-2">
                    <History className="w-3 h-3" />
                    Recent Chats
                  </div>
                  {recentSessions.map((session) => (
                    <SessionItem
                      key={session.id}
                      session={session}
                      isActive={currentSession?.id === session.id}
                      onClick={() => switchSession(session.id)}
                      onPin={handlePinSession}
                      isPinned={false}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

					<TabsContent value="personalities" className="mt-0">
					
            <div className="space-y-2">
              
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-medium text-muted-foreground">
                    Current:{" "}
                    {personalityTypes.find(
                      (p) => p.id === currentSession?.personality
                    )?.name || "Default Assistant"}
                  </div>
                  {currentSession?.personality !== "default" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 hover:bg-background/80"
                      onClick={() => handlePersonalityChange("default")}
                    >
                      Reset to Default
                    </Button>
                  )}
                </div>
         

              <ScrollArea className="h-[260px] pr-4">
                <div className="space-y-2">
                  {personalityTypes.map((personality) => (
                    <PersonalityCard
                      key={personality.id}
                      personality={personality}
                      isActive={currentSession?.personality === personality.id}
                      onClick={() => handlePersonalityChange(personality.id)}
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>

          <TabsContent value="help" className="mt-0">
            <ScrollArea className="h-[290px] pr-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium pl-2">Getting Started</h3>
                  <QuickTip
                    icon={Pin}
                    title="Pin Important Chats"
                    description="Keep your important conversations easily accessible at the top"
                  />
                  <QuickTip
                    icon={Brain}
                    title="AI Personalities"
                    description="Switch between different AI roles for specialized assistance"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium pl-2">
                    Keyboard Shortcuts
                  </h3>
                  <QuickTip
                    icon={Search}
                    title="Quick Search"
                    description="Press ⌘K to quickly search through your chats"
                  />
                  <QuickTip
                    icon={MessagesSquare}
                    title="New Chat"
                    description="Press ⌘O to start a new conversation"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium pl-2">Features</h3>
                  <QuickTip
                    icon={FileText}
                    title="File Analysis"
                    description="Upload and analyze documents directly in your chats"
                  />
                  <QuickTip
                    icon={History}
                    title="Chat History"
                    description="Access and search through all your previous conversations"
                  />
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium pl-2">AI Roles Guide</h3>
                  <div className="space-y-2">
                    {personalityTypes.map((personality) => (
                      <div
                        key={personality.id}
                        className="p-2 rounded-lg bg-background/40"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={cn("p-1 rounded", personality.bgColor)}
                          >
                            <personality.icon
                              className={cn("w-3 h-3", personality.iconColor)}
                            />
                          </div>
                          <span className="text-xs font-medium">
                            {personality.name}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {personality.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </Card>
  );
};

export default ChatFeatures;
