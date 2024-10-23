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
import { FileUpload } from "./FileUpload";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Custom hook for file analysis
const useFileAnalysis = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyzeFile = useCallback(async (summary, query, onPartialResponse) => {
    setIsLoading(true);
    setError(null);
    let fullResponse = "";

    try {
      console.log("Analyzing file with query:", query);
      const response = await fetch("http://localhost:5000/api/analyze-file", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary,
          query,
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
              if (
                parsed.choices &&
                parsed.choices[0].delta &&
                parsed.choices[0].delta.content
              ) {
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

  return {
    analyzeFile,
    isLoading,
    error,
  };
};

const FileAnalysisInterface = ({ initialSummary, onReturn }) => {
  const [fileMessages, setFileMessages] = useState([
    { role: "assistant", content: initialSummary },
  ]);
  const [input, setInput] = useState("");
  const [partialResponse, setPartialResponse] = useState("");
  const messageEndRef = useRef(null);
  const { analyzeFile, isLoading, error } = useFileAnalysis();

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [fileMessages, partialResponse]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userQuery = input.trim();
    setFileMessages((prev) => [...prev, { role: "user", content: userQuery }]);
    setInput("");
    setPartialResponse("");

    try {
      let responseText = "";
      await analyzeFile(fileMessages[0].content, userQuery, (partial) => {
        console.log("Received partial response:", partial);
        responseText = partial;
        setPartialResponse(partial);
      });

      console.log("Final response:", responseText);

      if (responseText) {
        setFileMessages((prev) => [
          ...prev,
          { role: "assistant", content: responseText },
        ]);
      }
      setPartialResponse("");
    } catch (error) {
      console.error("Error analyzing file:", error);
      setFileMessages((prev) => [
        ...prev,
        {
          role: "error",
          content: `Error analyzing file: ${error.message}`,
        },
      ]);
    }
  };

  const handleFileProcessed = (summary) => {
    console.log("New file processed with summary:", summary);
    setFileMessages([
      { role: "assistant", content: summary },
      { role: "system", content: "New file processed and analyzed." },
    ]);
  };

  const renderers = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <div className="code-block-wrapper relative group">
          <SyntaxHighlighter
            style={atomDark}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => {
              navigator.clipboard.writeText(String(children));
            }}
          >
            Copy
          </Button>
        </div>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  return (
    <Card className="w-full h-[calc(100vh-4rem)] max-w-5xl mx-auto flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>File Analysis</CardTitle>
          <Button variant="outline" onClick={onReturn}>
            Return to Chat
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col space-y-4 overflow-hidden">
        <ScrollArea className="flex-grow">
          {fileMessages.map((message, index) => (
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
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={renderers}
                    className="markdown-content"
                  >
                    {message.content || ""}
                  </ReactMarkdown>
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
        <FileUpload onFileProcessed={handleFileProcessed} />
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <form onSubmit={handleSubmit} className="flex w-full space-x-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the file..."
            className="flex-grow"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Analyzing..." : "Send"}
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
};

export default FileAnalysisInterface;
