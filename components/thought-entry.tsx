"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { formatDistanceToNow, format } from "date-fns";

export interface Thought {
  id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

interface ThoughtEntryProps {
  thought: Thought;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
}

function formatTimestamp(date: string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays < 7) {
    return formatDistanceToNow(d, { addSuffix: true });
  }
  return format(d, "MMM d, yyyy 'at' h:mma").toLowerCase();
}

export function ThoughtEntry({
  thought,
  onEdit,
  onDelete,
  isNew,
}: ThoughtEntryProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(thought.content);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [editing]);

  function handleSave() {
    if (editContent.trim() && editContent.trim() !== thought.content) {
      onEdit(thought.id, editContent.trim());
    }
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditContent(thought.content);
      setEditing(false);
    }
  }

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="group py-4 border-b border-[#141414]"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {editing ? (
        <div>
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => {
              setEditContent(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-[#e0e0e0] text-sm resize-none focus:outline-none leading-relaxed"
          />
          <div className="flex gap-3 mt-2">
            <button
              onClick={handleSave}
              className="text-[10px] text-[#555] hover:text-[#888] transition-colors cursor-pointer"
            >
              save
            </button>
            <button
              onClick={() => {
                setEditContent(thought.content);
                setEditing(false);
              }}
              className="text-[10px] text-[#555] hover:text-[#888] transition-colors cursor-pointer"
            >
              cancel
            </button>
          </div>
        </div>
      ) : (
        <div>
          <p
            className="text-sm text-[#e0e0e0] leading-relaxed whitespace-pre-wrap cursor-pointer"
            onClick={() => {
              setEditContent(thought.content);
              setEditing(true);
            }}
          >
            {thought.content}
          </p>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-[#333]">
              {formatTimestamp(thought.created_at)}
              {thought.updated_at && " (edited)"}
            </span>
            {showActions && (
              <button
                onClick={() => onDelete(thought.id)}
                className="text-[10px] text-[#333] hover:text-red-500/60 transition-colors cursor-pointer"
              >
                delete
              </button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
