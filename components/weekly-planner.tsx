"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useTheme, colors } from "@/lib/theme";
import { WeeklyTask } from "./task-item";
import { DayView } from "./day-view";
import { WeekView } from "./week-view";
import { GoalsSection, Goal } from "./goals-section";
import {
  formatWeekRange,
  getWeekDates,
  getTodayDayOfWeek,
} from "@/lib/week-utils";

interface WeeklyPlannerProps {
  initialTasks: WeeklyTask[];
  initialGoals: Goal[];
}

type ViewMode = "day" | "week" | "goals";

export function WeeklyPlanner({ initialTasks, initialGoals }: WeeklyPlannerProps) {
  const [tasks, setTasks] = useState<WeeklyTask[]>(initialTasks);
  const [weekOffset, setWeekOffset] = useState(0);
  const [currentDay, setCurrentDay] = useState(getTodayDayOfWeek());
  const [viewMode, setViewMode] = useState<ViewMode>("day");
  const { theme } = useTheme();
  const c = colors(theme);

  // Load view preference from localStorage (but never persist goals view)
  useEffect(() => {
    const saved = localStorage.getItem("flux-tasks-view") as ViewMode | null;
    if (saved === "day" || saved === "week") setViewMode(saved);
  }, []);

  // Toggle between day and week views
  const toggleTaskView = useCallback(() => {
    setViewMode((mode) => {
      if (mode === "goals") return "day";
      const next = mode === "day" ? "week" : "day";
      localStorage.setItem("flux-tasks-view", next);
      return next;
    });
  }, []);

  // Toggle goals view
  const toggleGoalsView = useCallback(() => {
    setViewMode((mode) => mode === "goals" ? "day" : "goals");
  }, []);

  // Fetch tasks when week changes
  useEffect(() => {
    async function fetchTasks() {
      try {
        const res = await fetch(`/api/tasks?week=${weekOffset}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        } else {
          console.error('Failed to fetch tasks for week', weekOffset, 'Status:', res.status);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    }
    fetchTasks();
  }, [weekOffset]);

  const handleAddTask = useCallback(
    async (content: string, dayOfWeek: number) => {
      try {
        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content, day_of_week: dayOfWeek, week_offset: weekOffset }),
          credentials: 'include',
        });

        if (!res.ok) {
          const error = await res.json();
          console.error('Failed to create task:', error, 'Status:', res.status);
          return;
        }

        // Refetch all tasks to ensure sync with database
        const refetchRes = await fetch(`/api/tasks?week=${weekOffset}`, {
          credentials: 'include',
        });

        if (!refetchRes.ok) {
          console.error('Failed to refetch tasks after creation. Status:', refetchRes.status);
          return;
        }

        const data = await refetchRes.json();
        setTasks(data);
      } catch (error) {
        console.error('Error adding task:', error);
      }
    },
    [weekOffset]
  );

  const handleToggleTask = useCallback(async (id: string, completed: boolean) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, completed }),
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Failed to toggle task. Status:', res.status);
        return;
      }

      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  }, []);

  const handleEditTask = useCallback(async (id: string, content: string) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, content }),
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Failed to edit task. Status:', res.status);
        return;
      }

      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
    } catch (error) {
      console.error('Error editing task:', error);
    }
  }, []);

  const handleDeleteTask = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/tasks?id=${id}`, {
        method: "DELETE",
        credentials: 'include',
      });

      if (!res.ok) {
        console.error('Failed to delete task. Status:', res.status);
        return;
      }

      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  }, []);

  const reorderTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleReorderTasks = useCallback(
    (dayOfWeek: number, reorderedTasks: WeeklyTask[]) => {
      const updatedPositions = reorderedTasks.map((task, index) => ({
        id: task.id,
        position: index,
      }));

      // Optimistic update
      setTasks((prev) => {
        const otherTasks = prev.filter(
          (t) => t.day_of_week !== dayOfWeek || t.parent_task_id !== null
        );
        const reorderedWithPositions = reorderedTasks.map((task, index) => ({
          ...task,
          position: index,
        }));
        return [...otherTasks, ...reorderedWithPositions];
      });

      // Debounce the API call
      if (reorderTimeoutRef.current) clearTimeout(reorderTimeoutRef.current);
      reorderTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch("/api/tasks", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tasks: updatedPositions }),
            credentials: "include",
          });
          if (!res.ok) {
            console.error("Failed to save task order. Status:", res.status);
          }
        } catch (error) {
          console.error("Error saving task order:", error);
        }
      }, 300);
    },
    []
  );

  const handleAddSubtask = useCallback(
    async (parentId: string, content: string) => {
      try {
        // Find parent task to get its day_of_week and week_offset
        const parentTask = tasks.find(t => t.id === parentId);
        if (!parentTask) return;

        const res = await fetch("/api/tasks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content,
            day_of_week: parentTask.day_of_week,
            week_offset: parentTask.week_offset,
            parent_task_id: parentId
          }),
          credentials: 'include',
        });

        if (!res.ok) {
          console.error('Failed to create subtask. Status:', res.status);
          return;
        }

        // Refetch to get updated task tree
        const refetchRes = await fetch(`/api/tasks?week=${weekOffset}`, {
          credentials: 'include',
        });

        if (!refetchRes.ok) {
          console.error('Failed to refetch tasks after creating subtask. Status:', refetchRes.status);
          return;
        }

        const data = await refetchRes.json();
        setTasks(data);
      } catch (error) {
        console.error('Error adding subtask:', error);
      }
    },
    [tasks, weekOffset]
  );

  const weekDates = getWeekDates(weekOffset);
  const weekRange = formatWeekRange(weekDates);

  return (
    <div>
      {/* Header with navigation and view toggle */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-sm font-medium" style={{ color: c.text }}>
            {viewMode === "goals" ? "Big Picture Goals" : weekRange}
          </h2>
          {viewMode !== "goals" && (
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
          )}
        </div>

        <div className="flex gap-3">
          {viewMode !== "goals" && (
            <button
              onClick={toggleTaskView}
              className="text-[10px] tracking-wider hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.faint }}
            >
              {viewMode === "day" ? "week view" : "day view"}
            </button>
          )}
          <button
            onClick={toggleGoalsView}
            className="text-[10px] tracking-wider hover:opacity-70 transition-opacity cursor-pointer"
            style={{ color: c.faint }}
          >
            {viewMode === "goals" ? "back to tasks" : "goals"}
          </button>
        </div>
      </div>

      {/* Render appropriate view */}
      {viewMode === "goals" ? (
        <GoalsSection initialGoals={initialGoals} />
      ) : viewMode === "day" ? (
        <DayView
          tasks={tasks}
          currentDay={currentDay}
          weekOffset={weekOffset}
          onDayChange={setCurrentDay}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onAddSubtask={handleAddSubtask}
          onReorderTasks={handleReorderTasks}
        />
      ) : (
        <WeekView
          tasks={tasks}
          weekOffset={weekOffset}
          onAddTask={handleAddTask}
          onToggleTask={handleToggleTask}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onAddSubtask={handleAddSubtask}
          onReorderTasks={handleReorderTasks}
        />
      )}
    </div>
  );
}
