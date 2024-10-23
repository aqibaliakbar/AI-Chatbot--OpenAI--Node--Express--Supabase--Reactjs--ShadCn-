import { useState, useCallback } from "react";

const personalityPrompts = {
  analyst:
    "You are a data analyst. Focus on providing insights, statistics, and data-driven answers.",
  teacher:
    "You are a teacher. Explain concepts clearly and provide educational responses.",
  creative:
    "You are a creative writer. Provide imaginative and artistic responses.",
  coder:
    "You are a programmer. Provide code examples and technical explanations.",
  default: "You are a helpful AI assistant.",
};

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPersonality, setCurrentPersonality] = useState("default");

  const sendMessage = useCallback(
    async (message, onPartialResponse, personality = currentPersonality, previousMessages = []) => {
      setIsLoading(true);
      setError(null);
      let fullResponse = "";

      try {
        const personalityPrompt = personalityPrompts[personality] || personalityPrompts.default;
        
        // Combine previous messages with the new message
        const messages = [
          { role: "system", content: personalityPrompt },
          ...previousMessages,
          { role: "user", content: message }
        ];

        console.log("Sending message with context:", messages);

        const response = await fetch("http://localhost:5000/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messages }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop();

          for (const line of lines) {
            if (line.trim() === "") continue;
            if (line.trim() === "data: [DONE]") {
              setIsLoading(false);
              return fullResponse;
            }
            if (line.startsWith("data: ")) {
              try {
                const parsed = JSON.parse(line.slice(6));
                if (parsed.content) {
                  fullResponse += parsed.content;
                  onPartialResponse(fullResponse);
                }
              } catch (error) {
                console.error("Error parsing SSE message:", error);
              }
            }
          }
        }

        setIsLoading(false);
        return fullResponse;
      } catch (err) {
        console.error("Error in sendMessage:", err);
        setIsLoading(false);
        setError(err.message);
        throw err;
      }
    },
    [currentPersonality]
  );

  return {
    sendMessage,
    isLoading,
    error,
    setCurrentPersonality,
    currentPersonality,
  };
};
