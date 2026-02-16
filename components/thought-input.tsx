"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";
import { useTheme, colors } from "@/lib/theme";

interface ThoughtInputProps {
  onSubmit: (content: string) => void;
}

export function ThoughtInput({ onSubmit }: ThoughtInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const c = colors(theme);

  const handleSubmit = useCallback(() => {
    if (!content.trim()) return;
    onSubmit(content.trim());
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [content, onSubmit]);

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleInput() {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }

  return (
    <div
      className="pb-6 mb-8 border-b transition-colors"
      style={{ borderColor: c.border }}
    >
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          handleInput();
        }}
        onKeyDown={handleKeyDown}
        placeholder="what's on your mind..."
        autoFocus
        rows={1}
        className="w-full bg-transparent text-sm resize-none focus:outline-none leading-relaxed transition-colors"
        style={{ color: c.text, caretColor: c.text }}
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px]" style={{ color: c.faint }}>
          ⌘+enter to post
        </span>
        {content.trim() && (
          <button
            onClick={handleSubmit}
            className="text-xs hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: c.muted }}
          >
            post
          </button>
        )}
      </div>
    </div>
  );
}
