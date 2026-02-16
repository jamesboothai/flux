import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThoughtFeed } from "@/components/thought-feed";
import { ScreenToggle } from "@/components/screen-toggle";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

export default async function Home() {
  // Double-check auth server-side
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const valid = await verifyToken(token);
  if (!valid) redirect("/login");

  const { data, error } = await supabase
    .from("thoughts")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  const thoughts = error ? [] : data;
  const nextCursor =
    thoughts.length === 50 ? thoughts[thoughts.length - 1].created_at : null;

  return (
    <ScreenToggle>
      <main className="max-w-2xl mx-auto px-6 py-12">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-xs text-[#333] tracking-widest">thoughtstream</h1>
            <p className="text-[10px] text-[#222] mt-0.5">by james booth</p>
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="text-[10px] text-[#333] hover:text-[#555] transition-colors cursor-pointer"
            >
              logout
            </button>
          </form>
        </header>

        <ThoughtFeed initialThoughts={thoughts} initialCursor={nextCursor} />
      </main>
    </ScreenToggle>
  );
}
