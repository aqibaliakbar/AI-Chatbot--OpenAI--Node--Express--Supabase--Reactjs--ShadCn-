import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import {
  Send,
  Upload,
  Bot,
  ChevronUp,
  ChevronDown,
  Settings,
  FileText,
  X,
} from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PersonalitySelector } from "./PersonalitySelector";
import { VoiceInterface } from "./VoiceInterface";
import { useAI } from "../hooks/useAI";
import { useChatSessions } from "../contexts/ChatSessionsContext";
import { NoSessionView } from "./NoSessionUIComponents/NoSessionView";
import { markdownComponents } from "@/lib/markdowncomponent";

const ChatInterface = ({ onSwitchToFileAnalysis }) => {
  const [input, setInput] = useState("");
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const {
    currentSession,
    updateSession,
    updateFileAnalysis,
    generateSessionName,
  } = useChatSessions();
  const { sendMessage, error } = useAI();
  const [partialResponse, setPartialResponse] = useState("");
  const isFirstMessage = useRef(true);
  const messageEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSession?.messages, partialResponse]);

  useEffect(() => {
    if (currentSession?.messages.length === 0) {
      isFirstMessage.current = true;
    }
  }, [currentSession]);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("File size exceeds 10MB limit");
        return;
      }

      const allowedTypes = [".txt", ".pdf", ".doc", ".docx"];
      const fileExtension = selectedFile.name
        .toLowerCase()
        .match(/\.[0-9a-z]+$/);
      if (!fileExtension || !allowedTypes.includes(fileExtension[0])) {
        setError(
          "Invalid file type. Please upload a .txt, .pdf, .doc, or .docx file"
        );
        return;
      }

      setFile(selectedFile);
    }
  };

  const handleFileUpload = async () => {
    if (!file || !currentSession) return;

    setIsLoading(true);
    setUploadProgress(0);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:5000/api/process-file", {
        method: "POST",
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update file analysis in session
      await updateFileAnalysis(currentSession.id, {
        summary: result.summary,
        filename: file.name,
        uploaded_at: new Date().toISOString(),
      });

      // Switch to file analysis mode
      onSwitchToFileAnalysis(result.summary);

      // Clear the file input
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error processing file:", error);
      const errorMessage = {
        role: "error",
        content: `Error uploading file: ${error.message}`,
      };
      await updateSession(currentSession.id, [
        ...currentSession.messages,
        errorMessage,
      ]);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!input.trim() && !file) || !currentSession || isLoading) return;

    if (file) {
      await handleFileUpload();
      return;
    }

    const userMessage = { role: "user", content: input };

    try {
      const updatedMessages = [...currentSession.messages, userMessage];
      await updateSession(currentSession.id, updatedMessages);

      setInput("");
      setPartialResponse("");

      const aiResponse = await sendMessage(
        input,
        setPartialResponse,
        currentSession.personality,
        currentSession.messages
      );

      const newMessages = [
        ...updatedMessages,
        { role: "assistant", content: aiResponse },
      ];
      await updateSession(currentSession.id, newMessages);
      setPartialResponse("");

      if (isFirstMessage.current) {
        isFirstMessage.current = false;
        await generateSessionName(currentSession.id, userMessage.content);
      }

      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      await updateSession(currentSession.id, [
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



  if (!currentSession) {
    return (
      <>
        <NoSessionView />
      </>
    );
  }

  return (
    <Card className="w-full h-[calc(100vh-11rem)] max-w-5xl mx-auto flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="pb-2 border-b">
        <div className="flex justify-between">
          <CardTitle className="flex  items-center gap-2">
            <Bot className="w-6 h-6" />
            InsightBot: Your AI Assistant
          </CardTitle>
          <PersonalitySelector />
        </div>
      </CardHeader>

      <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden pt-4">
        <ScrollArea className="flex-grow px-4">
          <div className="space-y-6">
            {currentSession.messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex items-start max-w-[80%] ${
                    message.role === "user" ? "flex-row-reverse" : ""
                  } gap-3`}
                >
                  <Avatar
                    className={`${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : message.role === "system"
                        ? "bg-blue-500/90 text-white"
                        : "bg-red-800/90 text-white"
                    } w-8 h-8 flex items-center justify-center shadow-sm`}
                  >
                    {message.role === "user"
                      ? "U"
                      : message.role === "system"
                      ? "S"
                      : "AI"}
                  </Avatar>
                  <div
                    className={`p-4 rounded-lg shadow-sm ${
                      message.role === "user"
                        ? "bg-background border border-primary"
                        : message.role === "system"
                        ? "bg-blue-500/10"
                        : "bg-muted"
                    }`}
                  >
                    {message.role === "user" ? (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    ) : (
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                        components={markdownComponents}
                        className="markdown-content prose prose-zinc dark:prose-invert  max-w-none"
                      >
                        {message.content}
                      </ReactMarkdown>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {partialResponse && (
              <div className="flex justify-start">
                <div className="flex items-start max-w-[80%] gap-3">
                  <Avatar className="bg-red-800/90 w-8 h-8 text-white flex items-center justify-center shadow-sm">
                    AI
                  </Avatar>
                  <div className="p-4 rounded-lg shadow-sm bg-muted">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={markdownComponents}
                      className="markdown-content prose prose-zinc dark:prose-invert max-w-none"
                    >
                      {partialResponse}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
            <div ref={messageEndRef} />
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="border-t p-4 flex flex-col gap-4">
        <Collapsible
          open={showControls}
          onOpenChange={setShowControls}
          className="w-full space-y-2"
        >
          <div className="flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Controls
                {showControls ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          </div>

          <CollapsibleContent className="space-y-2">
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
          </CollapsibleContent>
        </Collapsible>

        <form onSubmit={handleSendMessage} className="w-full space-y-2">
          <div className="flex items-center space-x-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
              disabled={isLoading}
            />
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".txt,.pdf,.doc,.docx"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              <Upload className="w-4 h-4" />
            </Button>
            <Button type="submit" disabled={isLoading} className="px-6">
              {isLoading ? (
                <Bot className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="flex-grow">
                <p className="font-medium">Selected file: {file.name}</p>
                {isLoading && (
                  <Progress value={uploadProgress} className="h-1 mt-1" />
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFile(null);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = "";
                  }
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </form>
      </CardFooter>

      {error && (
        <div className="px-4 py-2 text-sm text-red-500 bg-red-500/10 border-t">
          {error}
        </div>
      )}
    </Card>
  );
};

export default ChatInterface;
