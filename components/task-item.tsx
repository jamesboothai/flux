"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { useTheme, colors } from "@/lib/theme";

export interface WeeklyTask {
  id: string;
  content: string;
  day_of_week: number;
  week_offset: number;
  completed: boolean;
  created_at: string;
  updated_at: string | null;
  parent_task_id: string | null;
  position: number;
  subtasks?: WeeklyTask[];
}

interface TaskItemProps {
  task: WeeklyTask;
  onToggle: (id: string, completed: boolean) => void;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  onAddSubtask?: (parentId: string, content: string) => void;
  isNew?: boolean;
  compact?: boolean;
  depth?: number;
}

export function TaskItem({
  task,
  onToggle,
  onEdit,
  onDelete,
  onAddSubtask,
  isNew,
  compact = false,
  depth = 0,
}: TaskItemProps) {
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(task.content);
  const [showActions, setShowActions] = useState(false);
  const [showSubtaskInput, setShowSubtaskInput] = useState(false);
  const [subtaskContent, setSubtaskContent] = useState("");
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

  const handleAddSubtask = useCallback(() => {
    if (!subtaskContent.trim() || !onAddSubtask) return;
    onAddSubtask(task.id, subtaskContent.trim());
    setSubtaskContent("");
    setShowSubtaskInput(false);
  }, [subtaskContent, onAddSubtask, task.id]);

  return (
    <div
      className={`group ${compact ? "py-1.5" : "py-2"}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Main task row */}
      <div className="flex items-start gap-2">
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
            {depth === 0 && (
              <span
                className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing select-none"
                style={{ color: c.faint, fontSize: compact ? "10px" : "12px", lineHeight: 1, marginTop: "2px" }}
              >
                ⠿
              </span>
            )}
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
      </div>

      {/* Subtask UI - only show if not editing and not compact */}
      {!editing && !compact && onAddSubtask && (
        <div className="ml-6 mt-2">
          {!showSubtaskInput ? (
            <button
              onClick={() => setShowSubtaskInput(true)}
              className="text-[10px] hover:opacity-70 transition-opacity"
              style={{ color: c.faint }}
            >
              + add subtask
            </button>
          ) : (
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={subtaskContent}
                onChange={(e) => setSubtaskContent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                  if (e.key === "Escape") {
                    setShowSubtaskInput(false);
                    setSubtaskContent("");
                  }
                }}
                placeholder="subtask..."
                className="flex-1 text-xs bg-transparent focus:outline-none"
                style={{ color: c.text, caretColor: c.text }}
                autoFocus
              />
              <button
                onClick={handleAddSubtask}
                className="text-[10px] hover:opacity-70"
                style={{ color: c.muted }}
              >
                add
              </button>
            </div>
          )}
        </div>
      )}

      {/* Render subtasks recursively */}
      {task.subtasks && task.subtasks.length > 0 && (
        <div className="ml-6 mt-2 border-l pl-3" style={{ borderColor: c.borderSubtle }}>
          {task.subtasks.map((subtask) => (
            <TaskItem
              key={subtask.id}
              task={subtask}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onAddSubtask={onAddSubtask}
              compact={compact}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
