"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useTheme, colors } from "@/lib/theme";
import { format } from "date-fns";

export interface TimeBlock {
  id: string;
  block_date: string;
  time_slot: string;
  content: string;
  created_at: string;
  updated_at: string | null;
}

// Generate 84 slots: 5:00 AM → 1:45 AM (wraps past midnight)
function generateTimeSlots(): string[] {
  const slots: string[] = [];
  // 5:00 (hour 5) through 23:45 (hour 23)
  for (let hour = 5; hour <= 23; hour++) {
    for (let min = 0; min < 60; min += 15) {
      slots.push(
        `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
      );
    }
  }
  // 0:00 through 1:45 (past midnight)
  for (let hour = 0; hour <= 1; hour++) {
    for (let min = 0; min < 60; min += 15) {
      slots.push(
        `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`
      );
    }
  }
  return slots;
}

const TIME_SLOTS = generateTimeSlots();

function formatSlotLabel(slot: string): string {
  const [hourStr, minStr] = slot.split(":");
  const hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 && hour < 24 ? "p" : "a";
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${displayHour}:${minStr}${ampm}`;
}

interface BlocksViewProps {
  initialBlocks: TimeBlock[];
  initialDate: string;
}

export function BlocksView({ initialBlocks, initialDate }: BlocksViewProps) {
  const [blocks, setBlocks] = useState<Map<string, TimeBlock>>(
    () => new Map(initialBlocks.map((b) => [b.time_slot, b]))
  );
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [pendingSaves, setPendingSaves] = useState<Set<string>>(new Set());
  const saveTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );
  const { theme } = useTheme();
  const c = colors(theme);

  // Auto-scroll to current time block on load
  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    if (currentDate !== today) return;

    const now = new Date();
    const currentHour = now.getHours();
    const currentMin = Math.floor(now.getMinutes() / 15) * 15;
    const currentSlot = `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`;

    setTimeout(() => {
      const el = document.getElementById(`block-${currentSlot}`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, [currentDate]);

  const isCurrentSlot = useCallback(
    (slot: string): boolean => {
      const today = format(new Date(), "yyyy-MM-dd");
      if (currentDate !== today) return false;
      const now = new Date();
      const h = now.getHours();
      const m = Math.floor(now.getMinutes() / 15) * 15;
      return (
        slot ===
        `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
      );
    },
    [currentDate]
  );

  const saveBlock = useCallback(
    (timeSlot: string, content: string) => {
      const existing = saveTimers.current.get(timeSlot);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(async () => {
        setPendingSaves((prev) => new Set(prev).add(timeSlot));
        try {
          const res = await fetch("/api/blocks", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              block_date: currentDate,
              time_slot: timeSlot,
              content,
            }),
            credentials: "include",
          });
          if (res.ok) {
            const saved = await res.json();
            setBlocks((prev) => new Map(prev).set(timeSlot, saved));
          }
        } finally {
          setPendingSaves((prev) => {
            const next = new Set(prev);
            next.delete(timeSlot);
            return next;
          });
        }
      }, 800);

      saveTimers.current.set(timeSlot, timer);
    },
    [currentDate]
  );

  const handleChange = useCallback(
    (timeSlot: string, content: string) => {
      setBlocks((prev) => {
        const next = new Map(prev);
        const existing = next.get(timeSlot);
        if (existing) {
          next.set(timeSlot, { ...existing, content });
        } else {
          next.set(timeSlot, {
            id: "",
            block_date: currentDate,
            time_slot: timeSlot,
            content,
            created_at: new Date().toISOString(),
            updated_at: null,
          });
        }
        return next;
      });
      saveBlock(timeSlot, content);
    },
    [currentDate, saveBlock]
  );

  const navigateDay = useCallback(
    async (direction: -1 | 1) => {
      const d = new Date(currentDate + "T00:00:00");
      d.setDate(d.getDate() + direction);
      const newDate = format(d, "yyyy-MM-dd");
      setCurrentDate(newDate);

      const res = await fetch(`/api/blocks?date=${newDate}`, {
        credentials: "include",
      });
      if (res.ok) {
        const data: TimeBlock[] = await res.json();
        setBlocks(new Map(data.map((b) => [b.time_slot, b])));
      }
    },
    [currentDate]
  );

  const goToToday = useCallback(async () => {
    const today = format(new Date(), "yyyy-MM-dd");
    setCurrentDate(today);

    const res = await fetch(`/api/blocks?date=${today}`, {
      credentials: "include",
    });
    if (res.ok) {
      const data: TimeBlock[] = await res.json();
      setBlocks(new Map(data.map((b) => [b.time_slot, b])));
    }
  }, []);

  const isToday = currentDate === format(new Date(), "yyyy-MM-dd");

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2
            className="text-sm font-medium transition-colors"
            style={{ color: c.text }}
          >
            {format(new Date(currentDate + "T00:00:00"), "EEEE, MMMM d")}
          </h2>
          <div className="flex gap-3 mt-2">
            <button
              onClick={() => navigateDay(-1)}
              className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.muted }}
            >
              &larr; prev
            </button>
            {!isToday && (
              <button
                onClick={goToToday}
                className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
                style={{ color: c.muted }}
              >
                today
              </button>
            )}
            <button
              onClick={() => navigateDay(1)}
              className="text-[10px] hover:opacity-70 transition-opacity cursor-pointer"
              style={{ color: c.muted }}
            >
              next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Time blocks */}
      <div>
        {TIME_SLOTS.map((slot) => {
          const block = blocks.get(slot);
          const current = isCurrentSlot(slot);
          const saving = pendingSaves.has(slot);

          return (
            <div
              key={slot}
              id={`block-${slot}`}
              className="flex items-center gap-3 py-1.5 border-b transition-colors"
              style={{
                borderColor: c.borderSubtle,
                borderLeftWidth: current ? "2px" : "0px",
                borderLeftColor: current ? c.muted : "transparent",
                paddingLeft: current ? "8px" : "0px",
              }}
            >
              <span
                className="text-[10px] w-10 shrink-0 tabular-nums transition-colors"
                style={{ color: current ? c.text : c.faint }}
              >
                {formatSlotLabel(slot)}
              </span>

              <input
                type="text"
                value={block?.content ?? ""}
                onChange={(e) => handleChange(slot, e.target.value)}
                className="flex-1 min-w-0 bg-transparent text-xs focus:outline-none border-none p-0 h-6"
                style={{
                  color: c.text,
                  caretColor: c.text,
                }}
              />

              {saving && (
                <span
                  className="text-[9px] shrink-0 transition-colors"
                  style={{ color: c.faintest }}
                >
                  ...
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
