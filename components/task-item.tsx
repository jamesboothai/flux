"use client";

import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { useTheme, colors } from "@/lib/theme";

export interface WeeklyTask {
  id: string;
  content: string;
  day_of_week: number;
  week_offset: number;
  completed: boolean;
  created_at: string;
  updated_at: string | null;
}

interface TaskItemProps {
  task: WeeklyTask;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  isNew?: boolean;
  compact?: boolean;
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  isNew,
  compact = false,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [showActions, setShowActions] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const c = colors(theme);

  useEffect(() => {
    if (editing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [editing]);

  function handleSave() {
    if (editContent.trim() && editContent.trim() !== task.content) {
      onEdit(task.id, editContent.trim());
    }
    setEditing(false);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === "Escape") {
      setEditContent(task.content);
      setEditing(false);
    }
  }

  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: -8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`group ${compact ? "py-1.5" : "py-2"} flex items-start gap-2`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {editing ? (
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={editContent}
            onChange={(e) => {
              setEditContent(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onKeyDown={handleKeyDown}
            className={`w-full bg-transparent ${
              compact ? "text-xs" : "text-sm"
            } resize-none focus:outline-none leading-relaxed transition-colors`}
            style={{ color: c.text }}
          />
          <div className="flex gap-3 mt-1">
            <button
              onClick={handleSave}
              className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.muted }}
            >
              save
            </button>
            <button
              onClick={() => {
                setEditContent(task.content);
                setEditing(false);
              }}
              className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.muted }}
            >
              cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={(e) => onToggle(task.id, e.target.checked)}
            className="mt-1 cursor-pointer"
            style={{ accentColor: c.muted }}
          />
          <div className="flex-1 flex items-start justify-between gap-2">
            <p
              className={`${
                compact ? "text-xs" : "text-sm"
              } leading-relaxed cursor-pointer transition-colors ${
                task.completed ? "line-through opacity-50" : ""
              }`}
              style={{ color: c.text }}
              onClick={() => {
                setEditContent(task.content);
                setEditing(true);
              }}
            >
              {task.content}
            </p>
            {showActions && (
              <button
                onClick={() => onDelete(task.id)}
                className="text-[10px] hover:text-red-500/60 transition-colors cursor-pointer shrink-0"
                style={{ color: c.faint }}
              >
                delete
              </button>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}
