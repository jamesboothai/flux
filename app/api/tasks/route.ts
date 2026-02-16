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
  const { content, day_of_week, week_offset = 0 } = body;

  if (!content || day_of_week === undefined) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("weekly_tasks")
    .insert({
      content,
      day_of_week,
      week_offset,
      completed: false,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest) {
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { id, content, completed, day_of_week } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  const updates: any = { updated_at: new Date().toISOString() };
  if (content !== undefined) updates.content = content;
  if (completed !== undefined) updates.completed = completed;
  if (day_of_week !== undefined) updates.day_of_week = day_of_week;

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
