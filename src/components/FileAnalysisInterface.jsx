
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
// import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { 
  AlertCircle, 
  Bot, 
  Send, 
  ArrowLeft,
  FileText,
  Clock,
  Upload,
  Copy,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { useChatSessions } from "@/contexts/ChatSessionsContext";
import { markdownComponents } from "@/lib/markdowncomponent";

// Custom hook for file analysis
const useFileAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeFile = useCallback(async (summary, query, onPartialResponse, messages = []) => {
    setIsLoading(true);
    setError(null);
    let fullResponse = "";

    try {
      const response = await fetch("http://localhost:5000/api/analyze-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary,
          query,
          messages
        }),
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
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.trim() === "") continue;
          if (line.trim() === "data: [DONE]") {
            setIsLoading(false);
            return fullResponse;
          }
          if (line.startsWith("data: ")) {
            try {
              const jsonStr = line.slice(6);
              const parsed = JSON.parse(jsonStr);
              if (parsed.choices?.[0]?.delta?.content) {
                const content = parsed.choices[0].delta.content;
                fullResponse += content;
                onPartialResponse(fullResponse);
              }
            } catch (error) {
              console.error("Error parsing SSE message:", error, line);
            }
          }
        }
      }

      setIsLoading(false);
      return fullResponse;
    } catch (err) {
      console.error("Error in analyzeFile:", err);
      setIsLoading(false);
      setError(err.message);
      throw err;
    }
  }, []);

  return { analyzeFile, isLoading, error };
};

const FileAnalysisInterface = ({ onReturnToChat }) => {
  const [input, setInput] = useState("");
  const [partialResponse, setPartialResponse] = useState("");
  const [analysisMessages, setAnalysisMessages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState(null);
  const messageEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const { analyzeFile, isLoading, error } = useFileAnalysis();
  const { currentSession, updateFileAnalysis, generateSessionName } = useChatSessions();

  // Initialize messages when session changes
  useEffect(() => {
    if (currentSession?.file_analysis) {
      const mainDocument = {
        role: "system",
        content: `📄 Main Document: ${currentSession.file_analysis.filename}\n\n${currentSession.file_analysis.summary}`,
        isMainDocument: true,
      };

      const messages = currentSession.file_analysis.messages || [];
      setAnalysisMessages([mainDocument, ...messages]);
    }
  }, [currentSession?.id]);

  useEffect(() => {
    const initializeSession = async () => {
      if (
        currentSession?.file_analysis &&
        (!currentSession.name || currentSession.name === "New Chat")
      ) {
        await generateSessionName(
          currentSession.id,
          `File Analysis: ${
            currentSession.file_analysis.filename
          } - ${currentSession.file_analysis.summary.slice(0, 100)}`
        );
      }
    };

    initializeSession();
  }, [currentSession?.id, currentSession?.file_analysis]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [analysisMessages, partialResponse]);

const handleFileSelect = async (e) => {
  const selectedFile = e.target.files?.[0];
  if (!selectedFile || !currentSession?.file_analysis) return;

  if (selectedFile.size > 10 * 1024 * 1024) {
    setUploadError("File size exceeds 10MB limit");
    return;
  }

  const allowedTypes = [".txt", ".pdf", ".doc", ".docx"];
  const fileExtension = selectedFile.name.toLowerCase().match(/\.[0-9a-z]+$/);
  if (!fileExtension || !allowedTypes.includes(fileExtension[0])) {
    setUploadError(
      "Invalid file type. Please upload a .txt, .pdf, .doc, or .docx file"
    );
    return;
  }

  setIsUploading(true);
  setUploadProgress(0);
  setUploadError(null);
  const formData = new FormData();
  formData.append("file", selectedFile);

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

    // Create message for additional document
    const additionalFileMessage = {
      role: "system",
      content: `📄 Additional Document: ${selectedFile.name}\n\n${result.summary}`,
      isAdditionalFile: true,
    };

    // Get existing messages excluding the main document
    const existingMessages = analysisMessages.filter(
      (msg) => !msg.isMainDocument
    );
    const updatedMessages = [...existingMessages, additionalFileMessage];

    // Update local state with new messages
    setAnalysisMessages(
      [
        analysisMessages.find((msg) => msg.isMainDocument), // Keep main document
        ...updatedMessages,
      ].filter(Boolean)
    );

    // Update file analysis in database
    await updateFileAnalysis(currentSession.id, {
      ...currentSession.file_analysis,
      messages: updatedMessages, // Save all messages except main document
    });
  } catch (error) {
    console.error("Error processing file:", error);
    setUploadError(error.message);

    const errorMessage = {
      role: "error",
      content: `Error processing file: ${error.message}`,
    };

    // Update messages with error
    const updatedMessages = [
      ...analysisMessages.filter((msg) => !msg.isMainDocument),
      errorMessage,
    ];

    setAnalysisMessages(
      [
        analysisMessages.find((msg) => msg.isMainDocument),
        ...updatedMessages,
      ].filter(Boolean)
    );

    // Update database even with error
    await updateFileAnalysis(currentSession.id, {
      ...currentSession.file_analysis,
      messages: updatedMessages,
    });
  } finally {
    setIsUploading(false);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }
};


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!input.trim() || isLoading || !currentSession?.file_analysis) return;

  const userQuery = input.trim();
  const userMessage = { role: "user", content: userQuery };

  try {
    // Clear input immediately
    setInput("");

    // Add user message immediately
    const messagesWithUser = [...analysisMessages, userMessage];
    setAnalysisMessages(messagesWithUser);

    // Clear any existing partial response
    setPartialResponse("");

    let responseText = "";
    await analyzeFile(
      currentSession.file_analysis.summary,
      userQuery,
      (partial) => {
        // Only update partial response, don't set full message yet
        if (partial !== responseText) {
          // Only update if changed
          responseText = partial;
          setPartialResponse(partial);
        }
      },
      analysisMessages
    );

    // Once streaming is complete, clear partial response and add AI message
    setPartialResponse("");

    if (responseText) {
      const aiMessage = { role: "assistant", content: responseText };
      const updatedMessages = [...messagesWithUser, aiMessage];

      setAnalysisMessages(updatedMessages);

      // Update database
      await updateFileAnalysis(currentSession.id, {
        ...currentSession.file_analysis,
        messages: updatedMessages.filter((msg) => !msg.isMainDocument),
      });
    }

    if (inputRef.current) {
      inputRef.current.focus();
    }
  } catch (error) {
    console.error("Error analyzing file:", error);

    const errorMessage = {
      role: "error",
      content: `Error analyzing file: ${error.message}`,
    };

    const updatedMessages = [...analysisMessages, userMessage, errorMessage];
    setAnalysisMessages(updatedMessages);

    await updateFileAnalysis(currentSession.id, {
      ...currentSession.file_analysis,
      messages: updatedMessages.filter((msg) => !msg.isMainDocument),
    });
  }
};

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // const markdownComponents = {
  //   code({ node, inline, className, children, ...props }) {
  //     const match = /language-(\w+)/.exec(className || "");
  //     return !inline && match ? (
  //       <div className="code-block-wrapper relative group">
  //         <SyntaxHighlighter
  //           style={atomDark}
  //           language={match[1]}
  //           PreTag="div"
  //           {...props}
  //         >
  //           {String(children).replace(/\n$/, "")}
  //         </SyntaxHighlighter>
  //         <Button
  //           variant="ghost"
  //           size="sm"
  //           className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
  //           onClick={() => {
  //             navigator.clipboard.writeText(String(children));
  //           }}
  //         >
  //           Copy
  //         </Button>
  //       </div>
  //     ) : (
  //       <code className={className} {...props}>
  //         {children}
  //       </code>
  //     );
  //   },
  // };

