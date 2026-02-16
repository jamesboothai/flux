"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { ThoughtInput } from "./thought-input";
import { ThoughtEntry, Thought } from "./thought-entry";

interface ThoughtFeedProps {
  initialThoughts: Thought[];
  initialCursor: string | null;
}

export function ThoughtFeed({
  initialThoughts,
  initialCursor,
}: ThoughtFeedProps) {
  const [thoughts, setThoughts] = useState<Thought[]>(initialThoughts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const toastTimeout = useRef<ReturnType<typeof setTimeout>>(null);

  function showToast(message: string) {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast(message);
    toastTimeout.current = setTimeout(() => setToast(null), 2000);
  }

  const handleSubmit = useCallback(async (content: string) => {
    const optimisticId = crypto.randomUUID();
    const optimistic: Thought = {
      id: optimisticId,
      content,
      created_at: new Date().toISOString(),
      updated_at: null,
    };

    setThoughts((prev) => [optimistic, ...prev]);
    setNewIds((prev) => new Set(prev).add(optimisticId));

    const res = await fetch("/api/thoughts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (res.ok) {
      const real: Thought = await res.json();
      setThoughts((prev) =>
        prev.map((t) => (t.id === optimisticId ? real : t))
      );
      setNewIds((prev) => {
        const next = new Set(prev);
        next.delete(optimisticId);
        next.add(real.id);
        return next;
      });
    } else {
      setThoughts((prev) => prev.filter((t) => t.id !== optimisticId));
      showToast("failed to post");
    }
  }, []);

  const handleEdit = useCallback(async (id: string, content: string) => {
    setThoughts((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, content, updated_at: new Date().toISOString() }
          : t
      )
    );

    const res = await fetch(`/api/thoughts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });

    if (!res.ok) {
      showToast("failed to save edit");
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    const prev = thoughts;
    setThoughts((t) => t.filter((thought) => thought.id !== id));
    showToast("thought removed");

    const res = await fetch(`/api/thoughts/${id}`, { method: "DELETE" });
    if (!res.ok) {
      setThoughts(prev);
      showToast("failed to delete");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadMore() {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);

    const res = await fetch(`/api/thoughts?cursor=${cursor}`);
    if (res.ok) {
      const { thoughts: more, nextCursor } = await res.json();
      setThoughts((prev) => [...prev, ...more]);
      setCursor(nextCursor);
    }
    setLoadingMore(false);
  }

  // Infinite scroll
  useEffect(() => {
    if (!cursor) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById("load-more-sentinel");
    if (sentinel) observer.observe(sentinel);

    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, loadingMore]);

  return (
    <div>
      <ThoughtInput onSubmit={handleSubmit} />

      <div>
        {thoughts.map((thought) => (
          <ThoughtEntry
            key={thought.id}
            thought={thought}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isNew={newIds.has(thought.id)}
          />
        ))}
      </div>

      {cursor && (
        <div id="load-more-sentinel" className="py-8 text-center">
          {loadingMore && (
            <span className="text-[10px] text-[#333]">loading...</span>
          )}
        </div>
      )}

      {!cursor && thoughts.length > 0 && (
        <p className="text-[10px] text-[#222] text-center py-8">
          end of stream
        </p>
      )}

      {thoughts.length === 0 && (
        <p className="text-[10px] text-[#333] text-center py-16">
          nothing here yet
        </p>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 text-[11px] text-[#888] bg-[#1a1a1a] px-4 py-2 rounded">
          {toast}
        </div>
      )}
    </div>
  );
}
