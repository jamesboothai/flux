import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET(request: NextRequest) {
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get week offset from query params
  const { searchParams } = new URL(request.url);
  const weekOffset = parseInt(searchParams.get("week") || "0", 10);

  const { data, error } = await supabase
    .from("weekly_tasks")
    .select("*")
    .eq("week_offset", weekOffset)
    .order("day_of_week", { ascending: true })
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { content, day_of_week, week_offset = 0, parent_task_id } = body;

  if (!content || day_of_week === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  // Calculate next position for top-level tasks
  let nextPosition = 0;
  if (!parent_task_id) {
    const { data: maxPosData } = await supabase
      .from("weekly_tasks")
      .select("position")
      .eq("week_offset", week_offset)
      .eq("day_of_week", day_of_week)
      .is("parent_task_id", null)
      .order("position", { ascending: false })
      .limit(1)
      .single();

    nextPosition = (maxPosData?.position ?? -1) + 1;
  }

  const insertData: any = {
    content,
    day_of_week,
    week_offset,
    completed: false,
    position: nextPosition,
  };

  if (parent_task_id) {
    insertData.parent_task_id = parent_task_id;
  }

  const { data, error } = await supabase
    .from("weekly_tasks")
    .insert(insertData)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PUT(request: NextRequest) {
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { tasks } = body;

  if (!Array.isArray(tasks) || tasks.length === 0) {
    return NextResponse.json({ error: "Missing tasks array" }, { status: 400 });
  }

  const errors: string[] = [];
  for (const { id, position } of tasks) {
    const { error } = await supabase
      .from("weekly_tasks")
      .update({ position, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) errors.push(`${id}: ${error.message}`);
  }

  if (errors.length > 0) {
    return NextResponse.json({ error: errors.join("; ") }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(request: NextRequest) {
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, content, completed, day_of_week, position } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  const updates: any = { updated_at: new Date().toISOString() };
  if (content !== undefined) updates.content = content;
  if (completed !== undefined) updates.completed = completed;
  if (day_of_week !== undefined) updates.day_of_week = day_of_week;
  if (position !== undefined) updates.position = position;

  const { data, error } = await supabase
    .from("weekly_tasks")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  const { error } = await supabase.from("weekly_tasks").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
