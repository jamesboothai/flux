import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  // Verify authentication
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token || !(await verifyToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("goals")
    .select("*")
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
  const { content, position = 0 } = body;

  if (!content) {
    return NextResponse.json(
      { error: "Missing content field" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("goals")
    .insert({
      content,
      position,
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
  const { id, content, completed, position } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing goal id" }, { status: 400 });
  }

  const updates: any = { updated_at: new Date().toISOString() };
  if (content !== undefined) updates.content = content;
  if (completed !== undefined) updates.completed = completed;
  if (position !== undefined) updates.position = position;

  const { data, error } = await supabase
    .from("goals")
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
    return NextResponse.json({ error: "Missing goal id" }, { status: 400 });
  }

  const { error } = await supabase.from("goals").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
