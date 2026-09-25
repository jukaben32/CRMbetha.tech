"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export interface AddTaskState {
  error?: string;
}

export async function addTask(
  leadId: string,
  _prevState: AddTaskState,
  formData: FormData
): Promise<AddTaskState> {
  const title = formData.get("title");
  const dueAt = formData.get("due_at");

  if (typeof title !== "string" || !title.trim()) {
    return { error: "Escribe qué hay que hacer." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("tasks").insert({
    lead_id: leadId,
    title: title.trim(),
    due_at: typeof dueAt === "string" && dueAt ? new Date(dueAt).toISOString() : null,
  });

  if (error) {
    return { error: "No se pudo guardar la tarea." };
  }

  revalidatePath(`/leads/${leadId}`);
  return {};
}

export async function toggleTask(taskId: string, leadId: string, done: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("tasks").update({ done }).eq("id", taskId);
  revalidatePath(`/leads/${leadId}`);
}
