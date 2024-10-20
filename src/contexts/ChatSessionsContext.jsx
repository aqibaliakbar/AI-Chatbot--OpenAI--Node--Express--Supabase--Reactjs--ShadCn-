import React, {
  createContext,
  useState,
  useContext,
  useCallback,
  useEffect,
} from "react";

const ChatSessionsContext = createContext();

export const ChatSessionsProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);

  const createSession = useCallback(() => {
    console.log("Creating new session");
    const newSession = {
      id: Date.now(),
      name: "New Chat",
      messages: [],
      personality: "default",
    };
    setSessions((prevSessions) => {
      if (prevSessions.length === 0) {
        return [newSession];
      }
      return prevSessions;
    });
    setCurrentSession(newSession);
  }, []);

  useEffect(() => {
    if (sessions.length === 0 && !currentSession) {
      createSession();
    }
  }, [sessions, currentSession, createSession]);

  const updateSession = useCallback((sessionId, messages) => {
    return new Promise((resolve) => {
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId ? { ...session, messages } : session
        )
      );
      setCurrentSession((prevSession) =>
        prevSession?.id === sessionId
          ? { ...prevSession, messages }
          : prevSession
      );
      resolve();
    });
  }, []);

  const switchSession = useCallback(
    (sessionId) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setCurrentSession(session);
      }
    },
    [sessions]
  );

  const updateSessionName = useCallback((sessionId, newName) => {
    console.log(
      `Updating session name for session ${sessionId} to "${newName}"`
    );
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, name: newName } : session
      )
    );
    setCurrentSession((prevSession) =>
      prevSession?.id === sessionId
        ? { ...prevSession, name: newName }
        : prevSession
    );
  }, []);

const generateSessionName = useCallback(
  async (sessionId) => {
    console.log(`Generating session name for session ${sessionId}`);
    const session = sessions.find((s) => s.id === sessionId);
    if (session && session.messages.length > 0) {
      const lastMessage = session.messages[session.messages.length - 1].content;
      try {
        const response = await fetch(
          "http://localhost:5000/api/generate-session-name",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: lastMessage }),
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log(`Generated session name: "${data.name}"`);
        await updateSessionName(sessionId, data.name);
      } catch (error) {
        console.error("Error generating session name:", error);
      }
    } else {
      console.log("No messages in session or session not found");
    }
  },
  [sessions, updateSessionName]
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
      }}
    >
      {children}
    </ChatSessionsContext.Provider>
  );
};

export const useChatSessions = () => useContext(ChatSessionsContext);
