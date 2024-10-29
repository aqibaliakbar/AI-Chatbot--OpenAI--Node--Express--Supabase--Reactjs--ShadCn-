// Sidebar.js
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useChatSessions } from "@/contexts/ChatSessionsContext";


const Sidebar = () => {
  const {
    sessions,
    currentSession,
    createSession,
    switchSession,
    updateSessionName,
  } = useChatSessions();
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const handleNewChat = () => {
    const newSession = createSession();
    switchSession(newSession.id);
  };

  const handleEditSessionName = (sessionId, currentName) => {
    setEditingSessionId(sessionId);
    setEditedName(currentName);
  };

  const handleSaveSessionName = (sessionId) => {
    if (editedName.trim()) {
      updateSessionName(sessionId, editedName);
    }
    setEditingSessionId(null);
    setEditedName("");
  };

  const handleKeyPress = (e, sessionId) => {
    if (e.key === "Enter") {
      handleSaveSessionName(sessionId);
    } else if (e.key === "Escape") {
      setEditingSessionId(null);
      setEditedName("");
    }
  };

  const filteredSessions = sessions.filter((session) =>
    session.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="w-64 border-r bg-background">
      <div className="p-4">
        <Input
          type="text"
          placeholder="Search chats..."
          className="mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button onClick={handleNewChat} className="w-full">
          New Chat
        </Button>
      </div>
      <ScrollArea className="h-[calc(100vh-8rem)]">
        <div className="px-2">
          {filteredSessions.map((session) => (
            <div key={session.id} className="mb-1">
              {editingSessionId === session.id ? (
                <div className="flex">
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, session.id)}
                    className="flex-grow"
                    autoFocus
                  />
                  <Button
                    onClick={() => handleSaveSessionName(session.id)}
                    className="ml-1"
                  >
                    Save
                  </Button>
                </div>
              ) : (
                <Button
                  variant={
                    currentSession?.id === session.id ? "secondary" : "ghost"
                  }
                  className="w-full justify-start text-left relative group"
                  onClick={() => switchSession(session.id)}
                >
                  <span className="flex-grow truncate">{session.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditSessionName(session.id, session.name);
                    }}
                    className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity absolute right-2"
                  >
                    Edit
                  </Button>
                </Button>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default Sidebar;
