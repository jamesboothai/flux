import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ThoughtFeed } from "@/components/thought-feed";
import { ScreenToggle } from "@/components/screen-toggle";
import { FluxShell } from "@/components/flux-shell";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

export default async function Home() {
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
      <FluxShell logoutAction={logout}>
        <ThoughtFeed initialThoughts={thoughts} initialCursor={nextCursor} />
      </FluxShell>
    </ScreenToggle>
  );
}