// Use in ReactMarkdown component

  if (!currentSession?.file_analysis) {
    return (
      <Card className="w-full h-[calc(100vh-11rem)] max-w-5xl mx-auto flex flex-col bg-background/95 backdrop-blur ">
        <CardHeader className="pb-2 border-b">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6" />
              File Analysis
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReturnToChat}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Chat
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center flex-grow">
          <div className="text-center space-y-4">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-medium">No File Analysis Available</h3>
            <p className="text-sm text-muted-foreground">
              Please upload a file in chat mode to analyze it.
            </p>
            <Button onClick={onReturnToChat}>Return to Chat</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-[calc(100vh-11rem)] max-w-5xl mx-auto flex flex-col bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <CardHeader className="pb-2 border-b">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6" />
            File Analysis
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onReturnToChat}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Chat
          </Button>
        </CardTitle>
   
      </CardHeader>

      <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden pt-4">
        <div className="px-4">
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept=".txt,.pdf,.doc,.docx"
              className="hidden"
            />
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              disabled={isUploading}
              className="w-full flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Bot className="w-4 h-4 animate-spin" />
                  Uploading additional document...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Additional Document
                </>
              )}
            </Button>
          </div>
          {isUploading && (
            <Progress value={uploadProgress} className="mt-2 h-1" />
          )}
          {uploadError && (
            <Alert variant="destructive" className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{uploadError}</AlertDescription>
            </Alert>
          )}
        </div>

        <ScrollArea className="flex-grow px-4">
          <div className="space-y-6">
            {analysisMessages.map((message, index) => (
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
                        ? message.isMainDocument
                          ? "bg-blue-600/90 text-white"
                          : "bg-blue-500/90 text-white"
                        : message.role === "error"
                        ? "bg-red-500/90 text-white"
                        : "bg-red-800/90 text-white"
                    } w-8 h-8 flex items-center justify-center shadow-sm`}
                  >
                    {message.role === "user"
                      ? "U"
                      : message.role === "system"
                      ? message.isMainDocument
                        ? "M"
                        : "D"
                      : message.role === "error"
                      ? "!"
                      : "AI"}
                  </Avatar>
                  <div
                    className={`p-4  rounded-lg shadow-sm ${
                      message.role === "user"
                        ? "bg-background border border-primary  "
                        : message.role === "system"
                        ? message.isMainDocument
                          ? "bg-blue-600/10 border border-blue-600/20"
                          : "bg-blue-500/10"
                        : message.role === "error"
                        ? "bg-red-500/10 text-red-500"
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
                        className="markdown-content prose prose-zinc dark:prose-invert max-w-none"
                      >
                        {message.content}
                      </ReactMarkdown>)}
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
        {error && (
          <Alert variant="destructive" className="mb-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="w-full">
          <div className="flex items-center space-x-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask questions about the analyzed documents..."
              className="flex-grow"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="px-6"
            >
              {isLoading ? (
                <Bot className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </div>
        </form>

        {isLoading && (
          <div className="space-y-2">
            <Progress value={75} className="h-1" />
            <p className="text-sm text-muted-foreground text-center">
              Analyzing your query...
            </p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default FileAnalysisInterface;