import { Button } from "@mui/material";
import { Loader2, ArrowUpRight, Copy } from "lucide-react";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "./utils";

export const markdownComponents = {
  h1: ({ children }) => <h1 className="scroll-m-20">{children}</h1>,
  
  code({ inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    if (!inline && match) {
      return (
        <div className="relative group">
          <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigator.clipboard.writeText(String(children))}
              className="h-7 w-7 p-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <SyntaxHighlighter
            language={match[1]}
            style={atomDark}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },

  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 hover:gap-2 transition-all"
      >
        {children}
        <ArrowUpRight className="w-3 h-3" />
      </a>
    );
  },

  img: function ImageComponent({ src, alt }) {
    const [isLoading, setIsLoading] = useState(true);
    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        <img
          src={src}
          alt={alt}
          onLoad={() => setIsLoading(false)}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100"
          )}
        />
      </div>
    );
  }
};