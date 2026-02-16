"use client";

import { useState, useCallback } from "react";
import { useTheme, colors } from "@/lib/theme";
import { TaskItem, WeeklyTask } from "./task-item";
import { getShortDayName, isToday, getWeekDates, buildTaskTree } from "@/lib/week-utils";
import { format } from "date-fns";

interface WeekViewProps {
  tasks: WeeklyTask[];
  weekOffset: number;
  onAddTask: (content: string, dayOfWeek: number) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  onEditTask: (id: string, content: string) => void;
  onDeleteTask: (id: string) => void;
  onAddSubtask?: (parentId: string, content: string) => void;
}

export function WeekView({
  tasks,
  weekOffset,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onAddSubtask,
}: WeekViewProps) {
  const [newTaskInputs, setNewTaskInputs] = useState<Record<number, string>>({});
  const { theme } = useTheme();
  const c = colors(theme);

  const weekDates = getWeekDates(weekOffset);

  const handleSubmit = useCallback(
    (dayOfWeek: number) => {
      const content = newTaskInputs[dayOfWeek];
      if (!content?.trim()) return;
      onAddTask(content.trim(), dayOfWeek);
      setNewTaskInputs((prev) => ({ ...prev, [dayOfWeek]: "" }));
    },
    [newTaskInputs, onAddTask]
  );

  return (
    <div className="overflow-x-auto">
      <div className="grid grid-cols-7 gap-3 min-w-[800px]">
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const date = weekDates[day];
          const dayTasks = tasks.filter((t) => t.day_of_week === day);
          const taskTree = buildTaskTree(dayTasks);
          const isTodayDate = isToday(date);

          return (
            <div
              key={day}
              className="border-r last:border-r-0 pr-3 last:pr-0"
              style={{ borderColor: c.borderSubtle }}
            >
              {/* Day header */}
              <div className="mb-4 pb-3 border-b" style={{ borderColor: c.border }}>
                <div
                  className={`text-xs tracking-wider font-medium ${
                    isTodayDate ? "font-bold" : ""
                  }`}
                  style={{ color: isTodayDate ? c.text : c.muted }}
                >
                  {getShortDayName(day)}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: c.faint }}>
                  {format(date, "MMM d")}
                </div>
              </div>

              {/* Add new task */}
              <div className="mb-3">
                <input
                  type="text"
                  value={newTaskInputs[day] || ""}
                  onChange={(e) =>
                    setNewTaskInputs((prev) => ({ ...prev, [day]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSubmit(day);
                    }
                  }}
                  placeholder="add..."
                  className="w-full bg-transparent text-xs focus:outline-none transition-colors"
                  style={{ color: c.text, caretColor: c.text }}
                />
              </div>

              {/* Task list */}
              <div className="space-y-0.5">
                {taskTree.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                    onEdit={onEditTask}
                    onDelete={onDeleteTask}
                    onAddSubtask={onAddSubtask}
                    compact
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
