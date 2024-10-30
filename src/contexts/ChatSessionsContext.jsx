import { supabase } from "@/lib/supabase";
import {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";
import { useAuth } from "./AuthContext";

const ChatSessionsContext = createContext();

export const ChatSessionsProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const { user } = useAuth();

  // Load sessions from Supabase
  useEffect(() => {
    if (user) {
      loadSessions();
    }
  }, [user]);

  const loadSessions = async () => {
    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setSessions(data);
      if (data.length > 0 && !currentSession) {
        setCurrentSession(data[0]);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error("Error loading sessions:", error);
    }
  };

  // Create new session
  const createSession = useCallback(async () => {
    if (!user) return null;

    const newSession = {
      name: "New Chat",
      messages: [],
      personality: "default",
      user_id: user.id,
      file_analysis: null, // Initialize with no file analysis
    };

    try {
      const { data, error } = await supabase
        .from("chat_sessions")
        .insert([newSession])
        .select()
        .single();

      if (error) throw error;

      setSessions((prev) => [data, ...prev]);
      setCurrentSession(data);
      return data;
    } catch (error) {
      console.error("Error creating session:", error);
      return null;
    }
  }, [user]);

  // Update session
  const updateSession = useCallback(
    async (sessionId, messages) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("chat_sessions")
          .update({ messages })
          .eq("id", sessionId)
          .eq("user_id", user.id);

        if (error) throw error;

        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === sessionId ? { ...session, messages } : session
          )
        );
        setCurrentSession((prev) =>
          prev?.id === sessionId ? { ...prev, messages } : prev
        );
      } catch (error) {
        console.error("Error updating session:", error);
      }
    },
    [user]
  );

  // Update file analysis for a session
const updateFileAnalysis = useCallback(
  async (sessionId, fileAnalysis) => {
    if (!user) return;

    // Format the file analysis data to match the JSONB structure
    const formattedFileAnalysis = {
      filename: fileAnalysis.filename,
      messages: fileAnalysis.messages || [], // Preserve messages array
      uploaded_at: new Date().toISOString(),
      summary: fileAnalysis.summary,
    };

    try {
      const { error } = await supabase
        .from("chat_sessions")
        .update({
          file_analysis: formattedFileAnalysis,
        })
        .eq("id", sessionId)
        .eq("user_id", user.id);

      if (error) throw error;

      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId
            ? {
                ...session,
                file_analysis: formattedFileAnalysis,
              }
            : session
        )
      );
      setCurrentSession((prev) =>
        prev?.id === sessionId
          ? {
              ...prev,
              file_analysis: formattedFileAnalysis,
            }
          : prev
      );
    } catch (error) {
      console.error("Error updating file analysis:", error);
    }
  },
  [user]
);
  // Clear file analysis for a session
  const clearFileAnalysis = useCallback(
    async (sessionId) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("chat_sessions")
          .update({ file_analysis: null })
          .eq("id", sessionId)
          .eq("user_id", user.id);

        if (error) throw error;

        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === sessionId
              ? { ...session, file_analysis: null }
              : session
          )
        );
        setCurrentSession((prev) =>
          prev?.id === sessionId ? { ...prev, file_analysis: null } : prev
        );
      } catch (error) {
        console.error("Error clearing file analysis:", error);
      }
    },
    [user]
  );

  // Switch session
  const switchSession = useCallback(
    (sessionId) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }
    },
    [sessions]
  );

  // Update session name
  const updateSessionName = useCallback(
    async (sessionId, newName) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("chat_sessions")
          .update({ name: newName })
          .eq("id", sessionId)
          .eq("user_id", user.id);

        if (error) throw error;

        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === sessionId ? { ...session, name: newName } : session
          )
        );
        setCurrentSession((prev) =>
          prev?.id === sessionId ? { ...prev, name: newName } : prev
        );
      } catch (error) {
        console.error("Error updating session name:", error);
      }
    },
    [user]
  );

  // Generate session name
  const generateSessionName = useCallback(
    async (sessionId, messageContent) => {
      if (!messageContent || !user) return;

      try {
        const response = await fetch(
          "http://localhost:5000/api/generate-session-name",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: messageContent }),
          }
        );

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        if (data.name) {
          await updateSessionName(sessionId, data.name);
        }
      } catch (error) {
        console.error("Error generating session name:", error);
      }
    },
    [user, updateSessionName]
  );

  // Delete session
  const deleteSession = useCallback(
    async (sessionId) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("chat_sessions")
          .delete()
          .eq("id", sessionId)
          .eq("user_id", user.id);

        if (error) throw error;

        setSessions((prev) =>
          prev.filter((session) => session.id !== sessionId)
        );
        if (currentSession?.id === sessionId) {
          setCurrentSession(sessions[0] || null);
        }
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    },
    [user, currentSession, sessions]
  );

  // Update session personality
  const updateSessionPersonality = useCallback(
    async (sessionId, personality) => {
      if (!user) return;

      try {
        const { error } = await supabase
          .from("chat_sessions")
          .update({ personality })
          .eq("id", sessionId)
          .eq("user_id", user.id);

        if (error) throw error;

        setSessions((prevSessions) =>
          prevSessions.map((session) =>
            session.id === sessionId ? { ...session, personality } : session
          )
        );
        setCurrentSession((prev) =>
          prev?.id === sessionId ? { ...prev, personality } : prev
        );
      } catch (error) {
        console.error("Error updating session personality:", error);
      }
    },
    [user]
  );

  return (
    <ChatSessionsContext.Provider
      value={{
        sessions,
        currentSession,
        createSession,
        updateSession,
        switchSession,
        updateSessionName,
        generateSessionName,
        updateSessionPersonality,
        deleteSession,
        isInitialized,
        updateFileAnalysis,
        clearFileAnalysis,
      }}
    >
      {children}
    </ChatSessionsContext.Provider>
  );
};

export const useChatSessions = () => useContext(ChatSessionsContext);
