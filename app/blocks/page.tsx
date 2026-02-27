import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ScreenToggle } from "@/components/screen-toggle";
import { FluxShell } from "@/components/flux-shell";
import { BlocksView } from "@/components/blocks-view";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { format } from "date-fns";

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

export default async function BlocksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const valid = await verifyToken(token);
  if (!valid) redirect("/login");

  const today = format(new Date(), "yyyy-MM-dd");
  const { data, error } = await supabase
    .from("time_blocks")
    .select("*")
    .eq("block_date", today)
    .order("time_slot", { ascending: true });

  const blocks = error ? [] : data;

  return (
    <ScreenToggle>
      <FluxShell logoutAction={logout}>
        <BlocksView initialBlocks={blocks} initialDate={today} />
      </FluxShell>
    </ScreenToggle>
  );
}
