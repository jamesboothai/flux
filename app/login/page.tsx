"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      setError("wrong password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="w-full max-w-xs space-y-4">
        <h1 className="text-sm text-[#555] tracking-wide">thoughtstream</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="password"
          autoFocus
          disabled={loading}
          className="w-full bg-transparent border-b border-[#333] text-[#e0e0e0] py-2 text-sm placeholder-[#444] focus:outline-none focus:border-[#555] transition-colors"
        />
        {error && <p className="text-red-500/70 text-xs">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="text-xs text-[#555] hover:text-[#888] transition-colors cursor-pointer"
        >
          {loading ? "..." : "enter"}
        </button>
      </form>
    </div>
  );
}
