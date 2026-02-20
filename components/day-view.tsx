"use client";

import { useState, useCallback } from "react";
import { Reorder } from "framer-motion";
import { useTheme, colors } from "@/lib/theme";
import { TaskItem, WeeklyTask } from "./task-item";
import { getDayName, isToday, getWeekDates, buildTaskTree } from "@/lib/week-utils";
import { format } from "date-fns";

interface DayViewProps {
  tasks: WeeklyTask[];
  currentDay: number;
  weekOffset: number;
  onDayChange: (day: number) => void;
  onAddTask: (content: string, dayOfWeek: number) => void;
  onToggleTask: (id: string, completed: boolean) => void;
  onEditTask: (id: string, content: string) => void;
  onDeleteTask: (id: string) => void;
  onAddSubtask?: (parentId: string, content: string) => void;
  onReorderTasks: (dayOfWeek: number, tasks: WeeklyTask[]) => void;
}

export function DayView({
  tasks,
  currentDay,
  weekOffset,
  onDayChange,
  onAddTask,
  onToggleTask,
  onEditTask,
  onDeleteTask,
  onAddSubtask,
  onReorderTasks,
}: DayViewProps) {
  const [newTaskContent, setNewTaskContent] = useState("");
  const { theme } = useTheme();
  const c = colors(theme);

  const dayTasks = tasks.filter((t) => t.day_of_week === currentDay);
  const taskTree = buildTaskTree(dayTasks);
  const weekDates = getWeekDates(weekOffset);
  const currentDate = weekDates[currentDay];

  const handleSubmit = useCallback(() => {
    if (!newTaskContent.trim()) return;
    onAddTask(newTaskContent.trim(), currentDay);
    setNewTaskContent("");
  }, [newTaskContent, currentDay, onAddTask]);

  return (
    <div>
      {/* Day selector */}
      <div
        className="flex gap-2 mb-6 pb-4 border-b overflow-x-auto"
        style={{ borderColor: c.border }}
      >
        {[0, 1, 2, 3, 4, 5, 6].map((day) => {
          const date = weekDates[day];
          const isSelected = day === currentDay;
          const isTodayDate = isToday(date);

          return (
            <button
              key={day}
              onClick={() => onDayChange(day)}
              className={`px-3 py-1.5 text-xs rounded transition-colors shrink-0 ${
                isSelected ? "font-medium" : ""
              }`}
              style={{
                backgroundColor: isSelected ? c.border : "transparent",
                color: isSelected
                  ? c.text
                  : isTodayDate
                  ? c.muted
                  : c.faint,
              }}
            >
              <div className="text-center">
                <div className="tracking-wider">
                  {getDayName(day).substring(0, 3)}
                </div>
                <div
                  className="text-[10px] mt-0.5"
                  style={{ color: isSelected ? c.muted : c.faintest }}
                >
                  {format(date, "MMM d")}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Current day header */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-1" style={{ color: c.text }}>
          {getDayName(currentDay)}
        </h2>
        <p className="text-[10px]" style={{ color: c.faint }}>
          {format(currentDate, "MMMM d, yyyy")}
          {isToday(currentDate) && " (today)"}
        </p>
      </div>

      {/* Add new task */}
      <div
        className="pb-4 mb-6 border-b transition-colors"
        style={{ borderColor: c.border }}
      >
        <input
          type="text"
          value={newTaskContent}
          onChange={(e) => setNewTaskContent(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="add a task..."
          className="w-full bg-transparent text-sm focus:outline-none leading-relaxed transition-colors"
          style={{ color: c.text, caretColor: c.text }}
        />
        {newTaskContent.trim() && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px]" style={{ color: c.faint }}>
              press enter to add
            </span>
            <button
              onClick={handleSubmit}
              className="text-xs hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.muted }}
            >
              add
            </button>
          </div>
        )}
      </div>

      {/* Task list */}
      {taskTree.length === 0 ? (
        <p className="text-sm italic py-4" style={{ color: c.faint }}>
          No tasks for this day
        </p>
      ) : (
        <Reorder.Group
          axis="y"
          values={taskTree}
          onReorder={(newOrder) => onReorderTasks(currentDay, newOrder)}
          as="div"
          className="space-y-1"
        >
          {taskTree.map((task) => (
            <Reorder.Item
              key={task.id}
              value={task}
              as="div"
              whileDrag={{
                scale: 1.02,
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                cursor: "grabbing",
              }}
            >
              <TaskItem
                task={task}
                onToggle={onToggleTask}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onAddSubtask={onAddSubtask}
              />
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
