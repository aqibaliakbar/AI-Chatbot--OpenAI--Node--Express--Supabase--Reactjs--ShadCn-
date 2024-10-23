import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import { useChatSessions } from "../contexts/ChatSessionsContext";
import { useAI } from "../hooks/useAI";
import { PersonalitySelector } from "./PersonalitySelector";
import { FileUpload } from "./FileUpload";
import { VoiceInterface } from "./VoiceInterface";

const ChatInterface = ({ onSwitchToFileAnalysis }) => {
  const [input, setInput] = useState("");
  const { currentSession, updateSession, generateSessionName } =
    useChatSessions();
  const { sendMessage, isLoading, error } = useAI();
  const scrollAreaRef = useRef(null);
  const [partialResponse, setPartialResponse] = useState("");
  const isFirstMessageRef = useRef(true);
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSession?.messages, partialResponse]);

  useEffect(() => {
    if (currentSession?.messages.length === 0) {
      isFirstMessageRef.current = true;
    }
  }, [currentSession]);

  const isFirstMessage = useRef(true);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentSession || isLoading) return;

    const userMessage = { role: "user", content: input };

    try {
      // First update messages with user input
      const updatedMessages = [...currentSession.messages, userMessage];
      await updateSession(currentSession.id, updatedMessages);

      // Clear input and partial response
      setInput("");
      setPartialResponse("");

      // Get AI response
       const aiResponse = await sendMessage(
         input,
         (partialResponse) => {
           console.log("Received partial response:", partialResponse);
           setPartialResponse(partialResponse);
         },
         currentSession.personality,
         currentSession.messages // Pass previous messages for context
       );

      // Update messages with AI response
      const newMessages = [
        ...updatedMessages,
        { role: "assistant", content: aiResponse },
      ];
      await updateSession(currentSession.id, newMessages);
      setPartialResponse("");

      // Handle session naming for first message
      if (isFirstMessage.current) {
        isFirstMessage.current = false;
        // Generate name based on the user's message
        await generateSessionName(currentSession.id, userMessage.content);
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      updateSession(currentSession.id, [
        ...currentSession.messages,
        userMessage,
        {
          role: "error",
          content:
            error.message || "An error occurred while processing your request",
        },
      ]);
    }
  };



  // Reset first message flag when switching sessions
  useEffect(() => {
    if (currentSession?.messages.length === 0) {
      isFirstMessage.current = true;
    }
  }, [currentSession]);

  // Reset first message flag when switching sessions
  useEffect(() => {
    if (currentSession?.messages.length === 0) {
      isFirstMessage.current = true;
    }
  }, [currentSession]);

  const handleFileProcessed = (summary) => {
    updateSession(currentSession.id, [
      ...currentSession.messages,
      { role: "system", content: "File uploaded and analyzed." },
      { role: "assistant", content: summary },
    ]);
    onSwitchToFileAnalysis(summary);
  };

  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="code-block-wrapper">
          <SyntaxHighlighter
            style={atomDark}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  if (!currentSession) {
    return <div>Loading chat session...</div>;
  }

  return (
    <Card className="w-full h-[calc(100vh-11rem)] max-w-5xl mx-auto flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>InsightBot: Your AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden">
        <PersonalitySelector />
        <FileUpload onFileProcessed={handleFileProcessed} />
        <VoiceInterface
          onSpeechRecognized={setInput}
          onTextToSpeech={(speakFunction) => {
            const lastAIMessage = currentSession.messages
              .filter((msg) => msg.role === "assistant")
              .pop();
            if (lastAIMessage) {
              speakFunction(lastAIMessage.content);
            }
          }}
        />
        <ScrollArea className="flex-grow">
          {currentSession.messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              } mb-4`}
            >
              <div
                className={`flex items-start max-w-[80%] ${
                  message.role === "user" ? "flex-row-reverse" : ""
                }`}
              >
                <Avatar
                  className={`${
                    message.role === "user" ? "bg-black" : "bg-red-800"
                  } w-8 h-8 text-white flex items-center justify-center`}
                >
                  {message.role === "user" ? "U" : "AI"}
                </Avatar>
                <div
                  className={`mx-2 p-3 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-secondary"
                      : "bg-accent"
                  } overflow-hidden`}
                >
                  {message.role === "user" ? (
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  ) : (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={renderers}
                      className="markdown-content"
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            </div>
          ))}
          {partialResponse && (
            <div className="flex justify-start mb-4">
              <div className="flex items-start max-w-[80%]">
                <Avatar className="bg-red-800 w-8 h-8 text-white flex items-center justify-center">
                  AI
                </Avatar>
                <div className="mx-2 p-3 rounded-lg bg-accent overflow-hidden">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={renderers}
                    className="markdown-content"
                  >
                    {partialResponse}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </form>
      </CardFooter>
      {error && <div className="text-red-500 mt-2 px-4">{error}</div>}
    </Card>
  );
};

export default ChatInterface;
