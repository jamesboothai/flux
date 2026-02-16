"use client";

import { useState, useEffect, useCallback } from "react";
import { useTheme, colors } from "@/lib/theme";
import { WeeklyTask } from "./task-item";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import {
  formatWeekRange,
  getWeekDates,
  getTodayDayOfWeek,
} from "@/lib/week-utils";

interface WeeklyPlannerProps {
  initialTasks: WeeklyTask[];
}

type ViewMode = "day" | "week";

export function WeeklyPlanner({ initialTasks }: WeeklyPlannerProps) {
  const [tasks, setTasks] = useState<WeeklyTask[]>(initialTasks);
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentDay, setCurrentDay] = useState(getTodayDayOfWeek());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const { theme } = useTheme();
  const c = colors(theme);

  // Load view preference from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("flux-tasks-view") as ViewMode | null;
    if (saved) setViewMode(saved);
  }, []);

  // Save view preference to localStorage
  const toggleView = useCallback(() => {
    setViewMode((mode) => {
      const next = mode === "day" ? "week" : "day";
      localStorage.setItem("flux-tasks-view", next);
      return next;
    });
  }, []);

  // Fetch tasks when week changes
  useEffect(() => {
    async function fetchTasks() {
      const res = await fetch(`/api/tasks?week=${weekOffset}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    }
    fetchTasks();
  }, [weekOffset]);

  const handleAddTask = useCallback(
    async (content: string, dayOfWeek: number) => {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, day_of_week: dayOfWeek, week_offset: weekOffset }),
      });

      if (res.ok) {
        const newTask = await res.json();
        setTasks((prev) => [...prev, newTask]);
      }
    },
    [weekOffset]
  );

  const handleToggleTask = useCallback(async (id: string, completed: boolean) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  }, []);

  const handleEditTask = useCallback(async (id: string, content: string) => {
    const res = await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, content }),
    });

    if (res.ok) {
      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    }
  }, []);

  const handleDeleteTask = useCallback(async (id: string) => {
    const res = await fetch(`/api/tasks?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setTasks((prev) => prev.filter((t) => t.id !== id));
    }
  }, []);

  const weekDates = getWeekDates(weekOffset);
  const weekRange = formatWeekRange(weekDates);

  return (
    <div>
      {/* Header with navigation and view toggle */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-medium" style={{ color: c.text }}>
            {weekRange}
          </h2>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => setWeekOffset((w) => w - 1)}
              className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.muted }}
            >
              ← prev week
            </button>
            {weekOffset !== 0 && (
              <button
                onClick={() => setWeekOffset(0)}
                className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: c.muted }}
              >
                current week
              </button>
            )}
            <button
              onClick={() => setWeekOffset((w) => w + 1)}
              className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.muted }}
            >
              next week →
            </button>
          </div>
        </div>

        <button
          onClick={toggleView}
          className="text-[10px] tracking-wider hover:opacity-70 transition-opacity cursor-pointer"
          style={{ color: c.faint }}
        >
          {viewMode === "day" ? "week view" : "day view"}
        </button>
      </div>

      {/* Render appropriate view */}
      {viewMode === "day" ? (
        <DayView
          tasks={tasks}
          currentDay={currentDay}
          weekOffset={weekOffset}
          onDayChange={setCurrentDay}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      ) : (
        <WeekView
          tasks={tasks}
          weekOffset={weekOffset}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      )}
    </div>
  );
}
