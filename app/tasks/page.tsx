import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ScreenToggle } from "@/components/screen-toggle";
import { FluxShell } from "@/components/flux-shell";
import { WeeklyPlanner } from "@/components/weekly-planner";
import { GoalsSection } from "@/components/goals-section";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { getWeekStartDate } from "@/lib/week-utils";

async function logout() {
  "use server";
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

export default async function TasksPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) redirect("/login");

  const valid = await verifyToken(token);
  if (!valid) redirect("/login");

  // Fetch current week tasks using absolute week_start date
  const currentWeekStart = getWeekStartDate(0);
  const { data: tasksData, error: tasksError } = await supabase
    .from("weekly_tasks")
    .select("*")
    .eq("week_start", currentWeekStart)
    .order("day_of_week", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  // Fetch goals
  const { data: goalsData, error: goalsError } = await supabase
    .from("goals")
    .select("*")
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  const tasks = tasksError ? [] : tasksData;
  const goals = goalsError ? [] : goalsData;

  return (
    <ScreenToggle>
      <FluxShell logoutAction={logout}>
        <WeeklyPlanner initialTasks={tasks} initialGoals={goals} />
      </FluxShell>
    </ScreenToggle>
  );
}
