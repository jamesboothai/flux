"use client";

import { useState, useRef, useCallback, KeyboardEvent } from "react";

interface ThoughtInputProps {
  onSubmit: (content: string) => void;
}

export function ThoughtInput({ onSubmit }: ThoughtInputProps) {
  const [content, setContent] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    <div className="border-b border-[#1a1a1a] pb-6 mb-8">
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
        className="w-full bg-transparent text-[#e0e0e0] text-sm resize-none placeholder-[#333] focus:outline-none leading-relaxed"
      />
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-[#333]">⌘+enter to post</span>
        {content.trim() && (
          <button
            onClick={handleSubmit}
            className="text-xs text-[#555] hover:text-[#888] transition-colors cursor-pointer"
          >
            post
          </button>
        )}
      </div>
    </div>
  );
}
