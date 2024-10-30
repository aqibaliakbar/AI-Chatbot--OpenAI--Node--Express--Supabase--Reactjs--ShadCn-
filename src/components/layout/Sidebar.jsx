import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MessageSquarePlus,
  Search,
  Trash2,
  Edit2,
  X,
  Check,
  FileText,
} from "lucide-react";
import { useChatSessions } from "@/contexts/ChatSessionsContext";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import NoChatSessionView from "../NoSessionUIComponents/NoChatSessionView";

const Sidebar = () => {
  const {
    sessions,
    currentSession,
    createSession,
    switchSession,
    updateSessionName,
    deleteSession,
  } = useChatSessions();
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyboard = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        document.getElementById("search-input").focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "o") {
        e.preventDefault();
        handleNewChat();
      }
    };

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, []);

  const handleNewChat = async () => {
    await createSession();
    setSearchTerm("");
  };

  const handleEditSessionName = (sessionId, currentName) => {
    setEditingSessionId(sessionId);
    setEditedName(currentName);
  };

  const handleSaveSessionName = async (sessionId) => {
    if (editedName.trim()) {
      await updateSessionName(sessionId, editedName.trim());
    }
    setEditingSessionId(null);
    setEditedName("");
  };

  const handleDeleteSession = async () => {
    if (sessionToDelete) {
      const remainingSessions = sessions.filter(
        (s) => s.id !== sessionToDelete
      );
      await deleteSession(sessionToDelete);

      if (remainingSessions.length > 0) {
        switchSession(remainingSessions[0].id);
      }

      setSessionToDelete(null);
    }
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
    <>
      <div className="w-64 border-r bg-background flex flex-col h-screen">
        <div className="p-4 space-y-4 border-b">
          <Button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
          >
            <MessageSquarePlus className="h-4 w-4" />
            New Chat
            <span className="text-xs opacity-60 ml-2">⌘O</span>
          </Button>

          <div className="relative">
            <Search
              className={cn(
                "absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4",
                isSearchFocused ? "text-primary" : "text-muted-foreground"
              )}
            />
            <Input
              id="search-input"
              type="text"
              placeholder="Search chats... (⌘K)"
              className="pl-9 pr-4"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                onClick={() => setSearchTerm("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredSessions.length === 0 ? (
             <><NoChatSessionView/></>
            ) : (
              filteredSessions.map((session) => (
                <div key={session.id} className="relative group">
                  {editingSessionId === session.id ? (
                    <div className="flex items-center gap-1 p-1">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, session.id)}
                        className="flex-grow h-8"
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSaveSessionName(session.id)}
                        className="h-8 w-8 p-0"
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingSessionId(null);
                          setEditedName("");
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <Button
                        variant={
                          currentSession?.id === session.id
                            ? "secondary"
                            : "ghost"
                        }
                        className={cn(
                          "w-full justify-start text-left relative group",
                          currentSession?.id === session.id && "font-medium"
                        )}
                        onClick={() => switchSession(session.id)}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="truncate">{session.name}</span>
                          {session.file_analysis && (
                            <FileText className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                          )}
                        </div>
                      </Button>
                      <div className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditSessionName(session.id, session.name);
                          }}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSessionToDelete(session.id);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <AlertDialog
        open={!!sessionToDelete}
        onOpenChange={() => setSessionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Chat Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this chat session? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSession}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Sidebar;
