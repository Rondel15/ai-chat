import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button onClick={copy} className="text-[10px] text-muted hover:text-soft transition-colors px-2 py-1 rounded">
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ children, className }) {
  const language = className?.replace("language-", "") || "text";
  const code = String(children).replace(/\n$/, "");
  return (
    <div className="relative my-2 rounded-lg overflow-hidden border border-border">
      <div className="flex items-center justify-between px-3 py-1.5 bg-card border-b border-border">
        <span className="text-[10px] text-muted font-mono">{language}</span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{ margin: 0, background: "#0d1117", fontSize: "0.8rem", padding: "1rem" }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MessageBubble({ message, isStreaming }) {
  const isUser = message.role === "user";

  return (
    <div className={`flex gap-3 msg-appear ${isUser ? "flex-row-reverse" : ""}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-1 ${isUser ? "bg-accent text-surface" : "bg-card border border-border text-soft"}`}>
        {isUser ? "U" : "AI"}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-accent text-surface rounded-tr-sm font-medium"
            : "bg-card border border-border text-soft rounded-tl-sm prose-chat"
        }`}>
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ inline, className, children }) {
                  return inline
                    ? <code className={className}>{children}</code>
                    : <CodeBlock className={className}>{children}</CodeBlock>;
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
          {isStreaming && <span className="typing-cursor" />}
        </div>
      </div>
    </div>
  );
}
