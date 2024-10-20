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


const ChatInterface = () => {
  const [input, setInput] = useState("");
  const { currentSession, updateSession, generateSessionName } =
    useChatSessions();
  const { sendMessage, isLoading, error } = useAI();
  const scrollAreaRef = useRef(null);
  const [partialResponse, setPartialResponse] = useState("");
  const isFirstMessage = useRef(true);

  useEffect(() => {
    scrollAreaRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentSession?.messages, partialResponse]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentSession) return;

    const userMessage = { role: "user", content: input };
    const updatedMessages = [...currentSession.messages, userMessage];
    updateSession(currentSession.id, updatedMessages);
    setInput("");
    setPartialResponse("");

    try {
      const aiResponse = await sendMessage(
        input,
        (partialResponse) => {
          console.log("Received partial response:", partialResponse);
          setPartialResponse(partialResponse);
        },
        currentSession.personality
      );

      console.log("Full AI response received:", aiResponse);

      const newMessages = [
        ...updatedMessages,
        { role: "assistant", content: aiResponse },
      ];
      updateSession(currentSession.id, newMessages);
      setPartialResponse("");

      // Generate session name after the first AI response
    if (isFirstMessage.current) {
      console.log("Attempting to generate session name...");
      await generateSessionName(currentSession.id);
      isFirstMessage.current = false;
    }
    } catch (error) {
      console.error("Error sending message:", error);
      updateSession(currentSession.id, [
        ...updatedMessages,
        {
          role: "error",
          content:
            error.message || "An error occurred while processing your request",
        },
      ]);
    }
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
    return <div>Initializing chat session...</div>;
  }

  console.log("Current session messages:", currentSession.messages);

  return (
    <Card className="w-full h-[calc(100vh-6rem)] max-w-5xl mx-auto flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle>InsightBot: Your AI Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden">
        <PersonalitySelector />
        <FileUpload
          onFileProcessed={(summary) => {
            updateSession(currentSession.id, [
              ...currentSession.messages,
              { role: "system", content: "File uploaded and analyzed." },
              { role: "assistant", content: summary },
            ]);
          }}
        />
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
                    message.role === "user" ? "bg-primary text-secondary" : "bg-accent"
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
                <div className="mx-2 p-3 rounded-lg bg-green-100 overflow-hidden">
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
          <div ref={scrollAreaRef} />
        </ScrollArea>
      </CardContent>
      <CardFooter>
        <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow"
          />
          <Button type="submit" disabled={isLoading}>
            Send
          </Button>
        </form>
      </CardFooter>
      {error && <div className="text-red-500 mt-2 px-4">{error}</div>}
    </Card>
  );
};

export default ChatInterface;
