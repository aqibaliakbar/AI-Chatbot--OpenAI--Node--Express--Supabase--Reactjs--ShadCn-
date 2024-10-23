// ChatSessionsContext.jsx
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
  const [isInitialized, setIsInitialized] = useState(false); // Add initialization flag

  // Modified createSession to be more controlled
  const createSession = useCallback(() => {
    console.log("Creating new session");
    const newSession = {
      id: Date.now(),
      name: "New Chat",
      messages: [],
      personality: "default",
    };

    setSessions((prevSessions) => [...prevSessions, newSession]);
    setCurrentSession(newSession);
    return newSession;
  }, []);

  // Modified initialization effect
  useEffect(() => {
    if (!isInitialized) {
      if (sessions.length === 0) {
        const newSession = {
          id: Date.now(),
          name: "New Chat",
          messages: [],
          personality: "default",
        };
        setSessions([newSession]);
        setCurrentSession(newSession);
      }
      setIsInitialized(true);
    }
  }, [isInitialized]);

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

  // Modified generateSessionName to fix the naming issue
const generateSessionName = useCallback(async (sessionId, messageContent) => {
  console.log(`Generating session name for session ${sessionId}`);

  if (!messageContent) {
    console.error("No message content provided for session naming");
    return;
  }

  try {
    console.log("Making API request with message:", messageContent);

    const response = await fetch(
      "http://localhost:5000/api/generate-session-name",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: messageContent }),
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Generated session name: "${data.name}"`);

    if (data.name) {
      console.log(`Updating session ${sessionId} with new name: ${data.name}`);
      setSessions((prevSessions) =>
        prevSessions.map((session) =>
          session.id === sessionId ? { ...session, name: data.name } : session
        )
      );
      setCurrentSession((prevSession) =>
        prevSession?.id === sessionId
          ? { ...prevSession, name: data.name }
          : prevSession
      );
    }
  } catch (error) {
    console.error("Error generating session name:", error);
  }
}, []);

  // Add updateSessionPersonality function
  const updateSessionPersonality = useCallback((sessionId, personality) => {
    console.log(
      `Updating personality for session ${sessionId} to ${personality}`
    );
    setSessions((prevSessions) =>
      prevSessions.map((session) =>
        session.id === sessionId ? { ...session, personality } : session
      )
    );
    setCurrentSession((prevSession) =>
      prevSession?.id === sessionId
        ? { ...prevSession, personality }
        : prevSession
    );
  }, []);

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
      }}
    >
      {children}
    </ChatSessionsContext.Provider>
  );
};

export const useChatSessions = () => useContext(ChatSessionsContext);
