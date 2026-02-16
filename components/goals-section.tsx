"use client";

import { useState, useRef, useEffect, useCallback, KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { useTheme, colors } from "@/lib/theme";

export interface Goal {
  id: string;
  content: string;
  completed: boolean;
  created_at: string;
  updated_at: string | null;
  position: number;
}

interface GoalsSectionProps {
  initialGoals: Goal[];
}

export function GoalsSection({ initialGoals }: GoalsSectionProps) {
  const [goals, setGoals] = useState<Goal[]>(initialGoals);
  const [newGoalContent, setNewGoalContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const c = colors(theme);

  useEffect(() => {
    if (editingId && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = textareaRef.current.scrollHeight + "px";
    }
  }, [editingId]);

  const handleAddGoal = useCallback(async () => {
    if (!newGoalContent.trim()) return;

    const res = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: newGoalContent.trim(), position: goals.length }),
    });

    if (res.ok) {
      const newGoal = await res.json();
      setGoals((prev) => [...prev, newGoal]);
      setNewGoalContent("");
    }
  }, [newGoalContent, goals.length]);

  const handleToggleGoal = useCallback(async (id: string, completed: boolean) => {
    const res = await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });

    if (res.ok) {
      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }
  }, []);

  const handleEditGoal = useCallback(async (id: string, content: string) => {
    const res = await fetch("/api/goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, content }),
    });

    if (res.ok) {
      const updated = await res.json();
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)));
    }
  }, []);

  const handleDeleteGoal = useCallback(async (id: string) => {
    const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setGoals((prev) => prev.filter((g) => g.id !== id));
    }
  }, []);

  const handleSaveEdit = useCallback(
    (id: string) => {
      if (editContent.trim() && editContent.trim() !== goals.find((g) => g.id === id)?.content) {
        handleEditGoal(id, editContent.trim());
      }
      setEditingId(null);
    },
    [editContent, goals, handleEditGoal]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>, id: string) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSaveEdit(id);
      }
      if (e.key === "Escape") {
        const goal = goals.find((g) => g.id === id);
        if (goal) setEditContent(goal.content);
        setEditingId(null);
      }
    },
    [goals, handleSaveEdit]
  );

  return (
    <div>
      <h3
        className="text-xs tracking-widest mb-4 pb-3 border-b"
        style={{ color: c.faint, borderColor: c.border }}
      >
        big picture goals
      </h3>

      {/* Add new goal */}
      <div
        className="pb-4 mb-6 border-b transition-colors"
        style={{ borderColor: c.border }}
      >
        <input
          type="text"
          value={newGoalContent}
          onChange={(e) => setNewGoalContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleAddGoal();
            }
          }}
          placeholder="add a goal..."
          className="w-full bg-transparent text-sm focus:outline-none leading-relaxed transition-colors"
          style={{ color: c.text, caretColor: c.text }}
        />
        {newGoalContent.trim() && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px]" style={{ color: c.faint }}>
              press enter to add
            </span>
            <button
              onClick={handleAddGoal}
              className="text-xs hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.muted }}
            >
              add
            </button>
          </div>
        )}
      </div>

      {/* Goals list */}
      <div className="space-y-2">
        {goals.length === 0 ? (
          <p className="text-sm italic py-4" style={{ color: c.faint }}>
            No goals yet
          </p>
        ) : (
          goals.map((goal) => (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="py-2 flex items-start gap-2"
              onMouseEnter={() => setHoveredId(goal.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              {editingId === goal.id ? (
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    value={editContent}
                    onChange={(e) => {
                      setEditContent(e.target.value);
                      e.target.style.height = "auto";
                      e.target.style.height = e.target.scrollHeight + "px";
                    }}
                    onKeyDown={(e) => handleKeyDown(e, goal.id)}
                    className="w-full bg-transparent text-sm resize-none focus:outline-none leading-relaxed transition-colors"
                    style={{ color: c.text }}
                  />
                  <div className="flex gap-3 mt-1">
                    <button
                      onClick={() => handleSaveEdit(goal.id)}
                      className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
                      style={{ color: c.muted }}
                    >
                      save
                    </button>
                    <button
                      onClick={() => {
                        setEditContent(goal.content);
                        setEditingId(null);
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
                    checked={goal.completed}
                    onChange={(e) => handleToggleGoal(goal.id, e.target.checked)}
                    className="mt-1 cursor-pointer"
                    style={{ accentColor: c.muted }}
                  />
                  <div className="flex-1 flex items-start justify-between gap-2">
                    <p
                      className={`text-sm leading-relaxed cursor-pointer transition-colors ${
                        goal.completed ? "line-through opacity-50" : ""
                      }`}
                      style={{ color: c.text }}
                      onClick={() => {
                        setEditContent(goal.content);
                        setEditingId(goal.id);
                      }}
                    >
                      {goal.content}
                    </p>
                    {hoveredId === goal.id && (
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
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
          ))
        )}
      </div>
    </div>
  );
}
